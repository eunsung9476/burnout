import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useState, useMemo } from "react";
import { g as getSchoolData, a as getWideData } from "./school-data.functions-1cJyJqaX.js";
import "./server-BfycGJ7Q.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
const GRADE_LABEL = {
  TOP1: "심각 (상위 1%)",
  TOP3: "경고 (상위 3%)",
  TOP5: "주의 (상위 5%)"
};
const GRADE_COLOR = {
  "심각 (상위 1%)": "#d32f2f",
  "경고 (상위 3%)": "#f57c00",
  "주의 (상위 5%)": "#1976d2"
};
const LEVEL_INCLUDE = {
  "심각 (상위 1%)": ["TOP1"],
  "경고 (상위 3%)": ["TOP1", "TOP3"],
  "주의 (상위 5%)": ["TOP1", "TOP3", "TOP5"]
};
const SCORE_COLS = ["과밀score", "소멸score", "기간제score"];
const RISK_TYPES = ["과밀등급", "소멸등급", "기간제등급"];
const GRADE_ORDER = {
  "심각 (상위 1%)": 3,
  "경고 (상위 3%)": 2,
  "주의 (상위 5%)": 1
};
function fitScaler(rows) {
  const cols = rows[0]?.length ?? 0;
  const min = new Array(cols).fill(Infinity);
  const max = new Array(cols).fill(-Infinity);
  for (const r of rows) {
    for (let c = 0; c < cols; c++) {
      const v = r[c];
      if (v < min[c]) min[c] = v;
      if (v > max[c]) max[c] = v;
    }
  }
  const range = min.map((m, c) => max[c] - m || 1);
  return { min, range };
}
function normalizeScores(scaler, rows) {
  return rows.map(
    (r) => r.map((v, c) => (v - scaler.min[c]) / scaler.range[c] * 100)
  );
}
function predictLR(years, vals, futureYears) {
  const pts = [];
  for (let i = 0; i < years.length; i++) {
    const y = vals[i];
    if (y != null && !Number.isNaN(y)) pts.push([years[i], y]);
  }
  if (pts.length < 2) return futureYears.map(() => NaN);
  const n = pts.length;
  const sx = pts.reduce((a, p) => a + p[0], 0);
  const sy = pts.reduce((a, p) => a + p[1], 0);
  const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0);
  const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0);
  const denom = n * sxx - sx * sx || 1;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return futureYears.map((fy) => slope * fy + intercept);
}
function mulberry32(seed) {
  return function() {
    seed |= 0;
    seed = seed + 1831565813 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function dist2(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return s;
}
function kmeans(data, k, maxIter = 100, seed = 42) {
  const n = data.length;
  if (n === 0) return [];
  const dim = data[0].length;
  const rng = mulberry32(seed);
  const chosen = /* @__PURE__ */ new Set();
  const centroids = [];
  while (centroids.length < k && chosen.size < n) {
    const idx = Math.floor(rng() * n);
    if (!chosen.has(idx)) {
      chosen.add(idx);
      centroids.push([...data[idx]]);
    }
  }
  while (centroids.length < k) centroids.push([...data[0]]);
  const labels = new Array(n).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestD = Infinity;
      for (let c = 0; c < k; c++) {
        const d = dist2(data[i], centroids[c]);
        if (d < bestD) {
          bestD = d;
          best = c;
        }
      }
      if (labels[i] !== best) {
        labels[i] = best;
        changed = true;
      }
    }
    const sums = Array.from({ length: k }, () => new Array(dim).fill(0));
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      counts[labels[i]]++;
      for (let d = 0; d < dim; d++) sums[labels[i]][d] += data[i][d];
    }
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0)
        for (let d = 0; d < dim; d++) centroids[c][d] = sums[c][d] / counts[c];
    }
    if (!changed && iter > 0) break;
  }
  return labels;
}
const mean = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
let plotlyPromise = null;
function loadPlotly() {
  if (!plotlyPromise) plotlyPromise = import("plotly.js-dist-min");
  return plotlyPromise;
}
const DARK_LAYOUT = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#c8ccd4", family: "Noto Sans KR, sans-serif", size: 12 },
  margin: { l: 50, r: 20, t: 50, b: 50 }
};
function PlotlyChart({
  data,
  layout,
  config,
  className,
  style
}) {
  const ref = useRef(null);
  useEffect(() => {
    let active = true;
    loadPlotly().then((Plotly) => {
      if (!active || !ref.current) return;
      const merged = {
        ...DARK_LAYOUT,
        ...layout,
        font: { ...DARK_LAYOUT.font, ...layout?.font }
      };
      Plotly.react(ref.current, data, merged, {
        responsive: true,
        displayModeBar: false,
        ...config
      });
    });
    return () => {
      active = false;
    };
  }, [data, layout, config]);
  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el) loadPlotly().then((Plotly) => Plotly.purge(el));
    };
  }, []);
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className,
      style: { width: "100%", minHeight: 300, ...style }
    }
  );
}
const TABS = ["📊 현황 대시보드", "📈 추이 & 예측", "🔬 군집분석", "⚖️ 학교 비교", "🧪 임계치 시뮬레이터", "🗺️ 지역 랭킹"];
function num(v) {
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}
function Dashboard() {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["school-data"],
    queryFn: () => getSchoolData()
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
  const dfWithComposite = useMemo(() => {
    if (!schools.length) return [];
    const rows = schools.map((s) => SCORE_COLS.map((c) => num(s[c])));
    const scaler2 = fitScaler(rows);
    const normed = normalizeScores(scaler2, rows);
    const totalW = w1 + w2 + w3 || 1;
    return schools.map((s, i) => ({
      ...s,
      종합위험지수: (normed[i][0] * w1 + normed[i][1] * w2 + normed[i][2] * w3) / totalW
    }));
  }, [schools, w1, w2, w3]);
  const scaler = useMemo(() => schools.length ? fitScaler(schools.map((s) => SCORE_COLS.map((c) => num(s[c])))) : null, [schools]);
  const regions = useMemo(() => Array.from(new Set(schools.map((s) => s.시도).filter(Boolean))).sort(), [schools]);
  const schoolTypes = useMemo(() => Array.from(new Set(schools.map((s) => s.학교급).filter(Boolean))).sort(), [schools]);
  if (isLoading) {
    return /* @__PURE__ */ jsx(Centered, { children: "데이터를 불러오는 중..." });
  }
  if (!ok) {
    return /* @__PURE__ */ jsx(Centered, { children: /* @__PURE__ */ jsxs("div", { style: {
      textAlign: "center",
      maxWidth: 560
    }, children: [
      /* @__PURE__ */ jsx("div", { style: {
        fontSize: "2.4rem",
        marginBottom: 16
      }, children: "📂" }),
      /* @__PURE__ */ jsx("h2", { style: {
        fontFamily: "var(--font-serif)",
        fontSize: "1.4rem",
        fontWeight: 900,
        marginBottom: 12
      }, children: "데이터 파일이 필요합니다" }),
      /* @__PURE__ */ jsxs("p", { style: {
        color: "var(--text-muted)",
        lineHeight: 1.8
      }, children: [
        data?.error,
        /* @__PURE__ */ jsx("br", {}),
        "프로젝트의 ",
        /* @__PURE__ */ jsx("code", { style: {
          color: "var(--accent-red)"
        }, children: "data/" }),
        " ",
        "폴더에 아래 파일을 넣어주세요:",
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("code", { style: {
          color: "var(--accent-yellow)"
        }, children: "final_school_data.csv" }),
        ",",
        " ",
        /* @__PURE__ */ jsx("code", { style: {
          color: "var(--accent-yellow)"
        }, children: "school_wide_final.xlsx" })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/", style: {
        color: "var(--accent-blue)",
        display: "inline-block",
        marginTop: 20
      }, children: "← 홈으로" })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { style: {
    display: "flex",
    minHeight: "100vh"
  }, children: [
    /* @__PURE__ */ jsxs("aside", { style: {
      width: 300,
      flexShrink: 0,
      borderRight: "1px solid var(--border)",
      background: "var(--bg2)",
      padding: 20,
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto"
    }, children: [
      /* @__PURE__ */ jsx(Link, { to: "/", style: {
        color: "var(--text-muted)",
        fontSize: ".85rem",
        textDecoration: "none"
      }, children: "← 홈으로" }),
      /* @__PURE__ */ jsx("h3", { style: {
        fontFamily: "var(--font-serif)",
        fontWeight: 900,
        margin: "14px 0 18px"
      }, children: "🔧 필터 & 설정" }),
      /* @__PURE__ */ jsx(SideLabel, { children: "종합위험지수 가중치" }),
      /* @__PURE__ */ jsx(Slider, { label: "과밀 가중치", value: w1, min: 0, max: 1, step: 0.01, onChange: setW1 }),
      /* @__PURE__ */ jsx(Slider, { label: "소멸 가중치", value: w2, min: 0, max: 1, step: 0.01, onChange: setW2 }),
      /* @__PURE__ */ jsx(Slider, { label: "기간제 가중치", value: w3, min: 0, max: 1, step: 0.01, onChange: setW3 }),
      /* @__PURE__ */ jsxs("p", { style: {
        fontSize: ".72rem",
        color: "var(--text-dim)",
        marginBottom: 18
      }, children: [
        "가중치 합계: ",
        /* @__PURE__ */ jsx("strong", { children: (w1 + w2 + w3).toFixed(2) }),
        " (자동 정규화)"
      ] }),
      /* @__PURE__ */ jsx(SideLabel, { children: "기본 필터" }),
      /* @__PURE__ */ jsx(Select, { label: "위험 등급", value: riskLevel, onChange: setRiskLevel, options: Object.keys(LEVEL_INCLUDE) }),
      /* @__PURE__ */ jsx(Select, { label: "지역", value: region, onChange: setRegion, options: ["전체", ...regions] }),
      /* @__PURE__ */ jsx(Select, { label: "학교급", value: schoolType, onChange: setSchoolType, options: ["전체", ...schoolTypes] }),
      /* @__PURE__ */ jsxs("div", { style: {
        marginBottom: 14
      }, children: [
        /* @__PURE__ */ jsx(FieldLabel, { children: "학교 검색" }),
        /* @__PURE__ */ jsx("input", { className: "dash-input", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "학교명 입력" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("main", { style: {
      flex: 1,
      padding: "24px 28px",
      minWidth: 0
    }, children: [
      /* @__PURE__ */ jsx(DashStyle, {}),
      /* @__PURE__ */ jsx("h1", { style: {
        fontFamily: "var(--font-serif)",
        fontWeight: 900,
        fontSize: "1.6rem",
        marginBottom: 18
      }, children: "🏫 교사 번아웃 위험학교 종합 분석" }),
      /* @__PURE__ */ jsx("div", { style: {
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        marginBottom: 24
      }, children: TABS.map((t, i) => /* @__PURE__ */ jsx("button", { onClick: () => setTab(i), className: "dash-tab", "data-active": tab === i, children: t }, t)) }),
      tab === 0 && /* @__PURE__ */ jsx(Tab1, { df: dfWithComposite, scaler, riskLevel, region, schoolType, search, weights: [w1, w2, w3] }),
      tab === 1 && /* @__PURE__ */ jsx(Tab2, { schoolTypes, regions }),
      tab === 2 && /* @__PURE__ */ jsx(Tab3, { df: filterBy(dfWithComposite, "과밀등급", riskLevel, region, schoolType, search), schoolTypes }),
      tab === 3 && /* @__PURE__ */ jsx(Tab4, { df: filterBy(dfWithComposite, "과밀등급", riskLevel, region, schoolType, search) }),
      tab === 4 && /* @__PURE__ */ jsx(Tab5, { df: filterBy(dfWithComposite, "과밀등급", riskLevel, region, schoolType, search), allDf: dfWithComposite, weights: [w1, w2, w3] }),
      tab === 5 && /* @__PURE__ */ jsx(Tab6, { df: filterBy(dfWithComposite, "과밀등급", riskLevel, region, schoolType, search) })
    ] })
  ] });
}
function filterBy(df, riskType, riskLevel, region, schoolType, search) {
  const include = LEVEL_INCLUDE[riskLevel];
  let out = df.filter((s) => include.includes(String(s[riskType])));
  out = out.map((s) => ({
    ...s,
    위험등급명: GRADE_LABEL[String(s[riskType])]
  }));
  if (region !== "전체") out = out.filter((s) => s.시도 === region);
  if (schoolType !== "전체") out = out.filter((s) => s.학교급 === schoolType);
  if (search) out = out.filter((s) => String(s.학교명).includes(search));
  return out.sort((a, b) => (b.종합위험지수 ?? 0) - (a.종합위험지수 ?? 0));
}
function Tab1({
  df,
  scaler,
  riskLevel,
  region,
  schoolType,
  search,
  weights
}) {
  const [riskType, setRiskType] = useState("과밀등급");
  const scoreColumn = riskType.replace("등급", "score");
  const fdf = useMemo(() => filterBy(df, riskType, riskLevel, region, schoolType, search), [df, riskType, riskLevel, region, schoolType, search]);
  const [selected, setSelected] = useState("");
  const schoolList = useMemo(() => Array.from(new Set(fdf.map((s) => s.학교명))).sort(), [fdf]);
  const sel = fdf.find((s) => s.학교명 === selected) ?? (schoolList[0] ? fdf.find((s) => s.학교명 === schoolList[0]) : void 0);
  const [w1, w2, w3] = weights;
  const totalW = w1 + w2 + w3 || 1;
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
        return (v - mn) / rng * 17 + 5;
      })
    };
  }, [fdf]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      gap: 8,
      marginBottom: 18
    }, children: RISK_TYPES.map((r) => /* @__PURE__ */ jsx("button", { className: "dash-tab", "data-active": riskType === r, onClick: () => setRiskType(r), children: r }, r)) }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 20
    }, children: [
      /* @__PURE__ */ jsx(Metric, { label: "위험학교 수", value: `${fdf.length}` }),
      /* @__PURE__ */ jsx(Metric, { label: "평균 종합위험지수", value: `${mean(fdf.map((s) => s.종합위험지수 ?? 0)).toFixed(1)}점` })
    ] }),
    /* @__PURE__ */ jsx(Card, { title: "전국 위험학교 지도", children: /* @__PURE__ */ jsx(PlotlyChart, { data: [{
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
        colorbar: {
          title: "종합위험지수"
        },
        opacity: 0.88
      }
    }], layout: {
      mapbox: {
        style: "open-street-map",
        center: {
          lat: 36.5,
          lon: 127.8
        },
        zoom: 6
      },
      margin: {
        l: 0,
        r: 0,
        t: 0,
        b: 0
      },
      height: 560
    }, style: {
      height: 560
    } }) }),
    /* @__PURE__ */ jsx(Card, { title: "학교급별 위험등급 분포", children: /* @__PURE__ */ jsx(StackedGrade, { fdf }) }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }, children: [
      /* @__PURE__ */ jsx(Card, { title: "위험학교 TOP10", children: /* @__PURE__ */ jsx(Table, { headers: ["#", "학교명", "시도", "학교급", "위험등급", "종합위험지수"], rows: fdf.slice(0, 10).map((s, i) => [String(i + 1), String(s.학교명), String(s.시도), String(s.학교급), String(s.위험등급명 ?? ""), (s.종합위험지수 ?? 0).toFixed(1)]) }) }),
      /* @__PURE__ */ jsx(Card, { title: "시도별 위험학교 수", children: /* @__PURE__ */ jsx(RegionCount, { fdf }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { title: "🎓 학교 상세 분석", children: [
      /* @__PURE__ */ jsx(Select, { label: "학교 선택", value: sel?.학교명 ?? "", onChange: setSelected, options: schoolList }),
      sel && /* @__PURE__ */ jsx(SchoolDetail, { sel, df, scaler, riskType, weights, totalW, scoreColumn })
    ] }),
    /* @__PURE__ */ jsx(DownloadCsv, { fdf })
  ] });
}
function SchoolDetail({
  sel,
  df,
  scaler,
  riskType,
  weights,
  totalW
}) {
  const comp = sel.종합위험지수 ?? 0;
  const radar = normalizeScores(scaler, [[num(sel.과밀score), num(sel.소멸score), num(sel.기간제score)]])[0];
  const avg = normalizeScores(scaler, [[mean(df.map((s) => num(s.과밀score))), mean(df.map((s) => num(s.소멸score))), mean(df.map((s) => num(s.기간제score)))]])[0];
  const [w1, w2, w3] = weights;
  return /* @__PURE__ */ jsxs("div", { style: {
    marginTop: 16
  }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      marginBottom: 16
    }, children: [
      /* @__PURE__ */ jsx("span", { style: {
        padding: "4px 14px",
        borderRadius: 20,
        fontWeight: 700,
        fontSize: ".82rem",
        background: GRADE_COLOR[GRADE_LABEL[String(sel[riskType])]] ?? "#555",
        color: "#fff"
      }, children: GRADE_LABEL[String(sel[riskType])] ?? String(sel[riskType]) }),
      /* @__PURE__ */ jsxs("span", { style: {
        color: "var(--text-muted)"
      }, children: [
        sel.시도,
        " · ",
        sel.학교급,
        " · ",
        sel.지역규모 ?? "-"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16
    }, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(SideLabel, { children: "종합 위험지수" }),
        /* @__PURE__ */ jsx(PlotlyChart, { data: [{
          type: "indicator",
          mode: "gauge+number",
          value: comp,
          number: {
            suffix: "점"
          },
          gauge: {
            axis: {
              range: [0, 100]
            },
            bar: {
              color: "#e74c3c"
            },
            steps: [{
              range: [0, 50],
              color: "#d4efdf"
            }, {
              range: [50, 75],
              color: "#fdebd0"
            }, {
              range: [75, 100],
              color: "#fadbd8"
            }],
            threshold: {
              line: {
                color: "#c0392b",
                width: 3
              },
              thickness: 0.75,
              value: 75
            }
          }
        }], layout: {
          height: 260,
          margin: {
            t: 20,
            b: 10,
            l: 20,
            r: 20
          }
        }, style: {
          height: 260
        } }),
        /* @__PURE__ */ jsxs("p", { style: {
          fontSize: ".75rem",
          color: "var(--text-dim)",
          textAlign: "center"
        }, children: [
          "가중치 — 과밀 ",
          (w1 / totalW * 100).toFixed(0),
          "% | 소멸 ",
          (w2 / totalW * 100).toFixed(0),
          "% | 기간제 ",
          (w3 / totalW * 100).toFixed(0),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(SideLabel, { children: "위험 프로파일 (전국 평균 비교)" }),
        /* @__PURE__ */ jsx(PlotlyChart, { data: [{
          type: "scatterpolar",
          r: [...radar, radar[0]],
          theta: ["과밀 위험성", "소멸 위험성", "기간제 취약성", "과밀 위험성"],
          fill: "toself",
          name: String(sel.학교명),
          line: {
            color: "#e74c3c"
          }
        }, {
          type: "scatterpolar",
          r: [...avg, avg[0]],
          theta: ["과밀 위험성", "소멸 위험성", "기간제 취약성", "과밀 위험성"],
          fill: "toself",
          name: "전국 평균",
          line: {
            color: "#2196F3",
            dash: "dot"
          }
        }], layout: {
          polar: {
            radialaxis: {
              visible: true,
              range: [0, 100]
            }
          },
          height: 280,
          legend: {
            orientation: "h"
          },
          margin: {
            t: 20,
            b: 40
          }
        }, style: {
          height: 280
        } })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      marginTop: 16
    }, children: [
      /* @__PURE__ */ jsx(Metric, { label: "학생수", value: Math.round(num(sel.학생수)).toString(), delta: Math.round(num(sel.학생수) - mean(df.map((s) => num(s.학생수)))) }),
      /* @__PURE__ */ jsx(Metric, { label: "교원 1인당 학생수", value: num(sel.교원1인당학생수).toFixed(2), delta: +(num(sel.교원1인당학생수) - mean(df.map((s) => num(s.교원1인당학생수)))).toFixed(2) }),
      /* @__PURE__ */ jsx(Metric, { label: "기간제 비율(%)", value: (num(sel.기간제비율) * 100).toFixed(1), delta: +((num(sel.기간제비율) - mean(df.map((s) => num(s.기간제비율)))) * 100).toFixed(1) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      marginTop: 16
    }, children: [
      /* @__PURE__ */ jsx(SideLabel, { children: "⚠️ 위험 요인 진단" }),
      /* @__PURE__ */ jsx(Diag, { ok: num(sel.기간제비율) <= 0.3, okMsg: "기간제 교원 비율 정상", warnMsg: "기간제 교원 비율 높음 (30% 초과)" }),
      /* @__PURE__ */ jsx(Diag, { ok: num(sel.교원1인당학생수) <= 15, okMsg: "교원 대비 학생 수 정상", warnMsg: "과밀학급 위험 — 교원당 학생수 15명 초과" }),
      /* @__PURE__ */ jsx(Diag, { ok: num(sel.학생수) >= 60, okMsg: "학생 수 정상", warnMsg: "학생 수 감소 위험 (60명 미만)" }),
      comp >= 75 && /* @__PURE__ */ jsx(Diag, { ok: false, okMsg: "", warnMsg: "종합위험지수 75점 이상 — 최고 위험 등급!" })
    ] })
  ] });
}
const YEARS_ACTUAL = [2020, 2021, 2022, 2024];
const YEARS_PREDICT = [2025, 2026];
function Tab2({
  schoolTypes,
  regions
}) {
  const {
    data
  } = useQuery({
    queryKey: ["wide-data"],
    queryFn: () => getWideData()
  });
  const rows = data?.rows ?? [];
  const [levelFilter, setLevelFilter] = useState("전체");
  const filtered = levelFilter === "전체" ? rows : rows.filter((r) => r.학교급 === levelFilter);
  const schoolList = useMemo(() => Array.from(new Set(filtered.map((r) => String(r.학교명)))).sort(), [filtered]);
  const [sel, setSel] = useState("");
  const current = sel || schoolList[0] || "";
  const row = filtered.find((r) => String(r.학교명) === current);
  if (!data) return /* @__PURE__ */ jsx(Card, { title: "추이 & 예측", children: /* @__PURE__ */ jsx("p", { style: {
    color: "var(--text-muted)"
  }, children: "연도별 데이터를 불러오는 중..." }) });
  if (!data.ok) return /* @__PURE__ */ jsx(Card, { title: "추이 & 예측", children: /* @__PURE__ */ jsxs("p", { style: {
    color: "var(--accent-yellow)"
  }, children: [
    data.error,
    " — data/school_wide_final.xlsx 를 넣어주세요."
  ] }) });
  const sVals = row ? YEARS_ACTUAL.map((y) => num(row[`학생수_총계_계_${y}`])) : [];
  const tVals = row ? YEARS_ACTUAL.map((y) => num(row[`교원수_총계_계_${y}`])) : [];
  const sPred = predictLR(YEARS_ACTUAL, sVals, YEARS_PREDICT);
  const tPred = predictLR(YEARS_ACTUAL, tVals, YEARS_PREDICT);
  const sidoTrend = regions.map((sido) => {
    const sr = rows.filter((r) => r.시도 === sido);
    return {
      x: YEARS_ACTUAL,
      y: YEARS_ACTUAL.map((y) => mean(sr.map((r) => num(r[`학생수_총계_계_${y}`])).filter((v) => v > 0))),
      name: sido,
      type: "scatter",
      mode: "lines+markers"
    };
  });
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(Card, { title: "연도별 추이 및 미래 소멸 예측", children: [
      /* @__PURE__ */ jsx(Select, { label: "학교급 필터", value: levelFilter, onChange: setLevelFilter, options: ["전체", ...schoolTypes] }),
      /* @__PURE__ */ jsx(Select, { label: "추이 분석할 학교", value: current, onChange: setSel, options: schoolList }),
      row && /* @__PURE__ */ jsx(PlotlyChart, { data: [{
        x: YEARS_ACTUAL,
        y: sVals,
        mode: "lines+markers",
        name: "학생수 (실제)",
        line: {
          color: "#e74c3c"
        }
      }, {
        x: [2024, ...YEARS_PREDICT],
        y: [sVals[sVals.length - 1], ...sPred],
        mode: "lines+markers",
        name: "학생수 (예측)",
        line: {
          color: "#e74c3c",
          dash: "dash"
        }
      }, {
        x: YEARS_ACTUAL,
        y: tVals,
        mode: "lines+markers",
        name: "교원수 (실제)",
        line: {
          color: "#2980b9"
        }
      }, {
        x: [2024, ...YEARS_PREDICT],
        y: [tVals[tVals.length - 1], ...tPred],
        mode: "lines+markers",
        name: "교원수 (예측)",
        line: {
          color: "#2980b9",
          dash: "dash"
        }
      }], layout: {
        height: 460,
        xaxis: {
          title: "연도"
        },
        yaxis: {
          title: "인원 수"
        },
        legend: {
          orientation: "h"
        }
      }, style: {
        height: 460
      } }),
      row && /* @__PURE__ */ jsx(Table, { headers: ["연도", "학생수", "교원수", "구분"], rows: [...YEARS_ACTUAL.map((y, i) => [String(y), sVals[i].toFixed(1), tVals[i].toFixed(1), "실제"]), ...YEARS_PREDICT.map((y, i) => [String(y), sPred[i].toFixed(1), tPred[i].toFixed(1), "예측(ML)"])] })
    ] }),
    /* @__PURE__ */ jsx(Card, { title: "시도별 평균 학생수 추이 (2020~2024)", children: /* @__PURE__ */ jsx(PlotlyChart, { data: sidoTrend, layout: {
      height: 450,
      xaxis: {
        title: "연도"
      },
      yaxis: {
        title: "평균학생수"
      }
    }, style: {
      height: 450
    } }) })
  ] });
}
function Tab3({
  df,
  schoolTypes
}) {
  const [k, setK] = useState(4);
  const [filter, setFilter] = useState("전체");
  const cdf = filter === "전체" ? df : df.filter((s) => s.학교급 === filter);
  const result = useMemo(() => {
    if (!cdf.length) return [];
    const rows = cdf.map((s) => SCORE_COLS.map((c) => num(s[c])));
    const scaler = fitScaler(rows);
    const scaled = normalizeScores(scaler, rows);
    const labels = kmeans(scaled, k);
    return cdf.map((s, i) => ({
      ...s,
      군집: String(labels[i])
    }));
  }, [cdf, k]);
  const clusters = Array.from(new Set(result.map((r) => r.군집))).sort();
  const colors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(Card, { title: "K-Means 군집 분석", children: [
      /* @__PURE__ */ jsx(Slider, { label: `군집 수 (K) = ${k}`, value: k, min: 2, max: 8, step: 1, onChange: (v) => setK(Math.round(v)) }),
      /* @__PURE__ */ jsx(Select, { label: "학교급 필터", value: filter, onChange: setFilter, options: ["전체", ...schoolTypes] }),
      /* @__PURE__ */ jsx(PlotlyChart, { data: clusters.map((c, ci) => {
        const grp = result.filter((r) => r.군집 === c);
        return {
          type: "scatter",
          mode: "markers",
          name: `군집 ${c}`,
          x: grp.map((r) => num(r.과밀score)),
          y: grp.map((r) => num(r.소멸score)),
          text: grp.map((r) => String(r.학교명)),
          marker: {
            size: grp.map((r) => 6 + num(r.기간제score) * 14),
            color: colors[ci % colors.length],
            opacity: 0.65
          }
        };
      }), layout: {
        height: 560,
        xaxis: {
          title: "과밀score"
        },
        yaxis: {
          title: "소멸score"
        }
      }, style: {
        height: 560
      } })
    ] }),
    /* @__PURE__ */ jsx(Card, { title: "군집별 평균 통계", children: /* @__PURE__ */ jsx(Table, { headers: ["군집", "평균 과밀", "평균 소멸", "평균 기간제", "평균 학생수", "평균 교원당학생수"], rows: clusters.map((c) => {
      const grp = result.filter((r) => r.군집 === c);
      return [c, mean(grp.map((r) => num(r.과밀score))).toFixed(4), mean(grp.map((r) => num(r.소멸score))).toFixed(4), mean(grp.map((r) => num(r.기간제score))).toFixed(4), mean(grp.map((r) => num(r.학생수))).toFixed(1), mean(grp.map((r) => num(r.교원1인당학생수))).toFixed(2)];
    }) }) })
  ] });
}
function Tab4({
  df
}) {
  const list = Array.from(new Set(df.map((s) => s.학교명))).sort();
  const [a, setA] = useState(list[0] ?? "");
  const [b, setB] = useState(list[1] ?? list[0] ?? "");
  const ra = df.find((s) => s.학교명 === (a || list[0]));
  const rb = df.find((s) => s.학교명 === (b || list[1] || list[0]));
  if (!ra || !rb) return /* @__PURE__ */ jsx(Card, { title: "학교 비교", children: /* @__PURE__ */ jsx("p", { style: {
    color: "var(--text-muted)"
  }, children: "비교할 학교가 없습니다." }) });
  const indicators = ["과밀score", "소멸score", "기간제score", "교원1인당학생수", "기간제비율", "학생수"];
  const labels = ["과밀 점수", "소멸 점수", "기간제 점수", "교원당 학생수", "기간제 비율", "학생수"];
  const getV = (r, c) => c === "기간제비율" ? num(r[c]) * 100 : num(r[c]);
  const maxes = indicators.map((c) => c === "기간제비율" ? 100 : Math.max(...df.map((s) => num(s[c])), 1e-9));
  const va = indicators.map((c) => getV(ra, c));
  const vb = indicators.map((c) => getV(rb, c));
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      marginBottom: 16
    }, children: [
      /* @__PURE__ */ jsx(Select, { label: "학교 A", value: ra.학교명, onChange: setA, options: list }),
      /* @__PURE__ */ jsx(Select, { label: "학교 B", value: rb.학교명, onChange: setB, options: list })
    ] }),
    /* @__PURE__ */ jsx(Card, { title: `${ra.학교명}  vs  ${rb.학교명}`, children: /* @__PURE__ */ jsx(PlotlyChart, { data: [{
      type: "bar",
      orientation: "h",
      y: labels,
      x: va.map((v, i) => -(v / maxes[i]) * 100),
      name: String(ra.학교명),
      marker: {
        color: "#e74c3c"
      }
    }, {
      type: "bar",
      orientation: "h",
      y: labels,
      x: vb.map((v, i) => v / maxes[i] * 100),
      name: String(rb.학교명),
      marker: {
        color: "#2196F3"
      }
    }], layout: {
      barmode: "relative",
      height: 450,
      legend: {
        orientation: "h"
      },
      xaxis: {
        title: "← A | B →"
      }
    }, style: {
      height: 450
    } }) }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap"
    }, children: [
      /* @__PURE__ */ jsx(Metric, { label: `${ra.학교명} 종합위험지수`, value: `${(ra.종합위험지수 ?? 0).toFixed(2)}점` }),
      /* @__PURE__ */ jsx(Metric, { label: `${rb.학교명} 종합위험지수`, value: `${(rb.종합위험지수 ?? 0).toFixed(2)}점`, delta: +((rb.종합위험지수 ?? 0) - (ra.종합위험지수 ?? 0)).toFixed(2) })
    ] })
  ] });
}
function Tab5({
  df,
  allDf,
  weights
}) {
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
  if (!row) return /* @__PURE__ */ jsx(Card, { title: "임계치 시뮬레이터", children: /* @__PURE__ */ jsx("p", { style: {
    color: "var(--text-muted)"
  }, children: "학교가 없습니다." }) });
  const overcrowd = teacherRatio / maxTeacher * 100;
  const extinct = Math.max(0, 1 - students / maxStudents) * 100;
  const tempNorm = tempRatio;
  const composite = Math.min((overcrowd * w1 + extinct * w2 + tempNorm * w3) / totalW, 100);
  const orig = row.종합위험지수 ?? 0;
  return /* @__PURE__ */ jsxs(Card, { title: `🧪 ${row.학교명} 임계치 시뮬레이터`, children: [
    /* @__PURE__ */ jsx(Select, { label: "시뮬레이션 학교", value: row.학교명, onChange: (v) => {
      setSelName(v);
      const r = df.find((s) => s.학교명 === v);
      if (r) {
        setStudents(num(r.학생수));
        setTempRatio(num(r.기간제비율) * 100);
        setTeacherRatio(num(r.교원1인당학생수));
      }
    }, options: list }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 20
    }, children: [
      /* @__PURE__ */ jsx(Slider, { label: `학생수: ${Math.round(students)}`, value: students, min: 1, max: 3e3, step: 1, onChange: setStudents }),
      /* @__PURE__ */ jsx(Slider, { label: `교원 1인당 학생수: ${teacherRatio.toFixed(1)}`, value: teacherRatio, min: 1, max: 40, step: 0.1, onChange: setTeacherRatio }),
      /* @__PURE__ */ jsx(Slider, { label: `기간제 비율(%): ${tempRatio.toFixed(1)}`, value: tempRatio, min: 0, max: 100, step: 0.1, onChange: setTempRatio }),
      /* @__PURE__ */ jsx(Slider, { label: `위험 임계치: ${threshold}`, value: threshold, min: 0, max: 100, step: 1, onChange: (v) => setThreshold(Math.round(v)) })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      margin: "16px 0"
    }, children: [
      /* @__PURE__ */ jsx(Metric, { label: "가상 과밀", value: overcrowd.toFixed(1) }),
      /* @__PURE__ */ jsx(Metric, { label: "가상 소멸", value: extinct.toFixed(1) }),
      /* @__PURE__ */ jsx(Metric, { label: "가상 기간제", value: tempNorm.toFixed(1) }),
      /* @__PURE__ */ jsx(Metric, { label: "가상 종합위험지수", value: `${composite.toFixed(2)}점` })
    ] }),
    /* @__PURE__ */ jsx("p", { style: {
      color: composite >= threshold ? "var(--accent-red)" : composite >= threshold * 0.75 ? "var(--accent-yellow)" : "#2ecc71",
      fontWeight: 700
    }, children: composite >= threshold ? "🔴 최고위험 (임계치 초과!)" : composite >= threshold * 0.75 ? "🟡 경고 (임계치 근접)" : "🟢 안전" }),
    /* @__PURE__ */ jsxs("p", { style: {
      color: "var(--text-muted)"
    }, children: [
      "원래 ",
      orig.toFixed(2),
      "점 → 시뮬레이션 ",
      composite.toFixed(2),
      "점 (",
      (composite - orig >= 0 ? "+" : "") + (composite - orig).toFixed(2),
      "점)"
    ] }),
    /* @__PURE__ */ jsx(PlotlyChart, { data: [{
      type: "indicator",
      mode: "gauge+number",
      value: composite,
      gauge: {
        axis: {
          range: [0, 100]
        },
        bar: {
          color: "#e74c3c"
        },
        steps: [{
          range: [0, threshold * 0.75],
          color: "#d4efdf"
        }, {
          range: [threshold * 0.75, threshold],
          color: "#fdebd0"
        }, {
          range: [threshold, 100],
          color: "#fadbd8"
        }],
        threshold: {
          line: {
            color: "black",
            width: 4
          },
          thickness: 0.75,
          value: threshold
        }
      }
    }], layout: {
      height: 340
    }, style: {
      height: 340
    } })
  ] });
}
function Tab6({
  df
}) {
  const regionAvg = useMemo(() => {
    const m = {};
    df.forEach((s) => {
      (m[s.시도] ??= []).push(s.종합위험지수 ?? 0);
    });
    return Object.entries(m).map(([sido, vals]) => ({
      sido,
      avg: mean(vals),
      count: vals.length
    })).sort((a, b) => a.avg - b.avg);
  }, [df]);
  const districtAvg = useMemo(() => {
    const m = {};
    df.forEach((s) => {
      const gu = String(s.행정구 ?? "");
      if (!gu) return;
      const key = `${s.시도}|${gu}`;
      (m[key] ??= {
        vals: [],
        sido: s.시도,
        gu
      }).vals.push(s.종합위험지수 ?? 0);
    });
    return Object.values(m).map((v) => ({
      ...v,
      avg: mean(v.vals)
    })).sort((a, b) => b.avg - a.avg).slice(0, 20);
  }, [df]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Card, { title: "시도별 평균 종합위험지수 랭킹", children: /* @__PURE__ */ jsx(PlotlyChart, { data: [{
      type: "bar",
      orientation: "h",
      y: regionAvg.map((r) => r.sido),
      x: regionAvg.map((r) => r.avg),
      marker: {
        color: regionAvg.map((r) => r.avg),
        colorscale: "RdYlGn",
        reversescale: true,
        showscale: true
      }
    }], layout: {
      height: 520,
      xaxis: {
        title: "평균 종합위험지수"
      }
    }, style: {
      height: 520
    } }) }),
    /* @__PURE__ */ jsx(Card, { title: "시도별 상세 위험 통계", children: /* @__PURE__ */ jsx(Table, { headers: ["#", "시도", "위험학교수", "평균 종합위험지수"], rows: [...regionAvg].sort((a, b) => b.avg - a.avg).map((r, i) => [String(i + 1), r.sido, String(r.count), r.avg.toFixed(2)]) }) }),
    districtAvg.length > 0 && /* @__PURE__ */ jsx(Card, { title: "행정구(시군구)별 평균 종합위험지수 TOP 20", children: /* @__PURE__ */ jsx(PlotlyChart, { data: [{
      type: "bar",
      orientation: "h",
      y: districtAvg.map((d) => `${d.sido} ${d.gu}`),
      x: districtAvg.map((d) => d.avg),
      marker: {
        color: "#e8533a"
      }
    }], layout: {
      height: 600,
      xaxis: {
        title: "평균 종합위험지수"
      },
      margin: {
        l: 160
      }
    }, style: {
      height: 600
    } }) })
  ] });
}
function StackedGrade({
  fdf
}) {
  const types = Array.from(new Set(fdf.map((s) => s.학교급)));
  const grades = Object.keys(GRADE_ORDER).sort((a, b) => GRADE_ORDER[a] - GRADE_ORDER[b]);
  return /* @__PURE__ */ jsx(PlotlyChart, { data: grades.map((g) => ({
    type: "bar",
    name: g,
    x: types,
    y: types.map((t) => fdf.filter((s) => s.학교급 === t && s.위험등급명 === g).length),
    marker: {
      color: GRADE_COLOR[g]
    }
  })), layout: {
    barmode: "stack",
    height: 380,
    xaxis: {
      title: "학교급"
    },
    yaxis: {
      title: "학교 수"
    }
  }, style: {
    height: 380
  } });
}
function RegionCount({
  fdf
}) {
  const m = {};
  fdf.forEach((s) => {
    m[s.시도] = (m[s.시도] ?? 0) + 1;
  });
  const entries = Object.entries(m).sort((a, b) => b[1] - a[1]);
  return /* @__PURE__ */ jsx(PlotlyChart, { data: [{
    type: "bar",
    x: entries.map((e) => e[0]),
    y: entries.map((e) => e[1]),
    marker: {
      color: "#4a9eff"
    }
  }], layout: {
    height: 380,
    xaxis: {
      title: "시도"
    },
    yaxis: {
      title: "학교 수"
    }
  }, style: {
    height: 380
  } });
}
function DownloadCsv({
  fdf
}) {
  const download = () => {
    if (!fdf.length) return;
    const keys = Object.keys(fdf[0]).filter((k) => k !== "_map_size");
    const lines = [keys.join(",")];
    fdf.forEach((s) => lines.push(keys.map((k) => JSON.stringify(s[k] ?? "")).join(",")));
    const blob = new Blob(["\uFEFF" + lines.join("\n")], {
      type: "text/csv;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "위험학교목록.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsx("button", { className: "dash-tab", "data-active": false, style: {
    marginTop: 16
  }, onClick: download, children: "📥 위험학교 데이터 전체 다운로드 (CSV)" });
}
function Centered({
  children
}) {
  return /* @__PURE__ */ jsx("div", { style: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  }, children });
}
function Card({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16
  }, children: [
    /* @__PURE__ */ jsx("h3", { style: {
      fontWeight: 700,
      marginBottom: 14,
      fontSize: "1rem"
    }, children: title }),
    children
  ] });
}
function Metric({
  label,
  value,
  delta
}) {
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "14px 18px",
    minWidth: 150
  }, children: [
    /* @__PURE__ */ jsx("div", { style: {
      fontSize: ".75rem",
      color: "var(--text-dim)"
    }, children: label }),
    /* @__PURE__ */ jsx("div", { style: {
      fontFamily: "var(--font-mono)",
      fontSize: "1.4rem",
      fontWeight: 500
    }, children: value }),
    delta !== void 0 && /* @__PURE__ */ jsxs("div", { style: {
      fontSize: ".75rem",
      color: delta >= 0 ? "#e74c3c" : "#2ecc71"
    }, children: [
      delta >= 0 ? "▲" : "▼",
      " ",
      Math.abs(delta)
    ] })
  ] });
}
function Table({
  headers,
  rows
}) {
  return /* @__PURE__ */ jsx("div", { style: {
    overflowX: "auto"
  }, children: /* @__PURE__ */ jsxs("table", { style: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: ".82rem"
  }, children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: headers.map((h) => /* @__PURE__ */ jsx("th", { style: {
      textAlign: "left",
      padding: "8px 10px",
      borderBottom: "1px solid var(--border)",
      color: "var(--text-muted)"
    }, children: h }, h)) }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((r, i) => /* @__PURE__ */ jsx("tr", { children: r.map((c, j) => /* @__PURE__ */ jsx("td", { style: {
      padding: "8px 10px",
      borderBottom: "1px solid rgba(255,255,255,0.04)"
    }, children: c }, j)) }, i)) })
  ] }) });
}
function Diag({
  ok,
  okMsg,
  warnMsg
}) {
  return /* @__PURE__ */ jsx("div", { style: {
    padding: "6px 0",
    color: ok ? "#2ecc71" : "var(--accent-yellow)",
    fontSize: ".88rem"
  }, children: ok ? `✔ ${okMsg}` : `⚠ ${warnMsg}` });
}
function SideLabel({
  children
}) {
  return /* @__PURE__ */ jsx("div", { style: {
    fontSize: ".72rem",
    fontWeight: 700,
    letterSpacing: ".06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    margin: "14px 0 8px"
  }, children });
}
function FieldLabel({
  children
}) {
  return /* @__PURE__ */ jsx("label", { style: {
    display: "block",
    fontSize: ".75rem",
    color: "var(--text-muted)",
    marginBottom: 4
  }, children });
}
function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { style: {
    marginBottom: 12
  }, children: [
    /* @__PURE__ */ jsx(FieldLabel, { children: label }),
    /* @__PURE__ */ jsx("input", { type: "range", min, max, step, value, onChange: (e) => onChange(Number(e.target.value)), style: {
      width: "100%",
      accentColor: "#e8533a"
    } })
  ] });
}
function Select({
  label,
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxs("div", { style: {
    marginBottom: 12
  }, children: [
    /* @__PURE__ */ jsx(FieldLabel, { children: label }),
    /* @__PURE__ */ jsx("select", { className: "dash-input", value, onChange: (e) => onChange(e.target.value), children: options.map((o) => /* @__PURE__ */ jsx("option", { value: o, children: o }, o)) })
  ] });
}
function DashStyle() {
  return /* @__PURE__ */ jsx("style", { dangerouslySetInnerHTML: {
    __html: `
.dash-input{width:100%;padding:8px 12px;background:var(--bg);border:1px solid var(--border);color:var(--text-main);border-radius:8px;font-size:.85rem;outline:none}
.dash-input:focus{border-color:var(--accent-red)}
.dash-tab{padding:8px 16px;border:1px solid var(--border);background:var(--bg3);color:var(--text-muted);border-radius:8px;font-size:.85rem;cursor:pointer;transition:all .2s;font-family:var(--font-sans)}
.dash-tab:hover{color:var(--text-main)}
.dash-tab[data-active="true"]{background:var(--accent-red);color:#fff;border-color:var(--accent-red);font-weight:700}
`
  } });
}
export {
  Dashboard as component
};
