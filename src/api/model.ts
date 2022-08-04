export type HTTPMETHOD =
  | "connect"
  | "delete"
  | "get"
  | "head"
  | "options"
  | "patch"
  | "post"
  | "put"
  | "trace";

export type ApiError =
  | "METHOD NOT FOUND"
  | "PATH NOT FOUND"
  | "STATUS NOT FOUND";

export type ReportResult = {
  hits: number;
  error?: ApiError;
  location?: string;
};

export const newReportItem = (): ReportResult => {
  return {
    hits: 0,
  };
};

export const newReportItemWithError = (
  error: ApiError,
  location: string
): ReportResult => {
  return {
    hits: 0,
    error,
    location,
  };
};

export const newRootNode = (): Root => {
  return { servers: [], paths: {} };
};

export type Root = {
  servers: { url: string }[];
  paths: Record<string, Path>;
};

export type Path = {
  x_name: string;

  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  get?: Operation;
  options?: Operation;
  trace?: Operation;
  connect?: Operation;
  head?: Operation;

  x_x_x_x_results: ReportResult;
};

export const newPathNode = (name: string): Path => {
  return {
    x_name: name,
    x_x_x_x_results: newReportItem(),
  };
};

export const newPathNodeWithError = (
  path: string,
  error: ApiError,
  location: string
): Path => {
  return {
    x_name: path,
    x_x_x_x_results: newReportItemWithError(error, location),
  };
};

export type Operation = {
  x_x_x_x_name: HTTPMETHOD;
  responses: Record<string, ApiResponse>;
  parameters?: Parameter[];
  requestBody?: RequestBody;

  x_x_x_x_results: ReportResult;
};

export const newOperationNode = (name: HTTPMETHOD): Operation => {
  return {
    responses: {},
    x_x_x_x_name: name,
    x_x_x_x_results: newReportItem(),
  };
};

export const newOperationNodeWithError = (
  name: HTTPMETHOD,
  error: ApiError,
  location: string
): Operation => {
  return {
    responses: {},
    x_x_x_x_name: name,
    x_x_x_x_results: newReportItemWithError(error, location),
  };
};

export const newParamaterNode = (
  name: string,
  in_: string,
  required: boolean
): Parameter => {
  return {
    name,
    in: in_,
    required,
    schema: {},
    x_x_x_x_results: newReportItem(),
  };
};

export type Parameter = {
  name: string;
  in: string;
  required: boolean;
  schema: any;

  x_x_x_x_results: ReportResult;
};

export type RequestBody = {
  required: boolean;
  content: Content;

  x_x_x_x_results: ReportResult;
};

export type Content = {
  "application/json"?: any;

  x_x_x_x_results: ReportResult;
};

export const newResponseApiNodeWithError = (
  error: ApiError,
  location: string
): ApiResponse => {
  return {
    x_x_x_x_results: newReportItemWithError(error, location),
  };
};

export const newResponseApiNode = (): ApiResponse => {
  return {
    x_x_x_x_results: newReportItem(),
  };
};

// Response is already declared so this is named ApiResponse
export type ApiResponse = {
  content?: Content;

  x_x_x_x_results: ReportResult;
};
