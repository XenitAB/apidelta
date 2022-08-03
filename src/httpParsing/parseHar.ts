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

const parseOneHar = (entry: Record<string, any>): har.t => {
  const response: har.response = {
    status: entry.response.status,
    statusText: entry.response.status,
    content: {
      mimeType: entry.response.content.mimeType,
      parsed: undefined,
      text: entry.response.content.text,
    },
  };
  const request = entry.request;
  return {
    response: {
      status: response.status,
      content: response.content,
    },
    request: {
      method: request.method.toLowerCase(),
      url: new URL(request.url),
      path: new URL(request.url).pathname,
      postData: request.postData,
    },
  };
};

export const getParsedHar = async (path: string): Promise<har.t[]> => {
  const harFile = await readFileasJson(path);
  const entries = getEntries(harFile);

  const parsedEntries = entries.map(parseOneHar);
  return parsedEntries;
};
