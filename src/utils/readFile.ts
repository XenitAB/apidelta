import fs from "fs";

export const readFile = async (path: string) => {
  const fileContents = await fs.promises.readFile(path);
  return fileContents.toString();
};

export const readFileasJson = async (path: string) => {
  const fileContents = await readFile(path);
  return JSON.parse(fileContents);
};
