import getApi from "./index";
import { Root } from "./model";

const expected: Root = {
  servers: [
    {
      url: "/api/v3",
    },
  ],
  paths: expect.objectContaining({
    "/pet/findByStatus": expect.objectContaining({
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
            content: {
              x_x_x_x_results: {
                hits: 0,
              },
              "application/json": {
                schema: expect.objectContaining({
                  type: "array",
                  items: expect.objectContaining({
                    properties: expect.objectContaining({
                      name: {
                        type: "string",
                        example: "doggie",
                      },
                    }),
                  }),
                }),
              },
            },
          },
          "400": {
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
            schema: {
              type: "string",
              enum: ["available", "pending", "sold"],
              default: "available",
            },
            x_x_x_x_results: {
              hits: 0,
            },
          },
        ],
      },
    }),
  }),
};

test("Build API tree", async () => {
  const path = __dirname + "../../../scenarios/har/1/openapi.yaml";
  const api = await getApi(path);

  expect(api).toEqual(expected);
});
