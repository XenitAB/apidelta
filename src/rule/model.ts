import * as api from "../api/model";
export type Result = {
  success: boolean;
  apiSubtree: Record<string, api.Path>;
};

export const flattenToLine = (result: Result): string => {
  let str = "Path: ";

  const keys = Object.keys(result.apiSubtree);
  if (keys.length === 0) {
    throw new Error("IMPLEMENT NO PATH FOUND");
  }

  const node = result.apiSubtree[keys[0]];
  str += node.x_name;
  if (node.x_x_x_x_results.error) {
    str += " Error: (";
    str += node?.x_x_x_x_results.error;
    str += ")";
    return str;
  }

  let operation;
  if (node.connect) {
  } else if (node.delete) {
    operation = node.delete;
  } else if (node.get) {
    operation = node.get;
  } else if (node.head) {
    operation = node.head;
  } else if (node.options) {
    operation = node.options;
  } else if (node.patch) {
    operation = node.patch;
  } else if (node.post) {
    operation = node.post;
  } else if (node.put) {
    operation = node.put;
  } else if (node.trace) {
    operation = node.trace;
  }

  str += ", Operation: ";
  str += operation?.x_x_x_x_name;

  if (operation?.x_x_x_x_results.error) {
    str += " Error: (";
    str += operation?.x_x_x_x_results.error;
    str += ")";
  }

  if (operation?.responses) {
    for (const [key, response] of Object.entries(operation?.responses)) {
      if (response.x_x_x_x_results.error) {
        str += ", Error: (";
        str += response.x_x_x_x_results.error;
        str += " (";
        str += key;
        str += ")";
        str += ")";
      }
    }
  }

  if (operation?.requestBody) {
    const requestBody = operation.requestBody;
    if (requestBody.x_x_x_x_results.error) {
      str += ", Error: (";
      str += requestBody.x_x_x_x_results.error;
      str += ")";
    }
  }

  return str;
};
