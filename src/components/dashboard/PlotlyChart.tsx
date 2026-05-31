import { useEffect, useRef } from "react";

type PlotlyModule = typeof import("plotly.js-dist-min");
let plotlyPromise: Promise<PlotlyModule> | null = null;
function loadPlotly() {
  if (!plotlyPromise) plotlyPromise = import("plotly.js-dist-min");
  return plotlyPromise;
}

interface PlotlyChartProps {
  data: Record<string, unknown>[];
  layout?: Record<string, unknown>;
  config?: Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
}

const DARK_LAYOUT = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#c8ccd4", family: "Noto Sans KR, sans-serif", size: 12 },
  margin: { l: 50, r: 20, t: 50, b: 50 },
};

export function PlotlyChart({
  data,
  layout,
  config,
  className,
  style,
}: PlotlyChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    loadPlotly().then((Plotly) => {
      if (!active || !ref.current) return;
      const merged = {
        ...DARK_LAYOUT,
        ...layout,
        font: { ...DARK_LAYOUT.font, ...(layout?.font as object) },
      };
      Plotly.react(ref.current, data as never, merged as never, {
        responsive: true,
        displayModeBar: false,
        ...config,
      } as never);
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

  return (
    <div
      ref={ref}
      className={className}
      style={{ width: "100%", minHeight: 300, ...style }}
    />
  );
}
