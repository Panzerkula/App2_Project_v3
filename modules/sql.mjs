import fs from "fs/promises";
import path from "path";

const basePath = path.join(process.cwd(), "database");

export async function loadSql(filename) {
  const filePath = path.join(basePath, filename);
  return fs.readFile(filePath, "utf8");
}
