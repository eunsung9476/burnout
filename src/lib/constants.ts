// 위험 등급 / 색상 / 점수 컬럼 상수 (Streamlit app.py 이식)

export const GRADE_LABEL: Record<string, string> = {
  TOP1: "심각 (상위 1%)",
  TOP3: "경고 (상위 3%)",
  TOP5: "주의 (상위 5%)",
};

export const GRADE_COLOR: Record<string, string> = {
  "심각 (상위 1%)": "#d32f2f",
  "경고 (상위 3%)": "#f57c00",
  "주의 (상위 5%)": "#1976d2",
};

export const LEVEL_INCLUDE: Record<string, string[]> = {
  "심각 (상위 1%)": ["TOP1"],
  "경고 (상위 3%)": ["TOP1", "TOP3"],
  "주의 (상위 5%)": ["TOP1", "TOP3", "TOP5"],
};

export const SCORE_COLS = ["과밀score", "소멸score", "기간제score"] as const;

export const RISK_TYPES = ["과밀등급", "소멸등급", "기간제등급"] as const;

export const GRADE_ORDER: Record<string, number> = {
  "심각 (상위 1%)": 3,
  "경고 (상위 3%)": 2,
  "주의 (상위 5%)": 1,
};
