import { getParsedHar, getSimple } from "./parseHar";
import * as har from "./model";

import path from "path";
const __dirname = path.resolve();

const expected: har.t = {
  response: {
    status: 500,
    content: {
      mimeType: "application/json",
      parsed: undefined,
      text: '{"code":500,"message":"There was an error processing your request. It has been logged (ID: e9dda4f26cb1ee94)"}',
    },
  },
  request: {
    method: "post",
    path: "/api/v3/pet/12/uploadImage",
    postData: undefined,
  },
};

test("Parse HAR", async () => {
  const path = __dirname + "/src/httpParsing/petstore3.swagger.io2.har";

  const parsedHar = await getParsedHar(path);

  const firstHar = parsedHar[0];

  expect(firstHar).toEqual(expected);
});
