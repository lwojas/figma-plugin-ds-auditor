import { renderView } from "../tools/renderView";
import { ViewLoader } from "./ViewLoader";

export function ViewIntro() {
  return {
    html: /* HTML */ ` <div id="intro" class="section">
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
    </div>`,
    bind() {
      const auditButton = document.getElementById("audit") as HTMLButtonElement;
      const libraryCheckbox = document.getElementById(
        "libraryCheckbox",
      ) as HTMLInputElement;
      auditButton.onclick = () => {
        renderView(() => ViewLoader("Auditing selected design(s)..."));
        parent.postMessage(
          {
            pluginMessage: {
              type: "audit-request",
              data: { usePrivateComponents: libraryCheckbox.checked },
            },
          },
          "*",
        );
      };
    },
  };
}
