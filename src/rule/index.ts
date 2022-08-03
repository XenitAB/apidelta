import * as har from "../httpParsing/model";
import * as a from "../api/model";
import * as Result from "./model";

export const findPathNodeFromPath = (
  root: a.Root,
  path: string
): a.Path | null => {
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

  // Pretty stupid to sort, but this solves some cases... and makes the matching more consistent until we rewrite this
  pathItems.sort();

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

// Named sloppy since there are many cases this function does not catch
const isAbsoluteUrlSloppy = (urlString: string) => {
  return (
    urlString.indexOf("http://") === 0 || urlString.indexOf("https://") === 0
  );
};

export const removeServer = (
  api: a.Root,
  url: URL,
  url_server_prefix: string
): string | null => {
  // For now we can only have one server
  const server = api.servers[0].url;
  const pathToMatch = url.pathname;

  if (!isAbsoluteUrlSloppy(server)) {
    // Open Api server can start with slash, remove to simplify logic
    let serverToMatch = server;
    if (!server.startsWith("/")) {
      serverToMatch = "/" + serverToMatch;
    }

    // If the relative server ends with a trailing slash we remove to simplify logic
    if (server.endsWith("/")) {
      serverToMatch = serverToMatch.slice(0, serverToMatch.length - 2);
    }

    if (pathToMatch.indexOf(serverToMatch) === 0) {
      return pathToMatch.slice(serverToMatch.length, pathToMatch.length);
    }
    return null;
  }

  const serverUrl = new URL(server);
  if (url_server_prefix === "full") {
    if (serverUrl.host !== url.host) {
      return null;
    }
  }
  let serverToMatch = serverUrl.pathname;
  if (serverToMatch === "/") {
    return pathToMatch;
  }

  // If the path ends with a trailing slash we remove to simplify logic
  if (serverToMatch.endsWith("/")) {
    serverToMatch = serverToMatch.slice(0, -1);
  }

  if (pathToMatch.indexOf(serverToMatch) === 0) {
    return pathToMatch.slice(serverToMatch.length, pathToMatch.length);
  }
  return null;
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

const matchPath = (
  api: a.Root,
  request: har.request,
  url_server_prefix: string
): a.Path | null => {
  const pathWithNoServer = removeServer(api, request.url, url_server_prefix);
  if (!pathWithNoServer) {
    return null;
  }
  const pathNode = findPathNodeFromPath(api, pathWithNoServer);
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

const verifyRequest = (
  operationNode: a.Operation,
  request: har.request,
  resultOperationNode: a.Operation
): void => {
  const parameters = matchParameters(operationNode, request);

  if (parameters) {
    resultOperationNode.parameters = [];
    resultOperationNode.parameters = parameters.map((p) => {
      return a.newParamaterNode(p.name, p.in, p.required);
    });
  }

  return;
};

const verifyResponse = (
  operation: a.Operation,
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

export const match = (
  api: a.Root,
  input: har.t,
  url_server_prefix: string
): Result.Result => {
  // This object mutates
  const result: Result.Result = {
    success: true,
    apiSubtree: {},
  }; // Zero initialise to satisfy type

  const request = input.request;

  // Find Path Node
  const pathNode = matchPath(api, input.request, url_server_prefix);
  if (!pathNode) {
    result.success = false;
    result.apiSubtree[request.path] = a.newPathNodeWithError(
      request.path,
      "PATH NOT FOUND"
    );
    return result;
  }
  const resultPathNode = a.newPathNode(pathNode.x_name);
  result.apiSubtree[pathNode.x_name] = resultPathNode;

  // Find operation
  const operationNode = matchOperation(pathNode, request);
  if (!operationNode) {
    result.success = false;
    const methodToMatch = request.method;
    resultPathNode[methodToMatch] = a.newOperationNodeWithError(
      methodToMatch,
      "METHOD NOT FOUND"
    );
    return result;
  }
  const resultOperationNode = a.newOperationNode(request.method);
  resultPathNode[request.method] = resultOperationNode;

  // Verify
  verifyRequest(operationNode, input.request, resultOperationNode);
  if (!result.success) {
    return result;
  }

  verifyResponse(operationNode, input.response, result, pathNode.x_name);

  return result;
};
