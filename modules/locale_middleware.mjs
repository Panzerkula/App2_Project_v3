import i18n from "./i18n.mjs";

export function getLocale(req) {

  let header = req.headers["accept-language"];
  let lang = header?.split(",")[0].split("-")[0] || "en";

  if (lang === "nb") lang = "no";

  return i18n[lang] || i18n.en;
}