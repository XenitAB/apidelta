import { getParsedHar, getSimple } from "./parseHar";
import * as har from "./model";

import path from "path";
import { verbosePrint } from "../utils/print";

describe("Test simple HAR scenarios", () => {
  const scenarioNames = [
    [
      "1",
      [
        {
          response: {
            status: 200,
            content: {
              mimeType: "application/json",
              parsed: {
                oneEntry: 1,
              },
              text: '{"oneEntry":1}',
            },
          },
          request: {
            method: "get",
            path: "/v3/pet/findByStatus",
          },
        },
      ],
    ],
    [
      "2",
      [
        {
          response: {
            status: 200,
            content: {
              mimeType: "application/json",
              parsed: {
                oneEntry: 1,
              },
              text: '{"oneEntry":1}',
            },
          },
          request: {
            method: "post",
            path: "/v3/pet/findByStatus",
          },
        },
      ],
    ],
    [
      "3",
      [
        {
          response: {
            status: 200,
            content: {
              mimeType: "application/json",
              parsed: {
                oneEntry: 1,
              },
              text: '{"oneEntry":1}',
            },
          },
          request: {
            method: "get",
            path: "/v3/pet/findByStatus",
          },
        },
        {
          response: {
            status: 200,
            content: {
              mimeType: "application/json",
              parsed: {
                oneEntry: 1,
              },
              text: '{"oneEntry":1}',
            },
          },
          request: {
            method: "get",
            path: "/v3/pet/findByStatus",
          },
        },
      ],
    ],
  ];

  const scenarios = scenarioNames.map((s) => {
    return [`./scenarios/simple/${s[0]}`, s[1]];
  });

  test.each(scenarios)("Parse Simple %#", async (scenario, expected) => {
    const httpPath = path.join(scenario as string, "http.json");

    const parsedHar = await getSimple(httpPath);
    expect(parsedHar).toEqual(expected);
  });
});
