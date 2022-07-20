import yaml from "js-yaml";
import treeify from "treeify";

export const verbosePrint = (input: any) => {
  console.log(JSON.stringify(input, null, 4));
};

export const yamlDump = (input: any) => {
  console.log(yaml.dump(input));
};

export const dumpTree = (input: any) => {
  console.log(treeify.asTree(input, false, false));
};
