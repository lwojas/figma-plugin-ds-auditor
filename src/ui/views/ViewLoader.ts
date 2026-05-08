import { renderView } from "../tools/renderView";

export function ViewLoader(string: string = "Loading...") {
  return {
    html: /* HTML */ ` <div class="flex-col loader-container">
      <span class="loader"></span>
      ${string ? `<p>${string}</p>` : ""}
    </div>`,
  };
}
