export function RenderTabs(res: any) {
  return /* HTML */ `
    <ul class="flex-wrap tabs-nav">
      <li class="nav-item">Scores</li>
      <li class="nav-item">
        Components
        ${res.nonDsysComponents.length > 0
          ? `<span class="notification"></span>`
          : ""}
      </li>
      <li class="nav-item">
        Typography
        ${res.nonDsysText.length > 0
          ? `<span class="notification"></span>`
          : ""}
      </li>
      <li class="nav-item">
        Colors
        ${res.nonDsysColorFills.length > 0
          ? `<span class="notification"></span>`
          : ""}
      </li>
    </ul>
  `;
}
