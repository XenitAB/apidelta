import path from "path";
import { match } from ".";
import getApi from "../api";
import * as a from "../api/model";
import { getParsedHar } from "../httpParsing/parseHar";
import { verbosePrint, yamlDump } from "../utils/print";
import { Result } from "./model";

describe("Test Rule Scenarios", () => {
  const scenarioNames = [
    [
      "1",
      {
        success: true,
        apiSubtree: {
          "/pet/findByStatus": {
            x_name: "/pet/findByStatus",
            x_x_x_x_results: {
              hits: 0,
            },
            get: {
              responses: {
                "200": {
                  x_x_x_x_results: {
                    hits: 0,
                  },
                },
              },
              x_x_x_x_name: "get",
              x_x_x_x_results: {
                hits: 0,
              },
              parameters: [
                {
                  name: "status",
                  in: "query",
                  required: false,
                  schema: {},
                  x_x_x_x_results: {
                    hits: 0,
                  },
                },
              ],
            },
          },
        },
      },
    ],
    [
      "2",

      {
        success: false,
        apiSubtree: {
          "/pet/findByStatus": {
            x_name: "/pet/findByStatus",
            x_x_x_x_results: {
              hits: 0,
            },
            post: {
              responses: {},
              x_x_x_x_name: "post",
              x_x_x_x_results: {
                hits: 0,
                error: "METHOD NOT FOUND",
              },
            },
          },
        },
      },
    ],
    [
      "3",
      {
        success: true,
        apiSubtree: {
          "/pet/findByStatus": {
            x_name: "/pet/findByStatus",
            x_x_x_x_results: {
              hits: 0,
            },
            get: {
              responses: {
                "200": {
                  x_x_x_x_results: {
                    hits: 0,
                  },
                },
              },
              x_x_x_x_name: "get",
              x_x_x_x_results: {
                hits: 0,
              },
              parameters: [
                {
                  name: "status",
                  in: "query",
                  required: false,
                  schema: {},
                  x_x_x_x_results: {
                    hits: 0,
                  },
                },
              ],
            },
          },
        },
      },
    ],
    [
      "5",
      {
        success: false,
        apiSubtree: {
          "/pet/findByStatus": {
            x_name: "/pet/findByStatus",
            x_x_x_x_results: {
              hits: 0,
            },
            get: {
              responses: {
                "201": {
                  x_x_x_x_results: {
                    hits: 0,
                    error: "STATUS NOT FOUND",
                  },
                },
              },
              x_x_x_x_name: "get",
              x_x_x_x_results: {
                hits: 0,
              },
              parameters: [
                {
                  name: "status",
                  in: "query",
                  required: false,
                  schema: {},
                  x_x_x_x_results: {
                    hits: 0,
                  },
                },
              ],
            },
          },
        },
      },
    ],
    [
      "6",
      {
        success: true,
        apiSubtree: {
          "/ping": {
            x_name: "/ping",
            x_x_x_x_results: {
              hits: 0,
            },
            get: {
              responses: {
                "200": {
                  x_x_x_x_results: {
                    hits: 0,
                  },
                },
              },
              x_x_x_x_name: "get",
              x_x_x_x_results: {
                hits: 0,
              },
            },
          },
        },
      },
    ],
  ];

  const scenarios = scenarioNames.map((s) => {
    return [`./scenarios/simple/${s[0]}`, s[1]];
  });

  test.each(scenarios)("Rule Match %#", async (scenario, expected) => {
    const httpPath = path.join(scenario as string, "http.json");
    const apiPath = path.join(scenario as string, "openapi.yaml");

    const api = await getApi(apiPath);
    const parsedHar = await getParsedHar(httpPath);
    const result = match(api, parsedHar[0]); // TODO We only test first for now
    expect(result).toEqual(expected);
  });
});
