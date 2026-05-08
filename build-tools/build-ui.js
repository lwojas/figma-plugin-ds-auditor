// build-ui.js
const fs = require("fs");

const html = fs.readFileSync("./src/ui/ui.template.html", "utf8");
const js = fs.readFileSync("./dist/ui.js", "utf8");
const css = fs.readFileSync("./src/ui/styles/main.css", "utf8");

const final = html.replace("<!-- JS -->", js).replace("/* CSS */", css);

fs.writeFileSync("./dist/ui.html", final);
