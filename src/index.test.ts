// import path from "path";
// import { runWithSimple } from "./run";
// import { readFile } from "./utils/readFile";

// describe("Test simple scenarios", () => {
//   const scenarioNames = ["1", "2"];

//   const scenarios = scenarioNames.map((s) => {
//     return `./scenarios/simple/${s}`;
//   });

//   test.each(scenarios)(".add(%i, %i)", async (scenario) => {
//     const httpPath = path.join(scenario, "http.json");
//     const openApiPath = path.join(scenario, "openapi.yaml");
//     const resultPath = path.join(scenario, "result");

//     const { api, result } = await runWithSimple(openApiPath, httpPath);

//     const resultText = await readFile(resultPath);

//     console.log(resultText);

//     expect(true).toBe(false);
//   });
// });

test("Dummy test", () => {
  expect(true).toBe(true);
});
