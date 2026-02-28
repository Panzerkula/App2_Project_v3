import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

const basePath = path.join(dirName, "..", "database");

export async function loadSql(domain, filename) {
  const filePath = path.join(basePath, domain, filename);
  return fs.readFile(filePath, "utf8");
}