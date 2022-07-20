import Treeify from "../utils/treeify";
import * as api from "../api/model";
import { Result } from "../rule/model";
import chalk from "chalk";
import { verbosePrint } from "../utils/print";

const green = (input: string) => chalk.green(input);
const red = (input: string) => chalk.red(input);

export const joinInRule = (api: api.Root) => {};

export const printReport = (api: api.Root) => {
  let failedSubNode = false;
  Treeify.asLines(api, true, true, (root: any, key: any, line: any) => {
    if (root.x_x_x_x_results) {
      failedSubNode = false;
      if (root.x_x_x_x_results.hits === 0) {
        failedSubNode = true;
        console.log(red(line));
      } else {
        console.log(green(`${line} (${root.x_x_x_x_results.hits})`));
      }
    } else {
      if (failedSubNode) {
        console.log(red(line));
      } else {
        console.log(green(line));
      }
    }
  });
};

export const printResult = (result: Result) => {
  Treeify.asLines(result, true, true, (root: any, _key: any, line: any) => {
    if (root.x_x_x_x_results && root.x_x_x_x_results.error) {
      console.log(red(`${line} (${root.x_x_x_x_results.error})`));
    } else {
      console.log(line);
    }
  });
};
