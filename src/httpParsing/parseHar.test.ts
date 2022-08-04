import { getParsedHar } from "./parseHar";
import * as har from "./model";

import path from "path";
const __dirname = path.resolve();

describe("Parse HAR", () => {
  const path = __dirname + "/src/httpParsing/petstore3.swagger.io2.har";
  let firstHar: har.t;

  beforeEach(async () => {
    const parsedHar = await getParsedHar(path);
    firstHar = parsedHar[0];
  });

  it("captures the request", () => {
    expect(firstHar).toEqual(
      expect.objectContaining({
        request: expect.objectContaining({
          method: "post",
          url: new URL(
            "https://petstore3.swagger.io/api/v3/pet/12/uploadImage"
          ),
          path: "/api/v3/pet/12/uploadImage",
          postData: undefined,
        }),
      })
    );
  });

  it("captures the response", () => {
    expect(firstHar).toEqual(
      expect.objectContaining({
        response: expect.objectContaining({
          status: 500,
          content: {
            mimeType: "application/json",
            parsed: undefined,
            text: '{"code":500,"message":"There was an error processing your request. It has been logged (ID: e9dda4f26cb1ee94)"}',
          },
        }),
      })
    );
  });

  it("produces a location for the entry", () => {
    expect(firstHar).toEqual(
      expect.objectContaining({
        location: expect.stringMatching(
          /petstore3.*entry=1.*2022-07-20T08:57:34.549Z/
        ),
      })
    );
  });
});
