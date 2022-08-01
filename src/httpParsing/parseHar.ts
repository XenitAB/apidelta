import fs from "fs/promises";
import * as har from "./model";

const parseHarEntry = (entry: Record<string, any>): har.t => {
  return {
    request: {
      method: entry.request.method.toLowerCase(),
      url: new URL(entry.request.url),
      path: new URL(entry.request.url).pathname,
      postData: entry.request.postData,
    },
    response: {
      status: entry.response.status,
      statusText: entry.response.statusText,
      content: {
        mimeType: entry.response.content.mimeType,
        parsed: undefined,
        text: entry.response.content.text,
      },
    },
  };
};

export const getParsedHar = async (path: string): Promise<har.t[]> => {
  const harFile = JSON.parse(await fs.readFile(path, {encoding: "utf8"}));
  return harFile.log.entries.map(parseHarEntry);
};
