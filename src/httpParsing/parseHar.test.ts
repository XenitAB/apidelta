import { getParsedHar, parseHar } from "./parseHar";
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
    url: new URL("https://petstore3.swagger.io/api/v3/pet/12/uploadImage"),
    path: "/api/v3/pet/12/uploadImage",
    postData: undefined,
  },
};

test("Parse HAR from disk", async () => {
  const path = __dirname + "/src/httpParsing/petstore3.swagger.io2.har";

  const parsedHar = await getParsedHar(path);

  const firstHar = parsedHar[0];

  expect(firstHar).toEqual(expected);
});

describe("Parse inlined HAR", () => {
  const a = {
    log: {
      entries: [
        {
          request: {
            method: "PUT",
            url: "https://editor.swagger.io/api/pet",
            headers: [],
            queryString: [],
            cookies: [],
            postData: {
              mimeType: "application/json",
              text: '{"hello":"world"}',
            },
          },
          response: {
            status: 405,
            statusText: "",
            headers: [],
            cookies: [],
            content: {},
          },
        },
        {
          request: {
            method: "PUT",
            url: "https://editor.swagger.io/api/pet",
            httpVersion: "http/2.0",
            headers: [],
            queryString: [],
            cookies: [],
            postData: {
              mimeType: "application/json",
              text: '[{"this": "valid"}]',
            },
          },
          response: {
            status: 405,
            statusText: "",
            httpVersion: "http/2.0",
            headers: [],
            cookies: [],
            content: {},
          },
        },
      ],
    },
  };

  let parsedHar: har.t[] = [];

  beforeAll(() => {
    parsedHar = parseHar(a);
  });

  it("Sets postData on items", () => {
    expect(parsedHar[0].request.postData).toBeDefined();
    expect(parsedHar[1].request.postData).toBeDefined();
    expect(parsedHar[0].request.postData?.parsed).toEqual({ hello: "world" });
    expect(parsedHar[1].request.postData?.parsed).toEqual([{ this: "valid" }]);
  });
});
