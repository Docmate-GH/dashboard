// import 'biu.js/dist/biu.css'
// import biu from 'biu.js'
import * as React from 'react'

export const noop = () => { }

export const setFieldValue = (form, fieldName) => value => {
  form.setFieldValue(fieldName, value)
}

// export const alert = biu
const loaded = [] as string[]
const queue = [] as string[]
export const importScript = (src: string) => {
  if (loaded.indexOf(src) !== -1) {
    return Promise.resolve()
  }

  return new Promise((res, rej) => {
    const s = document.createElement('script')
    s.type = 'text/javascript'
    s.src = src
    s.onload = function () {
      loaded.push(src)
      res()
    }
    s.onerror = function (e) {
      rej(e)
    }
    document.body.appendChild(s)
  })
}

export const useImportScript = (src: string) => {
  const [fetching, setFetching] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    console.log('init')
    init()
  }, [])

  async function init() {
    try {
      await importScript(src)
      setFetching(false)
    } catch (e) {
      setError(e)
    } finally {
      setFetching(false)
    }
  }

  return {
    fetching,
    error,
  }
}

export enum SaveStatus {
  UNSAVE,
  SAVED
}
export let saveStatus = SaveStatus.SAVED
export function setSaveStatus(status: SaveStatus) {
  saveStatus = status
}

export const highlights = [
  "abap",
  "abnf",
  "actionscript",
  "ada",
  "agda",
  "al",
  "antlr4",
  "apacheconf",
  "apl",
  "applescript",
  "aql",
  "arduino",
  "arff",
  "asciidoc",
  "asm6502",
  "aspnet",
  "autohotkey",
  "autoit",
  "bash",
  "basic",
  "batch",
  "bbcode",
  "bison",
  "bnf",
  "brainfuck",
  "brightscript",
  "bro",
  "c",
  "cil",
  "clike",
  "clojure",
  "cmake",
  "coffeescript",
  "concurnas",
  "core",
  "cpp",
  "crystal",
  "csharp",
  "csp",
  "css-extras",
  "css",
  "cypher",
  "d",
  "dart",
  "dax",
  "dhall",
  "diff",
  "django",
  "dns-zone-file",
  "docker",
  "ebnf",
  "editorconfig",
  "eiffel",
  "ejs",
  "elixir",
  "elm",
  "erb",
  "erlang",
  "etlua",
  "excel-formula",
  "factor",
  "firestore-security-rules",
  "flow",
  "fortran",
  "fsharp",
  "ftl",
  "gcode",
  "gdscript",
  "gedcom",
  "gherkin",
  "git",
  "glsl",
  "gml",
  "go",
  "graphql",
  "groovy",
  "haml",
  "handlebars",
  "haskell",
  "haxe",
  "hcl",
  "hlsl",
  "hpkp",
  "hsts",
  "http",
  "ichigojam",
  "icon",
  "iecst",
  "ignore",
  "inform7",
  "ini",
  "io",
  "j",
  "java",
  "javadoc",
  "javadoclike",
  "javascript",
  "javastacktrace",
  "jolie",
  "jq",
  "js-extras",
  "js-templates",
  "jsdoc",
  "json",
  "json5",
  "jsonp",
  "jsstacktrace",
  "jsx",
  "julia",
  "keyman",
  "kotlin",
  "latex",
  "latte",
  "less",
  "lilypond",
  "liquid",
  "lisp",
  "livescript",
  "llvm",
  "lolcode",
  "lua",
  "makefile",
  "markdown",
  "markup-templating",
  "markup",
  "matlab",
  "mel",
  "mizar",
  "monkey",
  "moonscript",
  "n1ql",
  "n4js",
  "nand2tetris-hdl",
  "nasm",
  "neon",
  "nginx",
  "nim",
  "nix",
  "nsis",
  "objectivec",
  "ocaml",
  "opencl",
  "oz",
  "parigp",
  "parser",
  "pascal",
  "pascaligo",
  "pcaxis",
  "peoplecode",
  "perl",
  "php-extras",
  "php",
  "phpdoc",
  "plsql",
  "powerquery",
  "powershell",
  "processing",
  "prolog",
  "properties",
  "protobuf",
  "pug",
  "puppet",
  "pure",
  "purebasic",
  "python",
  "q",
  "qml",
  "qore",
  "r",
  "racket",
  "reason",
  "regex",
  "renpy",
  "rest",
  "rip",
  "roboconf",
  "robotframework",
  "ruby",
  "rust",
  "sas",
  "sass",
  "scala",
  "scheme",
  "scss",
  "shell-session",
  "smali",
  "smalltalk",
  "smarty",
  "solidity",
  "solution-file",
  "soy",
  "sparql",
  "splunk-spl",
  "sqf",
  "sql",
  "stylus",
  "swift",
  "t4-cs",
  "t4-templating",
  "t4-vb",
  "tap",
  "tcl",
  "textile",
  "toml",
  "tsx",
  "tt2",
  "turtle",
  "twig",
  "typescript",
  "unrealscript",
  "vala",
  "vbnet",
  "velocity",
  "verilog",
  "vhdl",
  "vim",
  "visual-basic",
  "warpscript",
  "wasm",
  "wiki",
  "xeora",
  "xml-doc",
  "xojo",
  "xquery",
  "yaml",
  "yang",
  "zig"
].map(o => ({ value: o, label: o }))
