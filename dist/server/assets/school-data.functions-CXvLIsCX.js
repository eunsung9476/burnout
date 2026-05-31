import { T as TSS_SERVER_FUNCTION, a as createServerFn } from "./server-BfycGJ7Q.js";
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const CSV_NAME = "final_school_data.csv";
const XLSX_NAME = "school_wide_final.xlsx";
function resolveDataPath(filename) {
  const candidates = [
    path.join(process.cwd(), "data", filename),
    path.join(process.cwd(), "public", "data", filename)
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {
    }
  }
  return null;
}
function loadSchoolData() {
  const filePath = resolveDataPath(CSV_NAME);
  if (!filePath) {
    return {
      ok: false,
      error: `데이터 파일을 찾을 수 없습니다: data/${CSV_NAME}`,
      schools: []
    };
  }
  try {
    let text = fs.readFileSync(filePath, "utf-8");
    if (text.charCodeAt(0) === 65279) text = text.slice(1);
    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    const schools = parsed.data.filter(
      (r) => r && r["학교명"]
    );
    return { ok: true, schools };
  } catch (e) {
    return {
      ok: false,
      error: `CSV 파싱 오류: ${e.message}`,
      schools: []
    };
  }
}
function loadWideData() {
  const filePath = resolveDataPath(XLSX_NAME);
  if (!filePath) {
    return {
      ok: false,
      error: `데이터 파일을 찾을 수 없습니다: data/${XLSX_NAME}`,
      rows: []
    };
  }
  try {
    const buf = fs.readFileSync(filePath);
    const wb = XLSX.read(buf, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    return { ok: true, rows: rows.filter((r) => r && r["학교명"]) };
  } catch (e) {
    return {
      ok: false,
      error: `Excel 파싱 오류: ${e.message}`,
      rows: []
    };
  }
}
const getSchoolData_createServerFn_handler = createServerRpc({
  id: "158f5449ae9e7c5e847c813eb4a9b806ce95f6ea705dee111fc7e2ac48764e99",
  name: "getSchoolData",
  filename: "src/lib/school-data.functions.ts"
}, (opts) => getSchoolData.__executeServer(opts));
const getSchoolData = createServerFn({
  method: "GET"
}).handler(getSchoolData_createServerFn_handler, async () => {
  return loadSchoolData();
});
const getWideData_createServerFn_handler = createServerRpc({
  id: "4ae15c36c6a039db70e50795525b409591a1f2e0a6effea3c776dedd074bdf4d",
  name: "getWideData",
  filename: "src/lib/school-data.functions.ts"
}, (opts) => getWideData.__executeServer(opts));
const getWideData = createServerFn({
  method: "GET"
}).handler(getWideData_createServerFn_handler, async () => {
  return loadWideData();
});
export {
  getSchoolData_createServerFn_handler,
  getWideData_createServerFn_handler
};
