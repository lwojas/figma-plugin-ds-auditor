import { renderView } from "./tools/renderView";
import { ConfigView } from "./views/ViewConfig";
import { ViewLoader } from "./views/ViewLoader";
import { ViewIntro } from "./views/ViewIntro";
import { ViewResults } from "./views/ViewResults";

function StartApp() {
  renderView(ConfigView);
}

StartApp();

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (msg.type === "config-data") {
    (document.getElementById("apiKey") as HTMLInputElement).value =
      msg.config.figmaApiKey || "";
  }
  if (msg.type === "api-error") {
    (document.getElementById("loader") as HTMLElement).style.display = "none";
    (document.getElementById("errorPage") as HTMLElement).style.display =
      "block";
  }
  if (msg.type === "key-set") {
    renderView(ViewIntro);
  }
  if (msg.type === "show-loader") renderView(() => ViewLoader(msg.data));
  if (msg.type === "error") {
    (document.getElementById("loader") as HTMLElement).style.display = "none";
    (document.getElementById("intro") as HTMLElement).style.display = "block";
    alert(msg.message);
  }
  if (msg.type === "audit-results") {
    renderView(() => ViewResults(msg.data));
  }
};
