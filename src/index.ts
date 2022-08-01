import { printReport, printResult } from "./report";
import { flattenToLine } from "./rule/model";
import { run, runWithSimple } from "./run";
import { verbosePrint } from "./utils/print";
import { ArgumentParser } from "argparse";

const parser = new ArgumentParser({
  description: "Write a description",
});

parser.add_argument("-s", "--simple", {
  default: false,
  help: "Use the custom simple format",
  action: "store_true",
});

parser.add_argument("-v", "--verbose", {
  default: false,
  help: "print verboese result information",
  action: "store_true",
});

parser.add_argument("-c", "--coverage", {
  default: false,
  help: "print coverage tree",
  action: "store_true",
});

parser.add_argument("apispec", {
  help: "Path to a open api 3 yaml file",
  nargs: 1,
});

parser.add_argument("recordings", {
  help: "Path to a har file. Can be used multiple times.",
  nargs: "+",
});

const args: {
  simple: boolean;
  apispec: string;
  recordings: string[];
  verbose: boolean;
  coverage: boolean;
} = parser.parse_args();

if (args.simple) {
  const openApiPath = args.apispec[0];
  runWithSimple(openApiPath, args.recordings).then(({ api, results }) => {
    if (args.coverage) {
      printReport(api);
    }

    if (args.verbose) {
      results.map(printResult);
    }
    const errors = results
      .filter((r) => !r.success)
      .map((r, i) => {
        if (i === 0) {
          console.error("Errors:");
        }
        console.error(flattenToLine(r));
      });
    if (errors.length > 0) {
      process.exit(1);
    }
  });
} else {
  const openApiPath = args.apispec[0];
  run(openApiPath, args.recordings).then(({ api, results }) => {
    if (args.coverage) {
      printReport(api);
    }

    if (args.verbose) {
      results.map(printResult);
    }

    const errors = results
      .filter((r) => !r.success)
      .map((r, i) => {
        if (i === 0) {
          console.error("Errors:");
        }
        console.error(flattenToLine(r));
      });
    if (errors.length > 0) {
      process.exit(1);
    }
  });
}
