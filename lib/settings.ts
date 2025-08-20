import { promises as fs } from "fs";
import path from "path";

const settingsFilePath = path.join(process.cwd(), "lib", "settings.json");

export async function getSettings() {
  try {
    const fileContent = await fs.readFile(settingsFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    // if (error.code === 'ENOENT') {
    //   return { autoApprove: false };
    // }
    throw error;
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function writeSettings(settings: any) {
  await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2));
}
