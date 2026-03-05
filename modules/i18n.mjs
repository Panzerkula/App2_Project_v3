import fs from "node:fs";
import path from "node:path";

const i18n = {
  dateFormaters: {
    us: (date) => {},
    no: (date) => {},
  }
};

const localizationPath = path.join(process.cwd(), "localization");

let files = fs.readdirSync(localizationPath);

for (let file of files) {
  let id = file.replace(".json", "");
  let content = JSON.parse(
    fs.readFileSync(path.join(localizationPath, file), "utf8")
  );
  i18n[id] = content;
}

export default i18n;