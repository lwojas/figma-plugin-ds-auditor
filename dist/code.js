(() => {
  // src/code.ts
  var config = {
    figmaApiKey: "",
    ignoreCache: false,
    designSystemFiles: {
      components: [
        "PpmmmhMK3IFksyAVxxTYFh",
        "WJDOd6kqQ8acqBggjFyheD",
        "Xd6bY4RpC9VzTqDshVXiym",
        "6A6dRXN4kz0vh1KftfhyzB"
      ],
      textStyles: "7k3v61QvXmY0hlVTlGoeGs",
      colorStyles: "5s3SawNMBxneWcUIUnOMXo",
      deprecatedStyles: [
        // "V19YobUVrX9MhfcNPVC2JA",
        // "7k3v61QvXmY0hlVTlGoeGs",
      ]
    },
    scoringWeights: {
      components: 0.4,
      textStyles: 0.3,
      colors: 0.3
    },
    designSystemComponentKeys: {},
    dsysLibraryOnlyComponentKeys: {},
    designSystemTextStyleKeys: {},
    // designSystemColorStyleRGBs: new Set(),
    designSystemColorVariableKeys: {},
    libraryComponentSets: {},
    deprecatedColors: {},
    deprecatedTypography: {}
  };
  figma.showUI(__html__, { width: 400, height: 670 });
  async function startApp() {
    await figma.currentPage.loadAsync();
  }
  startApp();
  figma.ui.onmessage = async (msg) => {
    if (msg.type === "get-config") {
      const stored = await figma.clientStorage.getAsync("apiKey");
      config.figmaApiKey = stored || "";
      figma.ui.postMessage({ type: "config-data", config });
    }
    if (msg.type === "set-config") {
      await figma.clientStorage.setAsync("apiKey", msg.config.apiKey);
      config.figmaApiKey = msg.config.apiKey;
      config.ignoreCache = msg.config.ignoreCacheFlag;
      const data = await loadDesignSystemData();
      if (!data) return;
      figma.ui.postMessage({ type: "key-set" });
    }
    if (msg.type === "audit-request") {
      let traverse2 = function(node) {
        if (node.visible) {
          if ("children" in node) {
            for (let i = 0; i < node.children.length; i++) {
              traverse2(node.children[i]);
            }
          }
          nodes.push(node);
        }
      };
      var traverse = traverse2;
      console.log("Displaying config--", msg.data.usePrivateComponents, config);
      const selection = figma.currentPage.selection;
      if (selection.length === 0) {
        figma.ui.postMessage({ type: "error", message: "No selection made." });
        return;
      }
      const nodes = [];
      for (let i = 0; i < selection.length; i++) {
        traverse2(selection[i]);
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
        unstyledTextCount: 0
        //   totalColorAssignments: 0,
      };
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.type === "INSTANCE") {
          const mainComponent = await node.getMainComponentAsync().catch(() => null);
          if (mainComponent) {
            const key = mainComponent.key;
            if (config.designSystemComponentKeys[key]) {
              if (!msg.data.usePrivateComponents && !config.dsysLibraryOnlyComponentKeys[key]) {
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
        if (node.type === "FRAME" && !node.layoutMode) {
          results.framesWithoutAutoLayout.push(node.id);
        }
        if ("fills" in node && node.fills !== figma.mixed && node.fills.length) {
          node.fills.forEach((fill) => {
            results.totalColors++;
            if ("boundVariables" in fill && fill.boundVariables && fill.boundVariables.color) {
              const key = sanitiseComponentKey(fill.boundVariables.color.id);
              if (config.designSystemColorVariableKeys[key]) {
                results.dsysColorTokens[fill.boundVariables.color.id] = 1;
                results.totalDsysColorTokens++;
              } else {
                results.nonDsysColorTokens[fill.boundVariables.color.id] = 1;
                results.nonDsysColorFills.push({
                  name: node.name,
                  id: node.id
                });
              }
            } else {
              results.nonDsysColorFills.push({ name: node.name, id: node.id });
            }
          });
        }
        if ("strokes" in node && node.strokes.length) {
          node.strokes.forEach((fill) => {
            results.totalColors++;
            if ("boundVariables" in fill && fill.boundVariables && fill.boundVariables.color) {
              const key = sanitiseComponentKey(fill.boundVariables.color.id);
              if (config.designSystemColorVariableKeys[key]) {
                results.dsysColorTokens[fill.boundVariables.color.id] = 1;
                results.totalDsysColorTokens++;
              } else {
                results.nonDsysColorTokens[fill.boundVariables.color.id] = 1;
                results.nonDsysColorFills.push({
                  name: node.name,
                  id: node.id
                });
              }
            } else {
              results.nonDsysColorFills.push({ name: node.name, id: node.id });
            }
          });
        }
        if (node.type === "TEXT") {
          results.totalTextNodes++;
          if (node.textStyleId === figma.mixed) return;
          const styleKey = sanitiseKey(node.textStyleId);
          if (styleKey) {
            if (config.designSystemTextStyleKeys[styleKey]) {
              results.dsysTextStyles[styleKey] = "1";
              results.dsysStyledTextCount++;
            } else {
              results.nonDsysStyledTextCount++;
              results.nonDsysTextStyles[styleKey] = {
                name: node.name,
                id: node.id
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
      if (!node || node.type === "PAGE" || node.type === "DOCUMENT") return;
      if (node) {
        figma.currentPage.selection = [node];
        figma.viewport.scrollAndZoomIntoView([node]);
      }
    }
  };
  function sanitiseKey(key) {
    if (typeof key !== "string") return "";
    let sanitiseKey2 = key.replace(/^.:/, "");
    sanitiseKey2 = sanitiseKey2.replace(/,.*/, "");
    return sanitiseKey2;
  }
  function sanitiseComponentKey(key) {
    if (typeof key !== "string") return "";
    let sanitiseKey2 = key.replace(/^.*?:/, "");
    sanitiseKey2 = sanitiseKey2.replace(/\/.*/, "");
    return sanitiseKey2;
  }
  async function loadDesignSystemData() {
    async function fetchDeprecatedStyles(fileKey) {
      const response = await fetch(
        `https://api.figma.com/v1/files/${fileKey}/styles`,
        {
          headers: { "X-Figma-Token": config.figmaApiKey }
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
    }
    async function fetchFileStyles(fileKey, type) {
      console.log("Fetching file styles for ", fileKey);
      const response = await fetch(
        `https://api.figma.com/v1/files/${fileKey}/styles`,
        {
          headers: { "X-Figma-Token": config.figmaApiKey }
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
            headers: { "X-Figma-Token": config.figmaApiKey }
          }
        );
        const data = await response.json();
        const components2 = Object.values(
          data.components
        );
        for (let i2 = 0; i2 < components2.length; i2++) {
          config.designSystemComponentKeys[components2[i2].key] = components2[i2].name;
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
              headers: { "X-Figma-Token": config.figmaApiKey }
            }
          );
          if (!response.ok) {
            console.log("API Key is incorrect ----------");
            figma.ui.postMessage({ type: "api-error" });
            return false;
          }
          const data = await response.json();
          const components2 = Object.values(data.meta.components);
          for (let e = 0; e < components2.length; e++) {
            let componentSet = "";
            if (i === 0) {
              if (components2[e].containing_frame && components2[e].containing_frame.containingComponentSet) {
                componentSet = components2[e].containing_frame.containingComponentSet.name;
              } else {
              }
              if (componentSet) {
                config.libraryComponentSets[componentSet] = componentSet;
              } else {
                componentSet = components2[e].name;
                config.libraryComponentSets[components2[e].name] = components2[e].name;
              }
            }
            config.dsysLibraryOnlyComponentKeys[components2[e].key] = componentSet;
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
          headers: { "X-Figma-Token": config.figmaApiKey }
        }
      );
      const data = await response.json();
      if (data.meta && data.meta.variables) {
        for (let key in data.meta.variables) {
          const variable = data.meta.variables[key];
          if (variable.resolvedType === "COLOR") {
            config.designSystemColorVariableKeys[variable.key] = 1;
          }
        }
      }
      await figma.clientStorage.setAsync(
        "dsysColorList",
        config.designSystemColorVariableKeys
      );
    }
    for (let i = 0; i < config.designSystemFiles.deprecatedStyles.length; i++) {
      await fetchDeprecatedStyles(config.designSystemFiles.deprecatedStyles[i]);
    }
    const libraryComponents = await figma.clientStorage.getAsync(
      "libraryComponentsList"
    );
    const colors = await figma.clientStorage.getAsync("dsysColorList");
    const textStyles = await figma.clientStorage.getAsync("dsysTextList");
    const components = await figma.clientStorage.getAsync("componentsList");
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
})();
