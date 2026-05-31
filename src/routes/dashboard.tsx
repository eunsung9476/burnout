import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getSchoolData, getWideData } from "@/lib/school-data.functions";
import {
  GRADE_LABEL,
  GRADE_COLOR,
  LEVEL_INCLUDE,
  SCORE_COLS,
  RISK_TYPES,
  GRADE_ORDER,
} from "@/lib/constants";
import {
  fitScaler,
  normalizeScores,
  predictLR,
  kmeans,
  mean,
  median,
} from "@/lib/analysis";
import type { SchoolRecord } from "@/lib/types";
import { PlotlyChart } from "@/components/dashboard/PlotlyChart";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "분석 대시보드 | 교사 번아웃 위험학교" },
      {
        name: "description",
        content:
          "전국 위험학교 지도, 추이 예측, 군집분석, 학교 비교, 임계치 시뮬레이터, 지역 랭킹.",
      },
    ],
  }),
  component: Dashboard,
});

const TABS = [
  "📊 현황 대시보드",
  "📈 추이 & 예측",
  "🔬 군집분석",
  "⚖️ 학교 비교",
  "🧪 임계치 시뮬레이터",
  "🗺️ 지역 랭킹",
];

function num(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["school-data"],
    queryFn: () => getSchoolData(),
  });

  const [tab, setTab] = useState(0);
  const [w1, setW1] = useState(0.33);
  const [w2, setW2] = useState(0.33);
  const [w3, setW3] = useState(0.34);
  const [riskLevel, setRiskLevel] = useState("심각 (상위 1%)");
  const [region, setRegion] = useState("전체");
  const [schoolType, setSchoolType] = useState("전체");
  const [search, setSearch] = useState("");

  const schools = data?.schools ?? [];
  const ok = data?.ok ?? false;

  // 스케일러 (전체 데이터 기준) + 종합위험지수 계산
  const dfWithComposite = useMemo(() => {
    if (!schools.length) return [] as SchoolRecord[];
    const rows = schools.map((s) =>
      SCORE_COLS.map((c) => num(s[c])),
    );
    const scaler = fitScaler(rows);
    const normed = normalizeScores(scaler, rows);
    const totalW = w1 + w2 + w3 || 1;
    return schools.map((s, i) => ({
      ...s,
      종합위험지수:
        (normed[i][0] * w1 + normed[i][1] * w2 + normed[i][2] * w3) / totalW,
    }));
  }, [schools, w1, w2, w3]);

  const scaler = useMemo(
    () =>
      schools.length
        ? fitScaler(schools.map((s) => SCORE_COLS.map((c) => num(s[c]))))
        : null,
    [schools],
  );

  const regions = useMemo(
    () => Array.from(new Set(schools.map((s) => s.시도).filter(Boolean))).sort(),
    [schools],
  );
  const schoolTypes = useMemo(
    () => Array.from(new Set(schools.map((s) => s.학교급).filter(Boolean))).sort(),
    [schools],
  );

  if (isLoading) {
    return <Centered>데이터를 불러오는 중...</Centered>;
  }
  if (!ok) {
    return (
      <Centered>
        <div style={{ textAlign: "center", maxWidth: 560 }}>
          <div style={{ fontSize: "2.4rem", marginBottom: 16 }}>📂</div>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.4rem",
              fontWeight: 900,
              marginBottom: 12,
            }}
          >
            데이터 파일이 필요합니다
          </h2>
          <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>
            {data?.error}
            <br />
            프로젝트의 <code style={{ color: "var(--accent-red)" }}>data/</code>{" "}
            폴더에 아래 파일을 넣어주세요:
            <br />
            <code style={{ color: "var(--accent-yellow)" }}>
              final_school_data.csv
            </code>
            ,{" "}
            <code style={{ color: "var(--accent-yellow)" }}>
              school_wide_final.xlsx
            </code>
          </p>
          <Link
            to="/"
            style={{ color: "var(--accent-blue)", display: "inline-block", marginTop: 20 }}
          >
            ← 홈으로
          </Link>
        </div>
      </Centered>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* 사이드바 */}
      <aside
        style={{
          width: 300,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--bg2)",
          padding: 20,
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <Link
          to="/"
          style={{
            color: "var(--text-muted)",
            fontSize: ".85rem",
            textDecoration: "none",
          }}
        >
          ← 홈으로
        </Link>
        <h3 style={{ fontFamily: "var(--font-serif)", fontWeight: 900, margin: "14px 0 18px" }}>
          🔧 필터 & 설정
        </h3>

        <SideLabel>종합위험지수 가중치</SideLabel>
        <Slider label="과밀 가중치" value={w1} min={0} max={1} step={0.01} onChange={setW1} />
        <Slider label="소멸 가중치" value={w2} min={0} max={1} step={0.01} onChange={setW2} />
        <Slider label="기간제 가중치" value={w3} min={0} max={1} step={0.01} onChange={setW3} />
        <p style={{ fontSize: ".72rem", color: "var(--text-dim)", marginBottom: 18 }}>
          가중치 합계: <strong>{(w1 + w2 + w3).toFixed(2)}</strong> (자동 정규화)
        </p>

        <SideLabel>기본 필터</SideLabel>
        <Select label="위험 등급" value={riskLevel} onChange={setRiskLevel} options={Object.keys(LEVEL_INCLUDE)} />
        <Select label="지역" value={region} onChange={setRegion} options={["전체", ...regions]} />
        <Select label="학교급" value={schoolType} onChange={setSchoolType} options={["전체", ...schoolTypes]} />
        <div style={{ marginBottom: 14 }}>
          <FieldLabel>학교 검색</FieldLabel>
          <input
            className="dash-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="학교명 입력"
          />
        </div>
      </aside>

      {/* 메인 */}
      <main style={{ flex: 1, padding: "24px 28px", minWidth: 0 }}>
        <DashStyle />
        <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "1.6rem", marginBottom: 18 }}>
          🏫 교사 번아웃 위험학교 종합 분석
        </h1>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className="dash-tab"
              data-active={tab === i}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <Tab1
            df={dfWithComposite}
            scaler={scaler!}
            riskLevel={riskLevel}
            region={region}
            schoolType={schoolType}
            search={search}
            weights={[w1, w2, w3]}
          />
        )}
        {tab === 1 && <Tab2 schoolTypes={schoolTypes} regions={regions} />}
        {tab === 2 && (
          <Tab3 df={filterBy(dfWithComposite, "과밀등급", riskLevel, region, schoolType, search)} schoolTypes={schoolTypes} />
        )}
        {tab === 3 && (
          <Tab4 df={filterBy(dfWithComposite, "과밀등급", riskLevel, region, schoolType, search)} />
        )}
        {tab === 4 && (
          <Tab5 df={filterBy(dfWithComposite, "과밀등급", riskLevel, region, schoolType, search)} allDf={dfWithComposite} weights={[w1, w2, w3]} />
        )}
        {tab === 5 && (
          <Tab6 df={filterBy(dfWithComposite, "과밀등급", riskLevel, region, schoolType, search)} />
        )}
      </main>
    </div>
  );
}

// ───────── 필터 헬퍼 ─────────
function filterBy(
  df: SchoolRecord[],
  riskType: string,
  riskLevel: string,
  region: string,
  schoolType: string,
  search: string,
): SchoolRecord[] {
  const include = LEVEL_INCLUDE[riskLevel];
  let out = df.filter((s) => include.includes(String(s[riskType])));
  out = out.map((s) => ({ ...s, 위험등급명: GRADE_LABEL[String(s[riskType])] }));
  if (region !== "전체") out = out.filter((s) => s.시도 === region);
  if (schoolType !== "전체") out = out.filter((s) => s.학교급 === schoolType);
  if (search) out = out.filter((s) => String(s.학교명).includes(search));
  return out.sort((a, b) => (b.종합위험지수 ?? 0) - (a.종합위험지수 ?? 0));
}

// ───────── TAB 1 ─────────
function Tab1({
  df,
  scaler,
  riskLevel,
  region,
  schoolType,
  search,
  weights,
}: {
  df: SchoolRecord[];
  scaler: ReturnType<typeof fitScaler>;
  riskLevel: string;
  region: string;
  schoolType: string;
  search: string;
  weights: number[];
}) {
  const [riskType, setRiskType] = useState<string>("과밀등급");
  const scoreColumn = riskType.replace("등급", "score");
  const fdf = useMemo(
    () => filterBy(df, riskType, riskLevel, region, schoolType, search),
    [df, riskType, riskLevel, region, schoolType, search],
  );
  const [selected, setSelected] = useState<string>("");
  const schoolList = useMemo(
    () => Array.from(new Set(fdf.map((s) => s.학교명))).sort(),
    [fdf],
  );
  const sel = fdf.find((s) => s.학교명 === selected) ?? (schoolList[0] ? fdf.find((s) => s.학교명 === schoolList[0]) : undefined);

  const [w1, w2, w3] = weights;
  const totalW = w1 + w2 + w3 || 1;

  // 지도
  const map = useMemo(() => {
    const vals = fdf.map((s) => s.종합위험지수 ?? 0);
    return {
      lat: fdf.map((s) => num(s.위도)),
      lon: fdf.map((s) => num(s.경도)),
      vals,
      text: fdf.map((s) => `${s.학교명} (${s.시도} ${s.학교급})<br>종합위험지수 ${(s.종합위험지수 ?? 0).toFixed(1)}`),
      size: vals.map((v) => {
        const mn = Math.min(...vals);
        const rng = Math.max(...vals) - mn || 1;
        return ((v - mn) / rng) * 17 + 5;
      }),
    };
  }, [fdf]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {RISK_TYPES.map((r) => (
          <button key={r} className="dash-tab" data-active={riskType === r} onClick={() => setRiskType(r)}>
            {r}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <Metric label="위험학교 수" value={`${fdf.length}`} />
        <Metric label="평균 종합위험지수" value={`${mean(fdf.map((s) => s.종합위험지수 ?? 0)).toFixed(1)}점`} />
      </div>

      <Card title="전국 위험학교 지도">
        <PlotlyChart
          data={[
            {
              type: "scattermapbox",
              lat: map.lat,
              lon: map.lon,
              text: map.text,
              hoverinfo: "text",
              marker: {
                size: map.size,
                color: map.vals,
                colorscale: [[0, "#ffffb2"], [0.25, "#fecc5c"], [0.5, "#fd8d3c"], [0.75, "#f03b20"], [1, "#bd0026"]],
                showscale: true,
                colorbar: { title: "종합위험지수" },
                opacity: 0.88,
              },
            },
          ]}
          layout={{
            mapbox: { style: "open-street-map", center: { lat: 36.5, lon: 127.8 }, zoom: 6 },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            height: 560,
          }}
          style={{ height: 560 }}
        />
      </Card>

      <Card title="학교급별 위험등급 분포">
        <StackedGrade fdf={fdf} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="위험학교 TOP10">
          <Table
            headers={["#", "학교명", "시도", "학교급", "위험등급", "종합위험지수"]}
            rows={fdf.slice(0, 10).map((s, i) => [
              String(i + 1),
              String(s.학교명),
              String(s.시도),
              String(s.학교급),
              String(s.위험등급명 ?? ""),
              (s.종합위험지수 ?? 0).toFixed(1),
            ])}
          />
        </Card>
        <Card title="시도별 위험학교 수">
          <RegionCount fdf={fdf} />
        </Card>
      </div>

      {/* 학교 선택 + 상세 */}
      <Card title="🎓 학교 상세 분석">
        <Select
          label="학교 선택"
          value={sel?.학교명 ?? ""}
          onChange={setSelected}
          options={schoolList}
        />
        {sel && (
          <SchoolDetail sel={sel} df={df} scaler={scaler} riskType={riskType} weights={weights} totalW={totalW} scoreColumn={scoreColumn} />
        )}
      </Card>

      <DownloadCsv fdf={fdf} />
    </div>
  );
}

function SchoolDetail({
  sel,
  df,
  scaler,
  riskType,
  weights,
  totalW,
}: {
  sel: SchoolRecord;
  df: SchoolRecord[];
  scaler: ReturnType<typeof fitScaler>;
  riskType: string;
  weights: number[];
  totalW: number;
  scoreColumn: string;
}) {
  const comp = sel.종합위험지수 ?? 0;
  const radar = normalizeScores(scaler, [[num(sel.과밀score), num(sel.소멸score), num(sel.기간제score)]])[0];
  const avg = normalizeScores(scaler, [[mean(df.map((s) => num(s.과밀score))), mean(df.map((s) => num(s.소멸score))), mean(df.map((s) => num(s.기간제score)))]])[0];
  const [w1, w2, w3] = weights;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <span style={{ padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: ".82rem", background: GRADE_COLOR[GRADE_LABEL[String(sel[riskType])]] ?? "#555", color: "#fff" }}>
          {GRADE_LABEL[String(sel[riskType])] ?? String(sel[riskType])}
        </span>
        <span style={{ color: "var(--text-muted)" }}>
          {sel.시도} · {sel.학교급} · {sel.지역규모 ?? "-"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <SideLabel>종합 위험지수</SideLabel>
          <PlotlyChart
            data={[
              {
                type: "indicator",
                mode: "gauge+number",
                value: comp,
                number: { suffix: "점" },
                gauge: {
                  axis: { range: [0, 100] },
                  bar: { color: "#e74c3c" },
                  steps: [
                    { range: [0, 50], color: "#d4efdf" },
                    { range: [50, 75], color: "#fdebd0" },
                    { range: [75, 100], color: "#fadbd8" },
                  ],
                  threshold: { line: { color: "#c0392b", width: 3 }, thickness: 0.75, value: 75 },
                },
              },
            ]}
            layout={{ height: 260, margin: { t: 20, b: 10, l: 20, r: 20 } }}
            style={{ height: 260 }}
          />
          <p style={{ fontSize: ".75rem", color: "var(--text-dim)", textAlign: "center" }}>
            가중치 — 과밀 {(w1 / totalW * 100).toFixed(0)}% | 소멸 {(w2 / totalW * 100).toFixed(0)}% | 기간제 {(w3 / totalW * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <SideLabel>위험 프로파일 (전국 평균 비교)</SideLabel>
          <PlotlyChart
            data={[
              {
                type: "scatterpolar",
                r: [...radar, radar[0]],
                theta: ["과밀 위험성", "소멸 위험성", "기간제 취약성", "과밀 위험성"],
                fill: "toself",
                name: String(sel.학교명),
                line: { color: "#e74c3c" },
              },
              {
                type: "scatterpolar",
                r: [...avg, avg[0]],
                theta: ["과밀 위험성", "소멸 위험성", "기간제 취약성", "과밀 위험성"],
                fill: "toself",
                name: "전국 평균",
                line: { color: "#2196F3", dash: "dot" },
              },
            ]}
            layout={{ polar: { radialaxis: { visible: true, range: [0, 100] } }, height: 280, legend: { orientation: "h" }, margin: { t: 20, b: 40 } }}
            style={{ height: 280 }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
        <Metric label="학생수" value={Math.round(num(sel.학생수)).toString()} delta={Math.round(num(sel.학생수) - mean(df.map((s) => num(s.학생수))))} />
        <Metric label="교원 1인당 학생수" value={num(sel.교원1인당학생수).toFixed(2)} delta={+(num(sel.교원1인당학생수) - mean(df.map((s) => num(s.교원1인당학생수)))).toFixed(2)} />
        <Metric label="기간제 비율(%)" value={(num(sel.기간제비율) * 100).toFixed(1)} delta={+((num(sel.기간제비율) - mean(df.map((s) => num(s.기간제비율)))) * 100).toFixed(1)} />
      </div>

      <div style={{ marginTop: 16 }}>
        <SideLabel>⚠️ 위험 요인 진단</SideLabel>
        <Diag ok={num(sel.기간제비율) <= 0.3} okMsg="기간제 교원 비율 정상" warnMsg="기간제 교원 비율 높음 (30% 초과)" />
        <Diag ok={num(sel.교원1인당학생수) <= 15} okMsg="교원 대비 학생 수 정상" warnMsg="과밀학급 위험 — 교원당 학생수 15명 초과" />
        <Diag ok={num(sel.학생수) >= 60} okMsg="학생 수 정상" warnMsg="학생 수 감소 위험 (60명 미만)" />
        {comp >= 75 && <Diag ok={false} okMsg="" warnMsg="종합위험지수 75점 이상 — 최고 위험 등급!" />}
      </div>
    </div>
  );
}

// ───────── TAB 2 ─────────
const YEARS_ACTUAL = [2020, 2021, 2022, 2024];
const YEARS_PREDICT = [2025, 2026];

function Tab2({ schoolTypes, regions }: { schoolTypes: string[]; regions: string[] }) {
  const { data } = useQuery({ queryKey: ["wide-data"], queryFn: () => getWideData() });
  const rows = data?.rows ?? [];
  const [levelFilter, setLevelFilter] = useState("전체");
  const filtered = levelFilter === "전체" ? rows : rows.filter((r) => r.학교급 === levelFilter);
  const schoolList = useMemo(() => Array.from(new Set(filtered.map((r) => String(r.학교명)))).sort(), [filtered]);
  const [sel, setSel] = useState("");
  const current = sel || schoolList[0] || "";
  const row = filtered.find((r) => String(r.학교명) === current);

  if (!data) return <Card title="추이 & 예측"><p style={{ color: "var(--text-muted)" }}>연도별 데이터를 불러오는 중...</p></Card>;
  if (!data.ok) return <Card title="추이 & 예측"><p style={{ color: "var(--accent-yellow)" }}>{data.error} — data/school_wide_final.xlsx 를 넣어주세요.</p></Card>;

  const sVals = row ? YEARS_ACTUAL.map((y) => num(row[`학생수_총계_계_${y}`])) : [];
  const tVals = row ? YEARS_ACTUAL.map((y) => num(row[`교원수_총계_계_${y}`])) : [];
  const sPred = predictLR(YEARS_ACTUAL, sVals, YEARS_PREDICT);
  const tPred = predictLR(YEARS_ACTUAL, tVals, YEARS_PREDICT);

  // 시도별 평균 학생수 추이
  const sidoTrend = regions.map((sido) => {
    const sr = rows.filter((r) => r.시도 === sido);
    return {
      x: YEARS_ACTUAL,
      y: YEARS_ACTUAL.map((y) => mean(sr.map((r) => num(r[`학생수_총계_계_${y}`])).filter((v) => v > 0))),
      name: sido,
      type: "scatter",
      mode: "lines+markers",
    };
  });

  return (
    <div>
      <Card title="연도별 추이 및 미래 소멸 예측">
        <Select label="학교급 필터" value={levelFilter} onChange={setLevelFilter} options={["전체", ...schoolTypes]} />
        <Select label="추이 분석할 학교" value={current} onChange={setSel} options={schoolList} />
        {row && (
          <PlotlyChart
            data={[
              { x: YEARS_ACTUAL, y: sVals, mode: "lines+markers", name: "학생수 (실제)", line: { color: "#e74c3c" } },
              { x: [2024, ...YEARS_PREDICT], y: [sVals[sVals.length - 1], ...sPred], mode: "lines+markers", name: "학생수 (예측)", line: { color: "#e74c3c", dash: "dash" } },
              { x: YEARS_ACTUAL, y: tVals, mode: "lines+markers", name: "교원수 (실제)", line: { color: "#2980b9" } },
              { x: [2024, ...YEARS_PREDICT], y: [tVals[tVals.length - 1], ...tPred], mode: "lines+markers", name: "교원수 (예측)", line: { color: "#2980b9", dash: "dash" } },
            ]}
            layout={{ height: 460, xaxis: { title: "연도" }, yaxis: { title: "인원 수" }, legend: { orientation: "h" } }}
            style={{ height: 460 }}
          />
        )}
        {row && (
          <Table
            headers={["연도", "학생수", "교원수", "구분"]}
            rows={[
              ...YEARS_ACTUAL.map((y, i) => [String(y), sVals[i].toFixed(1), tVals[i].toFixed(1), "실제"]),
              ...YEARS_PREDICT.map((y, i) => [String(y), sPred[i].toFixed(1), tPred[i].toFixed(1), "예측(ML)"]),
            ]}
          />
        )}
      </Card>
      <Card title="시도별 평균 학생수 추이 (2020~2024)">
        <PlotlyChart data={sidoTrend} layout={{ height: 450, xaxis: { title: "연도" }, yaxis: { title: "평균학생수" } }} style={{ height: 450 }} />
      </Card>
    </div>
  );
}

// ───────── TAB 3 ─────────
function Tab3({ df, schoolTypes }: { df: SchoolRecord[]; schoolTypes: string[] }) {
  const [k, setK] = useState(4);
  const [filter, setFilter] = useState("전체");
  const cdf = filter === "전체" ? df : df.filter((s) => s.학교급 === filter);
  const result = useMemo(() => {
    if (!cdf.length) return [];
    const rows = cdf.map((s) => SCORE_COLS.map((c) => num(s[c])));
    const scaler = fitScaler(rows);
    const scaled = normalizeScores(scaler, rows);
    const labels = kmeans(scaled, k);
    return cdf.map((s, i) => ({ ...s, 군집: String(labels[i]) }));
  }, [cdf, k]);

  const clusters = Array.from(new Set(result.map((r) => r.군집))).sort();
  const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"];

  return (
    <div>
      <Card title="K-Means 군집 분석">
        <Slider label={`군집 수 (K) = ${k}`} value={k} min={2} max={8} step={1} onChange={(v) => setK(Math.round(v))} />
        <Select label="학교급 필터" value={filter} onChange={setFilter} options={["전체", ...schoolTypes]} />
        <PlotlyChart
          data={clusters.map((c, ci) => {
            const grp = result.filter((r) => r.군집 === c);
            return {
              type: "scatter",
              mode: "markers",
              name: `군집 ${c}`,
              x: grp.map((r) => num(r.과밀score)),
              y: grp.map((r) => num(r.소멸score)),
              text: grp.map((r) => String(r.학교명)),
              marker: { size: grp.map((r) => 6 + num(r.기간제score) * 14), color: colors[ci % colors.length], opacity: 0.65 },
            };
          })}
          layout={{ height: 560, xaxis: { title: "과밀score" }, yaxis: { title: "소멸score" } }}
          style={{ height: 560 }}
        />
      </Card>
      <Card title="군집별 평균 통계">
        <Table
          headers={["군집", "평균 과밀", "평균 소멸", "평균 기간제", "평균 학생수", "평균 교원당학생수"]}
          rows={clusters.map((c) => {
            const grp = result.filter((r) => r.군집 === c);
            return [
              c,
              mean(grp.map((r) => num(r.과밀score))).toFixed(4),
              mean(grp.map((r) => num(r.소멸score))).toFixed(4),
              mean(grp.map((r) => num(r.기간제score))).toFixed(4),
              mean(grp.map((r) => num(r.학생수))).toFixed(1),
              mean(grp.map((r) => num(r.교원1인당학생수))).toFixed(2),
            ];
          })}
        />
      </Card>
    </div>
  );
}

// ───────── TAB 4 ─────────
function Tab4({ df }: { df: SchoolRecord[] }) {
  const list = Array.from(new Set(df.map((s) => s.학교명))).sort();
  const [a, setA] = useState(list[0] ?? "");
  const [b, setB] = useState(list[1] ?? list[0] ?? "");
  const ra = df.find((s) => s.학교명 === (a || list[0]));
  const rb = df.find((s) => s.학교명 === (b || list[1] || list[0]));
  if (!ra || !rb) return <Card title="학교 비교"><p style={{ color: "var(--text-muted)" }}>비교할 학교가 없습니다.</p></Card>;

  const indicators = ["과밀score", "소멸score", "기간제score", "교원1인당학생수", "기간제비율", "학생수"];
  const labels = ["과밀 점수", "소멸 점수", "기간제 점수", "교원당 학생수", "기간제 비율", "학생수"];
  const getV = (r: SchoolRecord, c: string) => (c === "기간제비율" ? num(r[c]) * 100 : num(r[c]));
  const maxes = indicators.map((c) => (c === "기간제비율" ? 100 : Math.max(...df.map((s) => num(s[c])), 1e-9)));
  const va = indicators.map((c) => getV(ra, c));
  const vb = indicators.map((c) => getV(rb, c));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Select label="학교 A" value={ra.학교명} onChange={setA} options={list} />
        <Select label="학교 B" value={rb.학교명} onChange={setB} options={list} />
      </div>
      <Card title={`${ra.학교명}  vs  ${rb.학교명}`}>
        <PlotlyChart
          data={[
            { type: "bar", orientation: "h", y: labels, x: va.map((v, i) => -(v / maxes[i]) * 100), name: String(ra.학교명), marker: { color: "#e74c3c" } },
            { type: "bar", orientation: "h", y: labels, x: vb.map((v, i) => (v / maxes[i]) * 100), name: String(rb.학교명), marker: { color: "#2196F3" } },
          ]}
          layout={{ barmode: "relative", height: 450, legend: { orientation: "h" }, xaxis: { title: "← A | B →" } }}
          style={{ height: 450 }}
        />
      </Card>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Metric label={`${ra.학교명} 종합위험지수`} value={`${(ra.종합위험지수 ?? 0).toFixed(2)}점`} />
        <Metric label={`${rb.학교명} 종합위험지수`} value={`${(rb.종합위험지수 ?? 0).toFixed(2)}점`} delta={+((rb.종합위험지수 ?? 0) - (ra.종합위험지수 ?? 0)).toFixed(2)} />
      </div>
    </div>
  );
}

// ───────── TAB 5 ─────────
function Tab5({ df, allDf, weights }: { df: SchoolRecord[]; allDf: SchoolRecord[]; weights: number[] }) {
  const list = Array.from(new Set(df.map((s) => s.학교명))).sort();
  const [selName, setSelName] = useState(list[0] ?? "");
  const row = df.find((s) => s.학교명 === (selName || list[0]));
  const maxTeacher = Math.max(...allDf.map((s) => num(s.교원1인당학생수)), 1);
  const maxStudents = Math.max(...allDf.map((s) => num(s.학생수)), 1);
  const [students, setStudents] = useState(row ? num(row.학생수) : 100);
  const [tempRatio, setTempRatio] = useState(row ? num(row.기간제비율) * 100 : 20);
  const [teacherRatio, setTeacherRatio] = useState(row ? num(row.교원1인당학생수) : 15);
  const [threshold, setThreshold] = useState(75);
  const [w1, w2, w3] = weights;
  const totalW = w1 + w2 + w3 || 1;

  if (!row) return <Card title="임계치 시뮬레이터"><p style={{ color: "var(--text-muted)" }}>학교가 없습니다.</p></Card>;

  const overcrowd = (teacherRatio / maxTeacher) * 100;
  const extinct = Math.max(0, 1 - students / maxStudents) * 100;
  const tempNorm = tempRatio;
  const composite = Math.min((overcrowd * w1 + extinct * w2 + tempNorm * w3) / totalW, 100);
  const orig = row.종합위험지수 ?? 0;

  return (
    <Card title={`🧪 ${row.학교명} 임계치 시뮬레이터`}>
      <Select label="시뮬레이션 학교" value={row.학교명} onChange={(v) => { setSelName(v); const r = df.find((s) => s.학교명 === v); if (r) { setStudents(num(r.학생수)); setTempRatio(num(r.기간제비율) * 100); setTeacherRatio(num(r.교원1인당학생수)); } }} options={list} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Slider label={`학생수: ${Math.round(students)}`} value={students} min={1} max={3000} step={1} onChange={setStudents} />
        <Slider label={`교원 1인당 학생수: ${teacherRatio.toFixed(1)}`} value={teacherRatio} min={1} max={40} step={0.1} onChange={setTeacherRatio} />
        <Slider label={`기간제 비율(%): ${tempRatio.toFixed(1)}`} value={tempRatio} min={0} max={100} step={0.1} onChange={setTempRatio} />
        <Slider label={`위험 임계치: ${threshold}`} value={threshold} min={0} max={100} step={1} onChange={(v) => setThreshold(Math.round(v))} />
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "16px 0" }}>
        <Metric label="가상 과밀" value={overcrowd.toFixed(1)} />
        <Metric label="가상 소멸" value={extinct.toFixed(1)} />
        <Metric label="가상 기간제" value={tempNorm.toFixed(1)} />
        <Metric label="가상 종합위험지수" value={`${composite.toFixed(2)}점`} />
      </div>
      <p style={{ color: composite >= threshold ? "var(--accent-red)" : composite >= threshold * 0.75 ? "var(--accent-yellow)" : "#2ecc71", fontWeight: 700 }}>
        {composite >= threshold ? "🔴 최고위험 (임계치 초과!)" : composite >= threshold * 0.75 ? "🟡 경고 (임계치 근접)" : "🟢 안전"}
      </p>
      <p style={{ color: "var(--text-muted)" }}>원래 {orig.toFixed(2)}점 → 시뮬레이션 {composite.toFixed(2)}점 ({(composite - orig >= 0 ? "+" : "") + (composite - orig).toFixed(2)}점)</p>
      <PlotlyChart
        data={[{ type: "indicator", mode: "gauge+number", value: composite, gauge: { axis: { range: [0, 100] }, bar: { color: "#e74c3c" }, steps: [{ range: [0, threshold * 0.75], color: "#d4efdf" }, { range: [threshold * 0.75, threshold], color: "#fdebd0" }, { range: [threshold, 100], color: "#fadbd8" }], threshold: { line: { color: "black", width: 4 }, thickness: 0.75, value: threshold } } }]}
        layout={{ height: 340 }}
        style={{ height: 340 }}
      />
    </Card>
  );
}

// ───────── TAB 6 ─────────
function Tab6({ df }: { df: SchoolRecord[] }) {
  const regionAvg = useMemo(() => {
    const m: Record<string, number[]> = {};
    df.forEach((s) => { (m[s.시도] ??= []).push(s.종합위험지수 ?? 0); });
    return Object.entries(m).map(([sido, vals]) => ({ sido, avg: mean(vals), count: vals.length })).sort((a, b) => a.avg - b.avg);
  }, [df]);

  const districtAvg = useMemo(() => {
    const m: Record<string, { vals: number[]; sido: string; gu: string }> = {};
    df.forEach((s) => {
      const gu = String(s.행정구 ?? "");
      if (!gu) return;
      const key = `${s.시도}|${gu}`;
      (m[key] ??= { vals: [], sido: s.시도, gu }).vals.push(s.종합위험지수 ?? 0);
    });
    return Object.values(m).map((v) => ({ ...v, avg: mean(v.vals) })).sort((a, b) => b.avg - a.avg).slice(0, 20);
  }, [df]);

  return (
    <div>
      <Card title="시도별 평균 종합위험지수 랭킹">
        <PlotlyChart
          data={[{ type: "bar", orientation: "h", y: regionAvg.map((r) => r.sido), x: regionAvg.map((r) => r.avg), marker: { color: regionAvg.map((r) => r.avg), colorscale: "RdYlGn", reversescale: true, showscale: true } }]}
          layout={{ height: 520, xaxis: { title: "평균 종합위험지수" } }}
          style={{ height: 520 }}
        />
      </Card>
      <Card title="시도별 상세 위험 통계">
        <Table
          headers={["#", "시도", "위험학교수", "평균 종합위험지수"]}
          rows={[...regionAvg].sort((a, b) => b.avg - a.avg).map((r, i) => [String(i + 1), r.sido, String(r.count), r.avg.toFixed(2)])}
        />
      </Card>
      {districtAvg.length > 0 && (
        <Card title="행정구(시군구)별 평균 종합위험지수 TOP 20">
          <PlotlyChart
            data={[{ type: "bar", orientation: "h", y: districtAvg.map((d) => `${d.sido} ${d.gu}`), x: districtAvg.map((d) => d.avg), marker: { color: "#e8533a" } }]}
            layout={{ height: 600, xaxis: { title: "평균 종합위험지수" }, margin: { l: 160 } }}
            style={{ height: 600 }}
          />
        </Card>
      )}
    </div>
  );
}

// ───────── 공용 UI ─────────
function StackedGrade({ fdf }: { fdf: SchoolRecord[] }) {
  const types = Array.from(new Set(fdf.map((s) => s.학교급)));
  const grades = Object.keys(GRADE_ORDER).sort((a, b) => GRADE_ORDER[a] - GRADE_ORDER[b]);
  return (
    <PlotlyChart
      data={grades.map((g) => ({
        type: "bar",
        name: g,
        x: types,
        y: types.map((t) => fdf.filter((s) => s.학교급 === t && s.위험등급명 === g).length),
        marker: { color: GRADE_COLOR[g] },
      }))}
      layout={{ barmode: "stack", height: 380, xaxis: { title: "학교급" }, yaxis: { title: "학교 수" } }}
      style={{ height: 380 }}
    />
  );
}

function RegionCount({ fdf }: { fdf: SchoolRecord[] }) {
  const m: Record<string, number> = {};
  fdf.forEach((s) => { m[s.시도] = (m[s.시도] ?? 0) + 1; });
  const entries = Object.entries(m).sort((a, b) => b[1] - a[1]);
  return (
    <PlotlyChart
      data={[{ type: "bar", x: entries.map((e) => e[0]), y: entries.map((e) => e[1]), marker: { color: "#4a9eff" } }]}
      layout={{ height: 380, xaxis: { title: "시도" }, yaxis: { title: "학교 수" } }}
      style={{ height: 380 }}
    />
  );
}

function DownloadCsv({ fdf }: { fdf: SchoolRecord[] }) {
  const download = () => {
    if (!fdf.length) return;
    const keys = Object.keys(fdf[0]).filter((k) => k !== "_map_size");
    const lines = [keys.join(",")];
    fdf.forEach((s) => lines.push(keys.map((k) => JSON.stringify(s[k] ?? "")).join(",")));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "위험학교목록.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button className="dash-tab" data-active={false} style={{ marginTop: 16 }} onClick={download}>
      📥 위험학교 데이터 전체 다운로드 (CSV)
    </button>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      {children}
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: "1rem" }}>{title}</h3>
      {children}
    </div>
  );
}
function Metric({ label, value, delta }: { label: string; value: string; delta?: number }) {
  return (
    <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", minWidth: 150 }}>
      <div style={{ fontSize: ".75rem", color: "var(--text-dim)" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.4rem", fontWeight: 500 }}>{value}</div>
      {delta !== undefined && (
        <div style={{ fontSize: ".75rem", color: delta >= 0 ? "#e74c3c" : "#2ecc71" }}>{delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}</div>
      )}
    </div>
  );
}
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".82rem" }}>
        <thead>
          <tr>{headers.map((h) => <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Diag({ ok, okMsg, warnMsg }: { ok: boolean; okMsg: string; warnMsg: string }) {
  return (
    <div style={{ padding: "6px 0", color: ok ? "#2ecc71" : "var(--accent-yellow)", fontSize: ".88rem" }}>
      {ok ? `✔ ${okMsg}` : `⚠ ${warnMsg}`}
    </div>
  );
}
function SideLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--text-muted)", margin: "14px 0 8px" }}>{children}</div>;
}
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ display: "block", fontSize: ".75rem", color: "var(--text-muted)", marginBottom: 4 }}>{children}</label>;
}
function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <FieldLabel>{label}</FieldLabel>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: "#e8533a" }} />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <FieldLabel>{label}</FieldLabel>
      <select className="dash-input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
function DashStyle() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
.dash-input{width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);color:var(--text-main);border-radius:8px;font-size:.85rem;outline:none}
.dash-input:focus{border-color:var(--accent-red)}
.dash-tab{padding:8px 16px;border:1px solid var(--border);background:var(--bg3);color:var(--text-muted);border-radius:8px;font-size:.85rem;cursor:pointer;transition:all .2s;font-family:var(--font-sans)}
.dash-tab:hover{color:var(--text-main)}
.dash-tab[data-active="true"]{background:var(--accent-red);color:#fff;border-color:var(--accent-red);font-weight:700}
` }} />
  );
}
