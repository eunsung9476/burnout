// 백엔드 서버 함수 — 클라이언트가 호출하는 RPC
import { createServerFn } from "@tanstack/react-start";
import { loadSchoolData, loadWideData } from "./school-data.server";

export const getSchoolData = createServerFn({ method: "GET" }).handler(
  async () => {
    return loadSchoolData();
  },
);

export const getWideData = createServerFn({ method: "GET" }).handler(
  async () => {
    return loadWideData();
  },
);
