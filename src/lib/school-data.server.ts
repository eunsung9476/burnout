// 서버 전용 — 데이터 파일(CSV/XLSX) 읽기 & 파싱
// data/ 폴더의 실제 파일을 읽습니다. 파일이 없으면 ok:false 반환.
import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import type {
  DataResponse,
  WideResponse,
  SchoolRecord,
  WideRecord,
} from "./types";

const CSV_NAME = "final_school_data.csv";
const XLSX_NAME = "school_wide_final.xlsx";

function resolveDataPath(filename: string): string | null {
  const candidates = [
    path.join(process.cwd(), "data", filename),
    path.join(process.cwd(), "public", "data", filename),
  ];
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function loadSchoolData(): DataResponse {
  const filePath = resolveDataPath(CSV_NAME);
  if (!filePath) {
    return {
      ok: false,
      error: `데이터 파일을 찾을 수 없습니다: data/${CSV_NAME}`,
      schools: [],
    };
  }
  try {
    let text = fs.readFileSync(filePath, "utf-8");
    if (text.charCodeAt(0) === 0xfeff) text = text.slice(1); // BOM 제거
    const parsed = Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
    const schools = (parsed.data as SchoolRecord[]).filter(
      (r) => r && r["학교명"],
    );
    return { ok: true, schools };
  } catch (e) {
    return {
      ok: false,
      error: `CSV 파싱 오류: ${(e as Error).message}`,
      schools: [],
    };
  }
}

export function loadWideData(): WideResponse {
  const filePath = resolveDataPath(XLSX_NAME);
  if (!filePath) {
    return {
      ok: false,
      error: `데이터 파일을 찾을 수 없습니다: data/${XLSX_NAME}`,
      rows: [],
    };
  }
  try {
    const buf = fs.readFileSync(filePath);
    const wb = XLSX.read(buf, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<WideRecord>(sheet, { defval: null });
    return { ok: true, rows: rows.filter((r) => r && r["학교명"]) };
  } catch (e) {
    return {
      ok: false,
      error: `Excel 파싱 오류: ${(e as Error).message}`,
      rows: [],
    };
  }
}
