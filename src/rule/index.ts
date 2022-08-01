import * as har from "../httpParsing/model";
import * as a from "../api/model";
import * as Result from "./model";
import path, { join } from "path";

export const findPath = (root: a.Root, path: string): a.Path | null => {
  // It's important that an HTTP request with e.g /user/asd can match /user/{user_id}
  const toBeRetuend = root.paths[path];

  // If we make an exact match
  if (toBeRetuend) {
    return toBeRetuend;
  }

  // TODO revise if this is crazy, was written in a hurry
  // If we did not make an exact match we need to see if there are any {user_id} style paths

  // We split all paths to items
  const pathToPatternMatch = path.split("/");

  // We throw away all paths that not equal length
  const pathItems = Object.keys(root.paths)
    .map((p) => p.split("/"))
    .filter((p) => p.length === pathToPatternMatch.length);

  const foundPath: string[] = [];
  let currentIndex = 0;
  pathItems.map((onePath) => {
    while (currentIndex < pathToPatternMatch.length) {
      const element = onePath[currentIndex];
      if (element === pathToPatternMatch[currentIndex]) {
        foundPath.push(element);
        currentIndex++;
      } else if (
        element.charAt(0) === "{" &&
        element.charAt(element.length - 1) === "}"
      ) {
        foundPath.push(element);
        currentIndex++;
      } else {
        break;
      }
    }
  });

  if (foundPath.length === pathToPatternMatch.length) {
    const joinedPath = foundPath.join("/");
    const toBeRetuend = root.paths[joinedPath];

    if (toBeRetuend) {
      return toBeRetuend;
    }
  }

  return null;
};

const incrementHit = (node: { x_x_x_x_results: a.ReportResult }) => {
  node.x_x_x_x_results.hits++;
};

const removeServer = (api: a.Root, path: string) => {
  // For now we can only have one server
  const prefix = api.servers[0].url;
  if (path.startsWith(prefix)) {
    const result = path.slice(prefix.length);
    return result;
  } else {
    return path;
  }
};

const matchParameters = (
  operationNode: a.Operation,
  request: har.request
): a.Parameter[] | null => {
  if (!operationNode.parameters) {
    return null;
  }

  const parameterNodes: a.Parameter[] = [];
  for (const parameterNode of operationNode.parameters) {
    // TODO write logic to match!
    parameterNodes.push(parameterNode);
    incrementHit(parameterNode);
  }

  return parameterNodes;
};

const matchPath = (api: a.Root, request: har.request): a.Path | null => {
  const pathWithNoServer = removeServer(api, request.path);
  const pathNode = findPath(api, pathWithNoServer);
  if (!pathNode) {
    return null;
  }
  incrementHit(pathNode);
  return pathNode;
};

const matchOperation = (pathNode: a.Path, request: har.request) => {
  const methodToMatch = request.method;
  const operationNode = pathNode[methodToMatch];
  if (!operationNode) {
    return null;
  }
  incrementHit(operationNode);

  return operationNode;
};

const matchResponseApi = (
  operationNode: a.Operation,
  response: har.response
): a.ApiResponse | null => {
  const statusToMatch = response.status;

  const matchedStatus = operationNode.responses[statusToMatch];
  if (!matchedStatus) {
    return null;
  }
  incrementHit(matchedStatus);

  return matchedStatus;
};

const matchRequest = (
  api: a.Root,
  request: har.request,
  result: Result.Result
): void => {
  const pathNode = matchPath(api, request);
  if (!pathNode) {
    result.success = false;
    result.apiSubtree[request.path] = a.newPathNodeWithError(
      request.path,
      "PATH NOT FOUND"
    );
    return;
  }
  const newPathNode = a.newPathNode(pathNode.x_name);
  result.apiSubtree[pathNode.x_name] = newPathNode;

  const operationNode = matchOperation(pathNode, request);
  if (!operationNode) {
    result.success = false;
    const methodToMatch = request.method;
    newPathNode[methodToMatch] = a.newOperationNodeWithError(
      methodToMatch,
      "METHOD NOT FOUND"
    );
    return;
  }
  const resultOperationNode = a.newOperationNode(request.method);
  newPathNode[request.method] = resultOperationNode;

  const parameters = matchParameters(operationNode, request);
  if (parameters) {
    resultOperationNode.parameters = [];
    resultOperationNode.parameters = parameters.map((p) => {
      return a.newParamaterNode(p.name, p.in, p.required);
    });
  }

  return;
};

const matchResponse = (
  operation: a.Operation | undefined,
  response: har.response,
  result: Result.Result,
  pathName: string
): void => {
  if (!operation) {
    console.log("WARNING NO OPERATION WAS PASSED TO MATCH RESPONSE");
  }

  const matchedResponseApi = matchResponseApi(operation, response);
  const resultOperation = result.apiSubtree[pathName][operation.x_x_x_x_name];
  if (matchedResponseApi) {
    const resultResponse = resultOperation?.responses;
    // TODO these if(resultResponse) might not be necessary?
    if (resultResponse)
      resultResponse[response.status] = a.newResponseApiNode();
  } else {
    const resultResponse = resultOperation?.responses;
    result.success = false;
    if (resultResponse)
      resultResponse[response.status] =
        a.newResponseApiNodeWithError("STATUS NOT FOUND");
  }
};

export const match = (api: a.Root, input: har.t): Result.Result => {
  // This object mutates
  const result: Result.Result = {
    success: true,
    apiSubtree: {},
  }; // Zero initialise to satisfy type

  matchRequest(api, input.request, result);
  if (!result.success) {
    return result;
  }
  const pathNode = matchPath(api, input.request) as a.Path;
  const operationToMatch = input.request.method;

  matchResponse(
    pathNode[operationToMatch],
    input.response,
    result,
    pathNode.x_name
  );

  return result;
};
