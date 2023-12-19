// Convert this into a browser friendly version with:
// npx esbuild editor.js --bundle --outfile=editor.bundle.js

import { basicSetup } from "codemirror";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark, color as oneDarkPalette } from '@codemirror/theme-one-dark';
import { indentWithTab } from "@codemirror/commands";
import { searchKeymap } from "@codemirror/search";

import { parser as htmlParser } from "@lezer/html";
import { parser as jsParser } from "@lezer/javascript";
import { parser as cssParser } from "@lezer/css";
import { parseMixed } from "@lezer/common";
import { LRLanguage, indentUnit } from "@codemirror/language";

// Requirements 3 and 4
// Javascript code support for the content of <silk:JScode> and <silk:JQcode> tags
// CSS should be supported under <style></style>
// See: https://codemirror.net/examples/mixed-language/
// See also: https://codemirror.net/examples/lang-package/
const mixedHTMLParser = htmlParser.configure({
    wrap: parseMixed(node => {
        // Note: "SilkText" node name doesn't exist in the default lezer html grammar, you'll have to create a Silk grammar
        // I would just copy the lezer html one and modify it for silk:
        // https://github.com/lezer-parser/html
        if (node.name == "SilkText" || node.name == "ScriptText")
            return { parser: jsParser };

        // If the node is a <style> element, use the CSS parser
        if (node.name == "StyleText")
            return { parser: cssParser };

        return null;
    })
});

const mixedHTML = LRLanguage.define({ parser: mixedHTMLParser });

let view = new EditorView({
    parent: document.getElementById("editor"),
    extensions: [
        basicSetup,
        mixedHTML,
        oneDark,
        keymap.of([
            indentWithTab,

            // Requirement 6
            // Add search keybindings - search and replace with ctrl-f
            ...searchKeymap,
        ]),

        // Requirement 7
        // Use tabs instead of spaces
        // See: https://codemirror.net/docs/ref/#language.indentUnit
        indentUnit.of("\t"),
    ],
});

// Requirement 5
// You can override the theme colors with css
// See default theme colors and css selectors here:
// https://github.com/codemirror/theme-one-dark/blob/main/src/one-dark.ts
const backgroundColorEl = document.getElementById("backgroundColor");
backgroundColorEl.addEventListener("change", (e) => {
    // Style the editor background color
    view.dom.style.backgroundColor = e.target.value;
});

const gutterColorEl = document.getElementById("gutterColor");
gutterColorEl.addEventListener("change", (e) => {
    // Select .cm-editor .cm-gutters
    const gutterEl = view.dom.querySelector(".cm-gutters");
    gutterEl.style.backgroundColor = e.target.value;
});