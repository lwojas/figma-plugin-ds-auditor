(() => {
  // src/ui/tools/renderView.ts
  function renderView(view) {
    const appContainer = document.getElementById("app");
    if (!appContainer) return;
    const viewResult = view();
    if (viewResult.html) {
      appContainer.innerHTML = viewResult.html;
    }
    if (viewResult.bind) {
      viewResult.bind();
    }
  }

  // src/ui/views/ViewLoader.ts
  function ViewLoader(string = "Loading...") {
    return {
      html: (
        /* HTML */
        ` <div class="flex-col loader-container">
      <span class="loader"></span>
      ${string ? `<p>${string}</p>` : ""}
    </div>`
      )
    };
  }

  // src/ui/views/ViewConfig.ts
  function ShowHelp() {
    return (
      /* HTML */
      ` 
  <details class="section-debug mt-200">
    <summary>Help</summary>
    <h4 class="mt-100">How do I generate a Personal Access Token?</h4>
      <li>
        From the file browser, click the account menu in the top-left corner and
        select Settings.
      </li>
      <li>Select the Security tab.</li>
      <li>
        Scroll to the Personal access tokens section, then click Generate new
        token.
      </li>
      <li>
        Enter a name for your new token, assign the scopes you want, and press
        Return / Enter. For a complete list of the scopes you can assign to your
        personal access token, see the developer documentation.
      </li>
      <li>Copy the token that is generated</li>
    </ol>
    <a
      class="text-link"
      href="https://help.figma.com/hc/en-us/articles/8085703771159-Manage-personal-access-tokens"
      target="_blank"
      >See full instructions</a
    >
  </details>`
    );
  }
  function ConfigView() {
    return {
      html: (
        /* HTML */
        ` <div id="config" class="section">
      <p>Enter your Figma personal access token:</p>
      <input id="apiKey" placeholder="Figma API Key" type="text" />
      <div class="flex-row mt-100">
        <div>
          <input
            class="checkbox"
            type="checkbox"
            id="useCacheCheckbox"
            name="Cache Library"
            value="true"
            checked="true"
          />
        </div>
        <span class="text-small">Download the latest DSYS libraries</span>
      </div>
      <button class="mt-100" id="setKey">Save & Continue</button>
      ${ShowHelp()}
    </div>`
      ),
      bind() {
        const setKeyButton = document.getElementById("setKey");
        if (setKeyButton) {
          setKeyButton.addEventListener("click", () => {
            const apiKey = document.getElementById("apiKey").value;
            const useCache = document.getElementById("useCacheCheckbox").checked;
            if (!apiKey) {
              alert("Please enter a valid API key.");
              return;
            }
            renderView(() => ViewLoader("Loading Design System libraries..."));
            parent.postMessage(
              {
                pluginMessage: {
                  type: "set-config",
                  config: { apiKey, useCache }
                }
              },
              "*"
            );
          });
        }
      }
    };
  }

  // src/ui/views/ViewIntro.ts
  function ViewIntro() {
    return {
      html: (
        /* HTML */
        ` <div id="intro" class="section">
      <p>Please make a selection</p>
      <div class="flex-row mt-200">
        <div>
          <input
            class="checkbox"
            type="checkbox"
            id="libraryCheckbox"
            name="Include Library"
            value="true"
            checked
          />
        </div>
        <span class="text-small"
          >Include private components in audit (eg. ".Hint")</span
        >
      </div>
      <button class="mt-200" id="audit">Audit Design</button>
    </div>`
      ),
      bind() {
        const auditButton = document.getElementById("audit");
        const libraryCheckbox = document.getElementById(
          "libraryCheckbox"
        );
        auditButton.onclick = () => {
          renderView(() => ViewLoader("Auditing selected design(s)..."));
          parent.postMessage(
            {
              pluginMessage: {
                type: "audit-request",
                data: { usePrivateComponents: libraryCheckbox.checked }
              }
            },
            "*"
          );
        };
      }
    };
  }

  // src/ui/components/Tabs.ts
  function RenderTabs(res) {
    return (
      /* HTML */
      `
    <ul class="flex-wrap tabs-nav">
      <li class="nav-item">Scores</li>
      <li class="nav-item">
        Components
        ${res.nonDsysComponents.length > 0 ? `<span class="notification"></span>` : ""}
      </li>
      <li class="nav-item">
        Typography
        ${res.nonDsysText.length > 0 ? `<span class="notification"></span>` : ""}
      </li>
      <li class="nav-item">
        Colors
        ${res.nonDsysColorFills.length > 0 ? `<span class="notification"></span>` : ""}
      </li>
    </ul>
  `
    );
  }

  // src/ui/tools/scores.ts
  function calculateScore(data, targetCoverage = 0.5) {
    const componentScore = calculateComponentScore(data);
    const textScore = calculateTextScore(data);
    const colorScore = calculateColorScore(data);
    let weightedScore = componentScore * 0.5 + textScore * 0.3 + colorScore * 0.2;
    console.log("Weighted score before penalty: ", weightedScore);
    return Math.round(weightedScore * 100);
  }
  function calculateComponentScore(data) {
    const {
      uniqueDsysComponents,
      uniqueNonDsysComponents,
      nonDsysComponents,
      totalComponents
    } = data;
    if (totalComponents === 0) return 0;
    const instanceScore = 1 - nonDsysComponents.length / totalComponents;
    const uniqueDsys = Object.keys(uniqueDsysComponents).length;
    const uniqueTotal = uniqueDsys + Object.keys(uniqueNonDsysComponents).length;
    console.log(uniqueTotal);
    const uniqueScore = uniqueTotal > 0 ? uniqueDsys / uniqueTotal : 0;
    return instanceScore * 0.7 + uniqueScore * 0.3;
  }
  function calculateTextScore(data) {
    const totalTextNodes = Math.max(data.totalTextNodes, 1);
    const styledScore = data.dsysStyledTextCount / totalTextNodes;
    const uniqueDsysTextStyleCount = Object.keys(data.dsysTextStyles).length;
    const uniqueNonDsysTextStyleCount = Object.keys(
      data.nonDsysTextStyles
    ).length;
    const uniqueTotal = uniqueDsysTextStyleCount + uniqueNonDsysTextStyleCount;
    const uniqueScore = uniqueDsysTextStyleCount / Math.max(uniqueTotal, 1);
    return styledScore * 0.7 + uniqueScore * 0.3;
  }
  function calculateColorScore(data) {
    const instanceScore = 1 - data.nonDsysColorFills.length / Math.max(data.totalColors, 1);
    const uniqueDsysCount = Object.keys(data.dsysColorTokens).length;
    const uniqueNonDsysCount = Object.keys(data.nonDsysColorTokens).length;
    const uniqueTotal = uniqueDsysCount + uniqueNonDsysCount;
    const uniqueScore = uniqueDsysCount / Math.max(uniqueTotal, 1);
    return instanceScore * 0.7 + uniqueScore * 0.3;
  }

  // src/ui/views/ViewResults.ts
  function renderColorTokensTab(res) {
    return (
      /* HTML */
      `
    <div class="section tab-section">
      <h3>Color Tokens</h3>
      <div class="flex-wrap">
        <div class="flex-col content-box">
          <span><strong class="text-large">${res.totalColors}</strong></span>
          <span class="text-small">Total colors</span>
        </div>
        <div class="flex-col content-box">
          <span
            ><strong class="text-large"
              >${res.totalDsysColorTokens}</strong
            ></span
          >
          <span class="text-small">DSYS colors</span>
        </div>
        <div class="flex-col content-box">
          <span
            ><strong class="text-large"
              >${res.nonDsysColorFills.length}</strong
            ></span
          >
          <span class="text-small">Other colors</span>
        </div>
      </div>

      <h4 class="mt-150 text-medium">Unique color tokens</h4>
      <div class="flex-wrap mt-100">
        <div class="flex-col content-box">
          <span
            ><strong class="text-large"
              >${Object.keys(res.dsysColorTokens).length + Object.keys(res.nonDsysColorTokens).length}</strong
            ></span
          >
          <span class="text-small">Total unique colors</span>
        </div>
        <div class="flex-col content-box">
          <span
            ><strong class="text-large"
              >${Object.keys(res.dsysColorTokens).length}</strong
            ></span
          >
          <span class="text-small">Unique DSYS colors</span>
        </div>
        <div class="flex-col content-box">
          <span
            ><strong class="text-large"
              >${Object.keys(res.nonDsysColorTokens).length}</strong
            ></span
          >
          <span class="text-small">Unique other colors</span>
        </div>
      </div>
      ${renderList("Non-DSYS Colors", res.nonDsysColorFills)}
    </div>
  `
    );
  }
  function ViewResults(res) {
    const score = calculateScore(res);
    const chartData = [
      calculateScore(res),
      calculateComponentScore(res) * 100,
      calculateTextScore(res) * 100,
      calculateColorScore(res) * 100
    ];
    return {
      html: (
        /* HTML */
        `
      <button id="backButton">< Start over</button>
      ${RenderTabs(res)}
      <div class="tab-wrapper">
        <div class="section tab-section">
          <h3>Design System scores</h3>
          <div class="flex-wrap">
            <div class="flex-col content-box bg-fill-primary">
              <span><strong class="text-large">${score}</strong>%</span>
              <span class="text-small">Overall Score</span>
            </div>
            <div class="flex-col content-box click-box">
              <span
                ><strong class="text-large"
                  >${Math.round(calculateComponentScore(res) * 100)}</strong
                >%</span
              >
              <span class="text-small">Component Score</span>
              <div class="content-box-icon">${renderArrowSvg()}</div>
            </div>
            <div class="flex-col content-box click-box">
              <span
                ><strong class="text-large"
                  >${Math.round(calculateTextScore(res) * 100)}</strong
                >%</span
              >
              <span class="text-small">Typography Score</span>
              <div class="content-box-icon">${renderArrowSvg()}</div>
            </div>
            <div class="flex-col content-box click-box">
              <span
                ><strong class="text-large"
                  >${Math.round(calculateColorScore(res) * 100)}</strong
                >%</span
              >
              <span class="text-small">Color Token Score</span>
              <div class="content-box-icon">${renderArrowSvg()}</div>
            </div>
          </div>
          ${renderBarChart(chartData)}
        </div>
        <div class="section tab-section">
          <h3>Component instances</h3>
          <div class="flex-wrap">
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${res.totalComponents}</strong
                ></span
              >
              <span class="text-small">Total instances</span>
            </div>
            <div class="flex-col content-box bg-fill-primary">
              <span
                ><strong class="text-large"
                  >${res.dsysComponents.length}</strong
                ></span
              >
              <span class="text-small">DSYS instances</span>
            </div>
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${res.nonDsysComponents.length}</strong
                ></span
              >
              <span class="text-small">Other instances</span>
            </div>
          </div>

          <h4 class="mt-150 text-medium">Unique components</h4>
          <div class="flex-wrap mt-100">
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${Object.keys(res.uniqueDsysComponents).length + Object.keys(res.uniqueNonDsysComponents).length}</strong
                ></span
              >
              <span class="text-small">Total unique components</span>
            </div>
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${Object.keys(res.uniqueDsysComponents).length}</strong
                ></span
              >
              <span class="text-small">DSYS unique components</span>
            </div>
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${Object.keys(res.uniqueNonDsysComponents).length}</strong
                ></span
              >
              <span class="text-small">Other unique components</span>
            </div>
          </div>
          ${renderList("Non-DSYS Components", res.nonDsysComponents)}
        </div>

        <div class="section tab-section">
          <h3>Typography</h3>
          <div class="flex-wrap">
            <div class="flex-col content-box">
              <span
                ><strong class="text-large">${res.totalTextNodes}</strong></span
              >
              <span class="text-small">Total text elements</span>
            </div>
            <div class="flex-col content-box bg-fill-primary">
              <span
                ><strong class="text-large"
                  >${res.dsysStyledTextCount}</strong
                ></span
              >
              <span class="text-small">DSYS text elements</span>
            </div>
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${res.nonDsysText.length}</strong
                ></span
              >
              <span class="text-small">Other text elements</span>
            </div>
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${res.unstyledTextCount}</strong
                ></span
              >
              <span class="text-small">Unstyled text</span>
            </div>
          </div>

          <h4 class="mt-150 text-medium">Unique text styles</h4>
          <div class="flex-wrap mt-100">
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${Object.keys(res.dsysTextStyles).length + Object.keys(res.nonDsysTextStyles).length}</strong
                ></span
              >
              <span class="text-small">Total unique text styles</span>
            </div>
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${Object.keys(res.dsysTextStyles).length}</strong
                ></span
              >
              <span class="text-small">DSYS unique text styles</span>
            </div>
            <div class="flex-col content-box">
              <span
                ><strong class="text-large"
                  >${Object.keys(res.nonDsysTextStyles).length}</strong
                ></span
              >
              <span class="text-small">Other unique text styles</span>
            </div>
          </div>
          ${renderList("Non-DSYS Text:", res.nonDsysText)}
        </div>

        ${renderColorTokensTab(res)}
      </div>
    `
      ),
      bind() {
        document.getElementById("backButton").onclick = () => {
          renderView(() => ViewIntro());
        };
        const sections = document.getElementsByClassName("tab-section");
        const tabs = document.getElementsByClassName("nav-item");
        const clickboxes = document.getElementsByClassName("click-box");
        for (let i = 0; i < tabs.length; i++) {
          tabs[i].onclick = (event) => {
            for (var e = 0; e < sections.length; e++) {
              tabs[e].style.borderBottom = "initial";
              tabs[e].style.fontWeight = 400;
              sections[e].style.display = "none";
            }
            sections[i].style.display = "block";
            event.currentTarget.style.borderBottom = "3px solid var(--button-primary)";
            event.currentTarget.style.fontWeight = 900;
          };
        }
        for (let i = 1; i < clickboxes.length + 1; i++) {
          clickboxes[i - 1].onclick = (event) => {
            for (var e = 0; e < sections.length; e++) {
              tabs[e].style.borderBottom = "initial";
              tabs[e].style.fontWeight = 400;
              sections[e].style.display = "none";
            }
            sections[i].style.display = "block";
            tabs[i].style.borderBottom = "3px solid var(--button-primary)";
            tabs[i].style.fontWeight = 900;
          };
        }
        tabs[0].style.borderBottom = "3px solid var(--button-primary)";
        tabs[0].style.fontWeight = 900;
        sections[0].style.display = "block";
        function selectNode(nodeId) {
          parent.postMessage(
            { pluginMessage: { type: "select-node", nodeId } },
            "*"
          );
        }
        document.addEventListener("click", (e) => {
          const target = e.target;
          if (target.matches("a[data-id]")) {
            const id = target.getAttribute("data-id");
            selectNode(id);
          }
        });
      }
    };
  }
  function renderBarChart(data) {
    const chart = `
        <div class="chart-container mt-200">
            <h4 class="text-medium">100%</h4>
            <div class="bar-chart flex-row">
                ${data.map(
      (value, index) => `<div class="bar-chart-element" style="height: ${value}%"><div class="grow-bar" style="background-color:${index === 0 ? "var(--data-1)" : "var(--data-2)"}"></div></div>`
    ).join("")}
            </div>
            <div class="flex-row chart-x-axis space-between">
                <div><span>Overall</span></div>
                <div><span>Components</span></div>
                <div><span>Typography</span></div>
                <div><span>Colors</span></div>    
            </div>
        </div>
        `;
    return chart;
  }
  function renderArrowSvg() {
    const svg = `
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="none">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
                <g fill="currentColor">
                <path
                    d="M8.245 4.695a.75.75 0 00-.05 1.06l1.36 1.495H4.75a.75.75 0 000 1.5h4.805l-1.36 1.495a.75.75 0 001.11 1.01l2.5-2.75a.75.75 0 000-1.01l-2.5-2.75a.75.75 0 00-1.06-.05z"
                ></path>
                <path
                    fill-rule="evenodd"
                    d="M0 8a8 8 0 1116 0A8 8 0 010 8zm8-6.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13z"
                    clip-rule="evenodd"
                ></path>
                </g>
            </g>
        </svg>
        `;
    return svg;
  }
  function renderList(label, nodes) {
    if (!nodes.length) return "";
    const items = nodes.map((node) => {
      return `<li><a data-id="${node.id}">${node.name}</a></li>`;
    }).join("");
    return (
      /* HTML */
      `<details class="collapsible mt-200">
    <summary>${label}</summary>
    <ul class="content list">
      ${items}
    </ul>
  </details>`
    );
  }

  // src/ui/ui.ts
  function StartApp() {
    renderView(ConfigView);
  }
  StartApp();
  window.onmessage = (event) => {
    const msg = event.data.pluginMessage;
    if (msg.type === "config-data") {
      document.getElementById("apiKey").value = msg.config.figmaApiKey || "";
    }
    if (msg.type === "api-error") {
      document.getElementById("loader").style.display = "none";
      document.getElementById("errorPage").style.display = "block";
    }
    if (msg.type === "key-set") {
      renderView(ViewIntro);
    }
    if (msg.type === "show-loader") renderView(() => ViewLoader(msg.data));
    if (msg.type === "error") {
      document.getElementById("loader").style.display = "none";
      document.getElementById("intro").style.display = "block";
      alert(msg.message);
    }
    if (msg.type === "audit-results") {
      renderView(() => ViewResults(msg.data));
    }
  };
})();
