import fs from "fs";
import util from "util";
import * as har from "./model";

const readFile = util.promisify(fs.readFile);

const parseHarEntry = (entry: Record<string, any>, location: string): har.t => {
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
    location,
  };
};

export const getParsedHar = async (path: string): Promise<har.t[]> => {
  const harFile = JSON.parse(await readFile(path, { encoding: "utf8" }));
  return harFile.log.entries.map((e: Record<string, any>, i: number) =>
    parseHarEntry(
      e,
      `[file=${path}, entry=${i + 1}, startedDateTime=${e.startedDateTime}]`
    )
  );
};
