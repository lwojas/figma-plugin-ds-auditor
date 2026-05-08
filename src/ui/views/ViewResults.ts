import { RenderTabs } from "../components/Tabs";
import { renderView } from "../tools/renderView";
import {
  calculateScore,
  calculateComponentScore,
  calculateTextScore,
  calculateColorScore,
} from "../tools/scores";
import { ViewIntro } from "./ViewIntro";

function renderColorTokensTab(res: any) {
  return /* HTML */ `
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
              >${Object.keys(res.dsysColorTokens).length +
              Object.keys(res.nonDsysColorTokens).length}</strong
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
  `;
}

export function ViewResults(res: any) {
  const score = calculateScore(res);
  const chartData = [
    calculateScore(res),
    calculateComponentScore(res) * 100,
    calculateTextScore(res) * 100,
    calculateColorScore(res) * 100,
  ];
  return {
    html: /* HTML */ `
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
                  >${Object.keys(res.uniqueDsysComponents).length +
                  Object.keys(res.uniqueNonDsysComponents).length}</strong
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
                  >${Object.keys(res.dsysTextStyles).length +
                  Object.keys(res.nonDsysTextStyles).length}</strong
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
    `,
    bind() {
      (document.getElementById("backButton") as HTMLButtonElement).onclick =
        () => {
          renderView(() => ViewIntro());
        };
      const sections = document.getElementsByClassName("tab-section");
      const tabs = document.getElementsByClassName("nav-item");
      const clickboxes = document.getElementsByClassName("click-box");

      for (let i = 0; i < tabs.length; i++) {
        tabs[i].onclick = (event: any) => {
          for (var e = 0; e < sections.length; e++) {
            tabs[e].style.borderBottom = "initial";
            tabs[e].style.fontWeight = 400;
            sections[e].style.display = "none";
          }
          sections[i].style.display = "block";
          event.currentTarget.style.borderBottom =
            "3px solid var(--button-primary)";
          event.currentTarget.style.fontWeight = 900;
        };
      }
      for (let i = 1; i < clickboxes.length + 1; i++) {
        clickboxes[i - 1].onclick = (event: any) => {
          for (var e = 0; e < sections.length; e++) {
            //   console.log(tabs[e].style);
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

      // Used to select erroneous nodes directly from the plugin
      function selectNode(nodeId: any) {
        parent.postMessage(
          { pluginMessage: { type: "select-node", nodeId } },
          "*",
        );
      }

      document.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;

        if (target.matches("a[data-id]")) {
          const id = target.getAttribute("data-id");
          selectNode(id);
        }
      });
    },
  };
}

function renderBarChart(data: number[]) {
  const chart = `
        <div class="chart-container mt-200">
            <h4 class="text-medium">100%</h4>
            <div class="bar-chart flex-row">
                ${data
                  .map(
                    (value, index) =>
                      `<div class="bar-chart-element" style="height: ${value}%"><div class="grow-bar" style="background-color:${
                        index === 0 ? "var(--data-1)" : "var(--data-2)"
                      }"></div></div>`,
                  )
                  .join("")}
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

function renderList(label: string, nodes: any[]) {
  if (!nodes.length) return "";
  const items = nodes
    .map((node) => {
      return `<li><a data-id="${node.id}">${node.name}</a></li>`;
    })
    .join("");
  return /* HTML */ `<details class="collapsible mt-200">
    <summary>${label}</summary>
    <ul class="content list">
      ${items}
    </ul>
  </details>`;
}
