export function renderView(view: Function) {
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
