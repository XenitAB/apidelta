import { printReport, printResult } from "./report";
import { flattenToLine } from "./rule/model";
import { run } from "./run";
import { verbosePrint } from "./utils/print";
import { ArgumentParser } from "argparse";
import glob from "glob-promise";

const parser = new ArgumentParser({
  description: "Write a description",
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

parser.add_argument("-m", "--match-server-url", {
  default: "none",
  choices: ["none", "full"],
  help: "none ignores everything until path, full means entire url has to match",
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
  apispec: string;
  recordings: string[];
  verbose: boolean;
  coverage: boolean;
  match_server_url: "none" | "full";
} = parser.parse_args();

const openApiPath = args.apispec[0];

const expandGlobs = async (recordings: string[]) => {
  return await Promise.all(
    recordings.map(async (r) => {
      if (glob.hasMagic(r)) return await glob.promise(r);
      return r;
    })
  );
};

expandGlobs(args.recordings)
  .then((recordings) => {
    return run(openApiPath, recordings.flat(), args.match_server_url);
  })
  .then(({ api, results }) => {
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
