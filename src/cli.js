#!/usr/bin/env node
import path from "node:path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { printEffectiveTreeAsTree, printEffectiveTreeAsList } from "./index.js";

const args = yargs(hideBin(process.argv))
  .usage("Usage: $0")
  .options({
    root: {
      alias: "r",
      describe: "Path of the root package.json. Defaults to ./package.json",
      default: path.join(process.cwd(), "package.json"),
    },
    output: {
      alias: "o",
      describe: "Output to generate",
      choices: ["tree", "list"],
      default: "tree",
    },
  })
  .example("$0", "generate the tree for the project in the current directory")
  .example(
    '$0 --root "./src"',
    "generate the tree for the project inside ./src"
  )
  .help("h")
  .alias("h", "help").argv;

if (args.output === "tree") {
  printEffectiveTreeAsTree(args.root);
} else {
  printEffectiveTreeAsList(args.root);
}
