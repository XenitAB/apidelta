import { getParsedHar, getSimple } from "../httpParsing/parseHar";
import getApi from "../api/index";
import { match } from "../rule/index";

import * as a from "../api/model";
import { Result } from "../rule/model";

export const runWithSimple = async (
  openApiPath: string,
  requestResponsePaths: string[]
): Promise<{
  api: a.Root;
  results: Result[];
}> => {
  const api = await getApi(openApiPath);
  const reqRes = (await Promise.all(requestResponsePaths.map(getSimple))).flat();

  const results = [];

  for (const r of reqRes) {
    const result = match(api, r);
    results.push(result);
  }

  return {
    api,
    results,
  };
};

export const run = async (
  openApiPath: string,
  requestResponsePaths: string[]
): Promise<{
  api: a.Root;
  results: Result[];
}> => {
  const api = await getApi(openApiPath);
  const reqRes = (await Promise.all(requestResponsePaths.map(getParsedHar))).flat();

  const results = [];
  for (const r of reqRes) {
    const result = match(api, r);
    results.push(result);
  }

  return {
    api,
    results,
  };
};
