import * as a from "./model";
import SwaggerParser from "@apidevtools/swagger-parser";

const readApi = async (path: string): Promise<a.Root> => {
  const api = (await SwaggerParser.validate(path)) as unknown as a.Root; // TODO: Couldn't figure out the types from "openapi-types"
  return api;
};

const getMimeType = (content: a.Content): a.MimeType | undefined => {
  if (content["application/json"] && content["application/json"].schema) {
    return a.newMimeType(content["application/json"].schema);
  }
};

const getContent = (response: a.ApiResponse): a.Content | undefined => {
  // We only cover application/json for now
  if (!response.content) {
    return;
  }
  const contentToBeReturned: a.Content = {
    x_x_x_x_results: a.newReportItem(),
  };

  contentToBeReturned["application/json"] = getMimeType(response.content);

  return contentToBeReturned;
};

const getResponses = (
  responses: Record<string, a.ApiResponse>,
): Record<string, a.ApiResponse> => {
  const responsesToBeAdded: Record<string, a.ApiResponse> = {};

  for (const [statusCode, response] of Object.entries(responses)) {
    responsesToBeAdded[statusCode] = {
      x_x_x_x_results: a.newReportItem(),
    };
    responsesToBeAdded[statusCode].content = getContent(response);
  }

  return responsesToBeAdded;
};

const getParameters = (parameters?: a.Parameter[]) => {
  if (!parameters) {
    return;
  }
  return parameters.map((p) => {
    return {
      name: p.name,
      in: p.in,
      required: p.required,
      schema: p.schema,
      x_x_x_x_results: a.newReportItem(),
    };
  });
};

const getRequestBody = (
  requestBody?: a.RequestBody,
): a.RequestBody | undefined => {
  if (!requestBody) {
    return;
  }

  return {
    content: getContent(requestBody),
    required: requestBody.required,
    x_x_x_x_results: a.newReportItem(),
  };
};

const getOperation = (
  name: a.HTTPMETHOD,
  operation?: a.Operation,
): a.Operation | undefined => {
  if (!operation) {
    return;
  }

  const operationToBeAdded: a.Operation = {
    responses: {},
    x_x_x_x_name: name,
    x_x_x_x_results: a.newReportItem(),
  };

  operationToBeAdded.parameters = getParameters(operation.parameters);
  operationToBeAdded.requestBody = getRequestBody(operation.requestBody);
  operationToBeAdded.responses = getResponses(operation.responses);

  return operationToBeAdded;
};

const getPathNode = (pathName: string, path: a.Path): a.Path => {
  const pathToBeAdded: a.Path = {
    x_name: pathName,
    x_x_x_x_results: a.newReportItem(),
  };

  pathToBeAdded.delete = getOperation("delete", path.delete);
  pathToBeAdded.get = getOperation("get", path.get);
  pathToBeAdded.patch = getOperation("patch", path.patch);
  pathToBeAdded.post = getOperation("post", path.post);
  pathToBeAdded.put = getOperation("put", path.put);

  return pathToBeAdded;
};

const parseApi = (api: a.Root) => {
  const root: a.Root = { servers: api.servers, paths: {} };

  // Add paths
  for (const [pathName, path] of Object.entries(api.paths)) {
    const p = getPathNode(pathName, path);
    root.paths[pathName] = p;
  }

  return root;
};

const getApi = async (path: string) => parseApi(await readApi(path));

export const findPath = (root: a.Root, path: string): a.Path | null => {
  const toBeRetuend = root.paths[path];
  if (!toBeRetuend) {
    return null;
  }
  return toBeRetuend;
};

export default getApi;
