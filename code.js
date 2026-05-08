// code.js
const config = {
  figmaApiKey: "",
  ignoreCache: false,
  designSystemFiles: {
    components: [
      "PpmmmhMK3IFksyAVxxTYFh",
      "WJDOd6kqQ8acqBggjFyheD",
      "Xd6bY4RpC9VzTqDshVXiym",
      "6A6dRXN4kz0vh1KftfhyzB",
    ],
    textStyles: "7k3v61QvXmY0hlVTlGoeGs",
    colorStyles: "5s3SawNMBxneWcUIUnOMXo",
    deprecatedStyles: [
      // "V19YobUVrX9MhfcNPVC2JA",
      // "7k3v61QvXmY0hlVTlGoeGs",
    ],
  },
  scoringWeights: {
    components: 0.4,
    textStyles: 0.3,
    colors: 0.3,
  },
  designSystemComponentKeys: {},
  dsysLibraryOnlyComponentKeys: {},
  designSystemTextStyleKeys: {},
  // designSystemColorStyleRGBs: new Set(),
  designSystemColorVariableKeys: {},
  libraryComponentSets: {},
  deprecatedColors: {},
  deprecatedTypography: {},
};

figma.showUI(__html__, { width: 400, height: 670 });

async function startApp() {
  await figma.currentPage.loadAsync();
}
startApp();

figma.ui.onmessage = async (msg) => {
  if (msg.type === "get-config") {
    const stored = await figma.clientStorage.getAsync("apiKey");
    // console.log("Getting config", stored);
    config.figmaApiKey = stored || "";
    figma.ui.postMessage({ type: "config-data", config });
  }

  if (msg.type === "set-config") {
    // console.log("Setting config", msg.config);
    await figma.clientStorage.setAsync("apiKey", msg.config.apiKey);
    config.figmaApiKey = msg.config.apiKey;
    config.ignoreCache = msg.config.ignoreCacheFlag;
    // config.designSystemFiles = msg.config.files;
    const data = await loadDesignSystemData();
    if (!data) return;
    figma.ui.postMessage({ type: "key-set" });
  }

  if (msg.type === "audit-request") {
    console.log("Displaying config--", msg.data.usePrivateComponents, config);
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.ui.postMessage({ type: "error", message: "No selection made." });
      return;
    }

    const nodes = [];
    function traverse(node) {
      if (node.visible) {
        if ("children" in node) {
          for (let i = 0; i < node.children.length; i++) {
            traverse(node.children[i]);
          }
        }
        nodes.push(node);
      }
    }
    for (let i = 0; i < selection.length; i++) {
      traverse(selection[i]);
    }

    const results = {
      totalComponents: 0,
      dsysComponents: [],
      nonDsysComponents: [],
      uniqueDsysComponents: {},
      uniqueNonDsysComponents: {},
      framesWithoutAutoLayout: [],
      //   Colors
      nonDsysColorFills: [],
      totalColors: 0,
      nonDsysColorTokens: {},
      dsysColorTokens: {},
      totalDsysColorTokens: 0,
      //   Typography
      totalTextNodes: 0,
      dsysTextStyles: {},
      nonDsysTextStyles: {},
      nonDsysText: [],
      dsysStyledTextCount: 0,
      nonDsysStyledTextCount: 0,
      unstyledTextCount: 0,

      //   totalColorAssignments: 0,
    };

    // const dsysTextStyles = {};

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      //   console.log(node);
      //   if (!node.visible) return;

      if (node.type === "INSTANCE") {
        // console.log(node);
        const mainComponent = await node
          .getMainComponentAsync()
          .catch(() => null);
        if (mainComponent) {
          const key = mainComponent.key;
          if (config.designSystemComponentKeys[key]) {
            if (
              !msg.data.usePrivateComponents &&
              !config.dsysLibraryOnlyComponentKeys[key]
            ) {
              // do nothing
            } else {
              results.dsysComponents.push(node.id);
              results.uniqueDsysComponents[key] = 1;
              results.totalComponents++;
            }
          } else {
            results.nonDsysComponents.push({ name: node.name, id: node.id });
            results.uniqueNonDsysComponents[key] = 1;
            results.totalComponents++;
          }
        } else {
          results.totalComponents++;
        }
      }
      //   if (node.type === "FRAME") console.log(node);

      if (node.type === "FRAME" && !node.layoutMode) {
        results.framesWithoutAutoLayout.push(node.id);
      }
      //   console.log(node);

      if (node.fills && node.fills.length) {
        node.fills.forEach((fill) => {
          results.totalColors++;
          // console.log(node);
          if (fill.boundVariables && fill.boundVariables.color) {
            // Check if dsys token
            const key = sanitiseComponentKey(fill.boundVariables.color.id);
            // console.log(key);
            if (config.designSystemColorVariableKeys[key]) {
              results.dsysColorTokens[fill.boundVariables.color.id] = 1;
              results.totalDsysColorTokens++;
            } else {
              results.nonDsysColorTokens[fill.boundVariables.color.id] = 1;
              results.nonDsysColorFills.push({
                name: node.name,
                id: node.id,
              });
            }
          } else {
            results.nonDsysColorFills.push({ name: node.name, id: node.id });
          }
        });
      }

      if (node.strokes && node.strokes.length) {
        node.strokes.forEach((fill) => {
          results.totalColors++;
          if (fill.boundVariables && fill.boundVariables.color) {
            // Check if dsys token
            const key = sanitiseComponentKey(fill.boundVariables.color.id);
            // console.log(key);
            if (config.designSystemColorVariableKeys[key]) {
              results.dsysColorTokens[fill.boundVariables.color.id] = 1;
              results.totalDsysColorTokens++;
            } else {
              results.nonDsysColorTokens[fill.boundVariables.color.id] = 1;
              results.nonDsysColorFills.push({
                name: node.name,
                id: node.id,
              });
            }
          } else {
            results.nonDsysColorFills.push({ name: node.name, id: node.id });
          }
        });
      }

      if (node.type === "TEXT") {
        results.totalTextNodes++;
        const styleKey = sanitiseKey(node.textStyleId);

        // console.log("Text results running");

        if (styleKey) {
          //   console.log("style key true");
          if (config.designSystemTextStyleKeys[styleKey]) {
            results.dsysTextStyles[styleKey] = "1";

            results.dsysStyledTextCount++;
          } else {
            // results.unstyledTextCount++;

            results.nonDsysStyledTextCount++;
            results.nonDsysTextStyles[styleKey] = {
              name: node.name,
              id: node.id,
            };
            results.nonDsysText.push({ name: node.name, id: node.id });
          }
        } else {
          results.unstyledTextCount++;
          results.nonDsysText.push({ name: node.name, id: node.id });
        }
      }
    }
    console.log("Displaying results:", results);

    figma.ui.postMessage({ type: "audit-results", data: results });
  }

  if (msg.type === "select-node") {
    const node = await figma.getNodeByIdAsync(msg.nodeId);
    if (node) {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    }
  }
};

function sanitiseKey(key) {
  if (typeof key !== "string") return "";
  let sanitiseKey = key.replace(/^.:/, "");
  sanitiseKey = sanitiseKey.replace(/,.*/, "");
  return sanitiseKey;
  //   console.log("Sanitising key: ", sanitiseKey);
}

function sanitiseComponentKey(key) {
  if (typeof key !== "string") return "";
  let sanitiseKey = key.replace(/^.*?:/, "");
  sanitiseKey = sanitiseKey.replace(/\/.*/, "");
  return sanitiseKey;
  //   console.log("Sanitising key: ", sanitiseKey);
}

function normalizeRGB(color) {
  return [color.r, color.g, color.b].map((c) => Math.round(c * 255)).join(",");
}

async function loadDesignSystemData() {
  async function fetchDeprecatedStyles(fileKey, type) {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/styles`,
      {
        headers: { "X-Figma-Token": config.figmaApiKey },
      }
    );
    const data = await response.json();
    const styles = data.meta.styles;
    console.log(styles);
    for (let i = 0; i < styles.length; i++) {
      if (styles[i].style_type === "FILL") {
        config.deprecatedColors[styles[i].key] = styles[i].name;
      }
      if (styles[i].style_type === "TEXT") {
        config.deprecatedTypography[styles[i].key] = styles[i].name;
      }
    }

    // if (type === "text") {
    //   const uniqueList = {};
    //   for (let i = 0; i < data.meta.styles.length; i++) {
    //     config.designSystemTextStyleKeys[data.meta.styles[i].key] = "1";
    //   }
    // }
  }
  async function fetchFileStyles(fileKey, type) {
    console.log("Fetching file styles for ", fileKey);
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/styles`,
      {
        headers: { "X-Figma-Token": config.figmaApiKey },
      }
    );
    const data = await response.json();
    if (type === "text") {
      const uniqueList = {};
      for (let i = 0; i < data.meta.styles.length; i++) {
        config.designSystemTextStyleKeys[data.meta.styles[i].key] = "1";
      }
    }

    await figma.clientStorage.setAsync(
      "dsysTextList",
      config.designSystemTextStyleKeys
    );
  }

  async function fetchComponents(filekeys) {
    for (let i = 0; i < filekeys.length; i++) {
      const response = await fetch(
        `https://api.figma.com/v1/files/${filekeys[i]}`,
        {
          headers: { "X-Figma-Token": config.figmaApiKey },
        }
      );
      const data = await response.json();
      // console.log(data.components);
      const components = Object.values(data.components);
      for (let i = 0; i < components.length; i++) {
        config.designSystemComponentKeys[components[i].key] =
          components[i].name;
      }
      await figma.clientStorage.setAsync(
        "componentsList",
        config.designSystemComponentKeys
      );
    }
  }

  async function fetchLibraryComponents(filekeys) {
    for (let i = 0; i < filekeys.length; i++) {
      try {
        const response = await fetch(
          `https://api.figma.com/v1/files/${filekeys[i]}/components`,
          {
            headers: { "X-Figma-Token": config.figmaApiKey },
          }
        );
        if (!response.ok) {
          console.log("API Key is incorrect ----------");
          figma.ui.postMessage({ type: "api-error" });
          return false;
        }
        const data = await response.json();
        // console.log(data);
        const components = Object.values(data.meta.components);
        for (let e = 0; e < components.length; e++) {
          let componentSet = "";
          if (i === 0) {
            if (
              components[e].containing_frame &&
              components[e].containing_frame.containingComponentSet
            ) {
              componentSet =
                components[e].containing_frame.containingComponentSet.name;
            } else {
              // componentSet = components[e].name;
            }
            if (componentSet) {
              config.libraryComponentSets[componentSet] = componentSet;
            } else {
              componentSet = components[e].name;
              config.libraryComponentSets[components[e].name] =
                components[e].name;
            }
          }

          config.dsysLibraryOnlyComponentKeys[components[e].key] = componentSet;
        }
        await figma.clientStorage.setAsync(
          "libraryComponentsList",
          config.dsysLibraryOnlyComponentKeys
        );
      } catch (error) {
        figma.ui.postMessage({ type: "api-error" });
        return false;
      }
    }
    return true;
  }

  async function fetchFileColorVariables(fileKey) {
    const response = await fetch(
      `https://api.figma.com/v1/files/${fileKey}/variables/local`,
      {
        headers: { "X-Figma-Token": config.figmaApiKey },
      }
    );
    const data = await response.json();
    // console.log(data);
    if (data.meta && data.meta.variables) {
      for (let key in data.meta.variables) {
        const variable = data.meta.variables[key];
        // console.log("291 - Variable", variable);
        if (variable.resolvedType === "COLOR") {
          // Store variable IDs in a Set for fast lookup
          config.designSystemColorVariableKeys[variable.key] = 1;
        }
      }
    }
    await figma.clientStorage.setAsync(
      "dsysColorList",
      config.designSystemColorVariableKeys
    );
  }

  //   await fetchFileStyles(config.designSystemFiles.colorStyles, "paint");
  for (let i = 0; i < config.designSystemFiles.deprecatedStyles.length; i++) {
    await fetchDeprecatedStyles(config.designSystemFiles.deprecatedStyles[i]);
  }

  const libraryComponents = await figma.clientStorage.getAsync(
    "libraryComponentsList"
  );
  const colors = await figma.clientStorage.getAsync("dsysColorList");
  const textStyles = await figma.clientStorage.getAsync("dsysTextList");
  const components = await figma.clientStorage.getAsync("componentsList");
  //   console.log(components);
  if (!config.ignoreCache && libraryComponents) {
    config.dsysLibraryOnlyComponentKeys = libraryComponents;
    console.log("Using cached library components");
  } else {
    console.log("Refreshing library components");
    const libraryCheck = await fetchLibraryComponents(
      config.designSystemFiles.components
    );
    if (!libraryCheck) return false;
  }
  if (!config.ignoreCache && components) {
    // console.log(components);
    config.designSystemComponentKeys = components;
    console.log("Using cached components");
  } else {
    console.log("Refreshing components");
    await fetchComponents(config.designSystemFiles.components);
  }
  if (!config.ignoreCache && colors) {
    config.designSystemColorVariableKeys = colors;
    console.log("Using cached color tokens");
  } else {
    console.log("Refreshing color tokens");
    await fetchFileColorVariables(config.designSystemFiles.colorStyles);
  }

  if (!config.ignoreCache && textStyles) {
    console.log("Using cached text stylese");
    config.designSystemTextStyleKeys = textStyles;
  } else {
    console.log("Refreshing text styles");
    await fetchFileStyles(config.designSystemFiles.textStyles, "text");
  }
  console.log(config);
  return true;
}
