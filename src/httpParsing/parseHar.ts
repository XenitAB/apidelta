import { rejects } from "assert";
import fs from "fs";
import path from "path";
import { readFile, readFileasJson } from "../utils/readFile";
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
      path: new URL(request.url).pathname,
      postData: request.postData,
    },
  };
};

const parseSimple = (entry: Record<string, any>): har.t => {
  const response: har.response = {
    status: entry.response.status,
    statusText: entry.response.status,
    content: {
      mimeType: entry.response.content.mimeType,
      parsed: entry.response.content.parsed,
      text: JSON.stringify(entry.response.content.parsed),
    },
  };
  const request = entry.request;

  const pathFull = request.path.split("?");

  return {
    response: {
      status: response.status,
      content: response.content,
    },
    request: {
      method: request.method.toLowerCase(),
      path: pathFull[0],
      postData: request.postData,
    },
  };
};

export const getSimple = async (path: string): Promise<har.t[]> => {
  const json = await readFileasJson(path);

  const result: har.t[] = [];

  for (const entry of json) {
    result.push(parseSimple(entry));
  }

  return result;
};

export const getParsedHar = async (path: string): Promise<har.t[]> => {
  const harFile = await readFileasJson(path);
  const entries = getEntries(harFile);

  const parsedEntries = entries.map(parseOneHar);
  return parsedEntries;
};
