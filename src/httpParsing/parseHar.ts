import { readFileasJson } from "../utils/readFile";
import * as har from "./model";

const getEntries = (harFile: Record<string, any>) => {
  const entries = harFile.log.entries.map((e: any) => {
    return {
      request: e.request,
      response: e.response,
    };
  });
  return entries;
};

const parseContent = (input: {
  mimeType: string;
  text: string;
}): har.postData | undefined => {
  if (!input) {
    return undefined;
  }
  if (input.mimeType === "application/json" || input.mimeType === "text/json") {
    return {
      mimeType: input.mimeType,
      text: input.text,
      parsed: null,
    };
  }
  console.warn("Only application/json and text/json is supported!");
  return undefined;
};

const parseOneHar = (entry: Record<string, any>): har.t => {
  const request = entry.request;
  const requestContent = parseContent(request.postData);
  const response: har.response = {
    status: entry.response.status,
    statusText: entry.response.status,
    content: {
      mimeType: entry.response.content.mimeType,
      parsed: undefined,
      text: entry.response.content.text,
    },
  };
  return {
    response: {
      status: response.status,
      content: response.content,
    },
    request: {
      method: request.method.toLowerCase(),
      url: new URL(request.url),
      path: new URL(request.url).pathname,
      postData: requestContent,
    },
  };
};

export const parseHar = (harFile: Record<string, any>): har.t[] => {
  const entries = getEntries(harFile);
  return entries.map(parseOneHar);
};

export const getParsedHar = async (filePath: string): Promise<har.t[]> => {
  const harFile = await readFileasJson(filePath);
  const parsedEntries = parseHar(harFile);
  return parsedEntries;
};
