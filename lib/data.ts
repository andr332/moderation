import { promises as fs } from "fs";
import path from "path";

const jsonFilePath = path.join(process.cwd(), "lib", "images.json");

export async function getImages() {
  const fileContent = await fs.readFile(jsonFilePath, "utf-8");
  return JSON.parse(fileContent);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function writeImages(images: any) {
  await fs.writeFile(jsonFilePath, JSON.stringify(images, null, 2));
}
