import { renderView } from "../tools/renderView";
import { ViewLoader } from "./ViewLoader";

function ShowHelp() {
  return /* HTML */ ` 
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
  </details>`;
}

export function ConfigView() {
  return {
    html: /* HTML */ ` <div id="config" class="section">
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
    </div>`,
    bind() {
      const setKeyButton = document.getElementById("setKey");
      if (setKeyButton) {
        setKeyButton.addEventListener("click", () => {
          const apiKey = (document.getElementById("apiKey") as HTMLInputElement)
            .value;
          const useCache = (
            document.getElementById("useCacheCheckbox") as HTMLInputElement
          ).checked;
          // Handle the save logic here
          if (!apiKey) {
            alert("Please enter a valid API key.");
            return;
          }
          renderView(() => ViewLoader("Loading Design System libraries..."));
          parent.postMessage(
            {
              pluginMessage: {
                type: "set-config",
                config: { apiKey, useCache },
              },
            },
            "*",
          );
        });
      }
    },
  };
}
