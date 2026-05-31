import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSchoolData } from "@/lib/school-data.functions";
import { LANDING_CSS } from "@/components/landing/landing-css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "교사 번아웃 위험학교 분석 플랫폼" },
      {
        name: "description",
        content:
          "과밀학급·학교소멸·기간제교원 비율을 종합 분석하여 교사 번아웃 고위험 학교를 조기에 식별하는 데이터 분석 플랫폼.",
      },
      { property: "og:title", content: "교사 번아웃 위험학교 분석 플랫폼" },
      {
        property: "og:description",
        content: "전국 초·중·고 데이터 기반 교사 번아웃 위험 지도 & 분석 대시보드.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { data } = useQuery({
    queryKey: ["school-data"],
    queryFn: () => getSchoolData(),
  });

  const schools = data?.schools ?? [];
  const ok = data?.ok ?? false;
  const total = schools.length;
  const sidoCount = new Set(schools.map((s) => s.시도)).size;
  const top1 = schools.filter(
    (s) =>
      s.과밀등급 === "TOP1" ||
      s.소멸등급 === "TOP1" ||
      s.기간제등급 === "TOP1",
  ).length;

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="landing">
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />

      {/* NAV */}
      <nav>
        <a className="nav-logo" href="#top">
          <span className="dot" />
          교사번아웃리스크
        </a>
        <ul className="nav-links">
          <li>
            <a href="#facts">주요 통계</a>
          </li>
          <li>
            <a href="#news">관련 뉴스</a>
          </li>
          <li>
            <a href="#features">분석 기능</a>
          </li>
        </ul>
        <div className="nav-cta">
          <button className="btn-sub" onClick={() => setModalOpen(true)}>
            📬 위험 알림 구독
          </button>
          <Link className="btn-go" to="/dashboard">
            대시보드 열기 →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-left">
          <span className="badge">실시간 분석 플랫폼</span>
          <h1 className="hero-title">
            전국 {total > 0 ? total.toLocaleString() : "10,000+"}개교
            <br />
            교사 번아웃
            <br />
            <em>위험 지도</em>
          </h1>
          <p className="hero-desc">
            과밀학급·학교소멸·기간제교원 비율을 종합 분석하여 교사 번아웃 고위험
            학교를 조기에 식별하고 체계적인 지원 근거를 제공합니다.
          </p>

          <div className={`status-banner ${ok ? "status-ok show" : "show"}`}>
            {ok
              ? `✅ 데이터 연결됨 — 전국 ${total.toLocaleString()}개 학교 분석 준비 완료`
              : `⚠️ ${data?.error ?? "데이터를 확인하는 중..."} (data/ 폴더에 파일을 넣어주세요)`}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">76%</span>
              <span className="stat-label">번아웃 경험 교사</span>
            </div>
            <div className="stat-item">
              <span className="stat-num yellow">30%</span>
              <span className="stat-label">심각한 소진 호소</span>
            </div>
            <div className="stat-item">
              <span className="stat-num blue">68%</span>
              <span className="stat-label">언어폭력 피해 경험</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link className="btn-primary" to="/dashboard">
              📊 대시보드 바로가기
            </Link>
            <a className="btn-secondary" href="#facts">
              관련 현황 보기
            </a>
          </div>
        </div>

        <div className="hero-right">
          <HeroViz schools={schools} total={total} top1={top1} ok={ok} />
        </div>
      </section>

      {/* FACTS */}
      <section className="facts-sec" id="facts">
        <div className="facts-header">
          <div>
            <div className="sec-label">핵심 통계</div>
            <h2 className="sec-title">
              지금 학교에서
              <br />
              무슨 일이 벌어지고 있나
            </h2>
          </div>
          <p className="sec-sub">
            2024년 전교조·녹색병원 공동 조사,
            <br />
            교사 1,964명 응답 분석 결과입니다.
          </p>
        </div>

        <div className="facts-grid">
          <FactCard
            num="76"
            sup="%"
            title="번아웃 경험 교사"
            desc="조사 대상 교사 1,964명 중 76.1%가 업무로 인한 소진 상태를 경험한 것으로 나타났습니다."
          />
          <FactCard
            num="43"
            sup="%"
            title="심한 우울증상 교사"
            desc="CESD 기준 심한 우울증상(definite)이 확인된 교사 비율. 경도 우울 포함 시 67.3%."
          />
          <FactCard
            num="68"
            sup="%"
            title="언어폭력 피해 교사"
            desc="지난 1년간 언어폭력을 경험했다고 응답한 교사 비율. 일반 노동자 대비 10배 이상."
          />
          <FactCard
            num="39"
            sup="%"
            title="학부모 민원 스트레스"
            desc="직무 스트레스 중 학부모 상담·민원 대응이 가장 높은 순위(38.8%)를 차지."
          />
        </div>

        <div className="live-stats">
          <div className="live-card">
            <div className="live-num">{ok ? total.toLocaleString() : "—"}</div>
            <div className="live-label">분석 대상 전체 학교</div>
          </div>
          <div className="live-card">
            <div className="live-num">{ok ? total.toLocaleString() : "—"}</div>
            <div className="live-label">TOP5 위험등급 학교</div>
          </div>
          <div className="live-card">
            <div className="live-num">{ok ? sidoCount : "—"}</div>
            <div className="live-label">분석 시도 수</div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="news-sec" id="news">
        <div className="sec-label">관련 뉴스 &amp; 연구</div>
        <h2 className="sec-title">
          교사 번아웃,
          <br />
          지금 이렇게 보도되고 있습니다
        </h2>

        <div className="news-grid">
          <a
            className="news-main"
            href="https://www.edpl.co.kr"
            target="_blank"
            rel="noreferrer"
          >
            <div className="news-img">
              <span className="news-tag">📰 교육플러스 | 2024.09.04</span>
              <div className="news-bars">
                {[40, 65, 50, 80, 72].map((h, i) => (
                  <div
                    key={i}
                    className="bar"
                    style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              <span className="big76">76</span>
            </div>
            <div className="news-body">
              <div className="news-src">교육플러스 | 이재익 기자 | 2024.09.04</div>
              <h3 className="news-ttl">
                "교사 76% 번아웃 경험"…전교조, 교사 마음 건강 실태조사 결과 발표
              </h3>
              <p>
                전교조와 녹색병원이 교사 1,964명을 대상으로 실시한 조사에서
                76.1%가 번아웃을 경험했으며, 30.4%는 업무 수행이 어려울 정도의
                심각한 소진 상태인 것으로 나타났습니다.
              </p>
              <span className="news-link">
                기사 원문 보기 <span className="arrow">→</span>
              </span>
            </div>
          </a>

          <div className="news-side">
            <a className="news-sm" href="#news">
              <div className="news-date">2024.09.04 · 교육플러스</div>
              <div className="news-sm-ttl">
                20대 교사 번아웃 가장 심각…연령 높아질수록 감소 경향
              </div>
              <div className="news-sm-desc">
                유치원·초등 교사에서 소진 경험이 더 많았고, 학부모 상담 횟수가
                증가할수록 소진도 비례 증가했습니다.
              </div>
            </a>
            <a className="news-sm" href="#news">
              <div className="news-date">2024.09.04 · 교육플러스</div>
              <div className="news-sm-ttl">
                신체폭력 경험 교사의 45.8%, 외상후 스트레스 고위험군
              </div>
              <div className="news-sm-desc">
                언어폭력 경험 교사의 37.6%가 PTSD 고위험군. 2023년 대비 개선되지
                않은 것으로 나타났습니다.
              </div>
            </a>
            <a className="news-sm" href="#news">
              <div className="news-date">2024.09.04 · 교육플러스</div>
              <div className="news-sm-ttl">
                전교조 "교사 정신건강, 이미 재난 상황…국가적 대책 필요"
              </div>
              <div className="news-sm-desc">
                사회구조적 위협요인이므로 교원지위법 개정, 민원 처리 시스템 안착
                등 제도적 개선을 촉구했습니다.
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feat-sec" id="features">
        <div className="sec-label">분석 기능</div>
        <h2 className="sec-title">
          대시보드에서
          <br />
          할 수 있는 것들
        </h2>
        <p className="sec-sub">
          6개의 분석 탭을 통해 전국 위험 학교를 다각도로 파악하세요.
        </p>

        <div className="feat-grid">
          <FeatCard
            icon="📊"
            title="현황 대시보드"
            desc="전국 위험학교 지도, 학교급별 위험 프로파일, TOP10 랭킹. 가중치 조절로 나만의 종합위험지수를 산출하세요."
            badge="탭 1"
          />
          <FeatCard
            icon="📈"
            title="추이 & 예측"
            desc="2020~2024 실제 데이터로 2025~2026년 학생수·교원수를 LinearRegression으로 예측합니다."
            badge="탭 2"
          />
          <FeatCard
            icon="🔬"
            title="군집 분석"
            desc="K-Means로 유사한 위험 패턴의 학교를 자동 군집화해 맞춤형 대응 방안을 도출하세요."
            badge="탭 3"
          />
          <FeatCard
            icon="⚖️"
            title="학교 비교"
            desc="Butterfly Chart로 두 학교를 6개 지표에서 직접 비교합니다."
            badge="탭 4"
          />
          <FeatCard
            icon="🧪"
            title="임계치 시뮬레이터"
            desc="학생수·기간제 비율을 조정해 종합위험지수 변화를 즉시 시뮬레이션합니다."
            badge="탭 5"
          />
          <FeatCard
            icon="🗺️"
            title="지역 랭킹"
            desc="17개 시도 및 행정구별 평균 종합위험지수 랭킹으로 우선 지원 지역을 파악하세요."
            badge="탭 6"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="cta-sec">
        <div className="sec-label" style={{ justifyContent: "center" }}>
          지금 바로 시작하세요
        </div>
        <h2 className="sec-title">
          데이터로 교사를
          <br />
          지키는 첫걸음
        </h2>
        <p className="sec-sub" style={{ margin: "0 auto" }}>
          전국 초·중·고 데이터 기반 번아웃 위험 지표를 분석 대시보드에서 직접
          탐색해보세요.
        </p>
        <div className="cta-btns">
          <Link className="btn-primary btn-lg" to="/dashboard">
            📊 분석 대시보드 열기
          </Link>
          <button className="btn-secondary btn-lg" onClick={() => setModalOpen(true)}>
            📬 위험 알림 구독하기
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="f-left">
          <strong>교사 번아웃 위험학교 분석 플랫폼</strong>
          <br />
          데이터 출처: 교육부 교육통계서비스 · 전교조 마음 건강 실태조사 2024
        </div>
        <ul className="f-links">
          <li>
            <a href="#facts">통계</a>
          </li>
          <li>
            <a href="#news">뉴스</a>
          </li>
          <li>
            <a href="#features">기능</a>
          </li>
        </ul>
      </footer>

      {modalOpen && (
        <SubscribeModal schools={schools} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}

function FactCard({
  num,
  sup,
  title,
  desc,
}: {
  num: string;
  sup: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="fact-card">
      <div className="fact-num">
        {num}
        <sup>{sup}</sup>
      </div>
      <div className="fact-title">{title}</div>
      <div className="fact-desc">{desc}</div>
    </div>
  );
}

function FeatCard({
  icon,
  title,
  desc,
  badge,
}: {
  icon: string;
  title: string;
  desc: string;
  badge: string;
}) {
  return (
    <div className="feat-card">
      <div className="feat-icon">{icon}</div>
      <div className="feat-ttl">{title}</div>
      <div className="feat-desc">{desc}</div>
      <span className="feat-badge">{badge}</span>
    </div>
  );
}

function HeroViz({
  schools,
  total,
  top1,
  ok,
}: {
  schools: import("@/lib/types").SchoolRecord[];
  total: number;
  top1: number;
  ok: boolean;
}) {
  // 실제 데이터에서 TOP1 학교 추출 (종합위험지수 상위)
  const topSchools = useMemo(() => {
    if (!ok || !schools.length) return [];
    return [...schools]
      .filter((s) => s.과밀등급 === "TOP1" || s.소멸등급 === "TOP1" || s.기간제등급 === "TOP1")
      .sort((a, b) => {
        const sa = (Number(a.과밀score) || 0) + (Number(a.소멸score) || 0) + (Number(a.기간제score) || 0);
        const sb = (Number(b.과밀score) || 0) + (Number(b.소멸score) || 0) + (Number(b.기간제score) || 0);
        return sb - sa;
      })
      .slice(0, 8);
  }, [schools, ok]);

  // 학교급별 현황
  const byLevel = useMemo(() => {
    if (!ok || !schools.length) return [];
    const m: Record<string, number> = {};
    schools.forEach((s) => {
      if (s.과밀등급 === "TOP1" || s.소멸등급 === "TOP1" || s.기간제등급 === "TOP1") {
        m[s.학교급] = (m[s.학교급] ?? 0) + 1;
      }
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [schools, ok]);

  // 시도별 심각 학교 수 TOP5
  const sidoTop = useMemo(() => {
    if (!ok || !schools.length) return [];
    const m: Record<string, number> = {};
    schools.forEach((s) => {
      if (s.과밀등급 === "TOP1" || s.소멸등급 === "TOP1" || s.기간제등급 === "TOP1") {
        m[s.시도] = (m[s.시도] ?? 0) + 1;
      }
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [schools, ok]);

  const maxSido = sidoTop[0]?.[1] ?? 1;

  // ticker용 실제 학교 텍스트 (중복 포함해서 루프)
  const tickerItems = useMemo(() => {
    if (!topSchools.length) return [];
    const items = topSchools.map((s) => {
      const riskTag =
        s.소멸등급 === "TOP1" ? "소멸위험 TOP1" :
        s.과밀등급 === "TOP1" ? `교원당 ${Number(s.교원1인당학생수).toFixed(1)}명` :
        `기간제 ${(Number(s.기간제비율) * 100).toFixed(0)}%`;
      return `${s.시도} ${s.학교명} — ${riskTag}`;
    });
    // 루프 위해 2번 반복
    return [...items, ...items];
  }, [topSchools]);

  if (!ok) {
    return (
      <div className="viz-box">
        <div className="viz-label">위험 현황 분석</div>
        <div className="viz-empty">
          <div className="viz-empty-icon">📂</div>
          <div className="viz-empty-msg">
            data/ 폴더에 CSV 파일을<br />넣으면 실제 현황이 표시됩니다
          </div>
        </div>
        <div className="viz-metrics">
          <div className="vm">
            <div className="vm-label">심각 등급 (TOP 1%)</div>
            <div className="vm-val red">—</div>
          </div>
          <div className="vm">
            <div className="vm-label">분석 대상 학교</div>
            <div className="vm-val blue">—</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="viz-box">
      <div className="viz-label">위험 현황 분석</div>

      {/* 학교급별 심각 등급 바 차트 */}
      <div className="viz-bars-section">
        {byLevel.map(([level, count]) => (
          <div key={level} className="viz-bar-row">
            <span className="viz-bar-label">{level}</span>
            <div className="viz-bar-track">
              <div
                className="viz-bar-fill"
                style={{ width: `${(count / (byLevel[0]?.[1] ?? 1)) * 100}%` }}
              />
            </div>
            <span className="viz-bar-count">{count.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* 시도별 TOP5 */}
      <div className="viz-sido-section">
        <div className="viz-sido-title">시도별 심각 위험학교</div>
        {sidoTop.map(([sido, count]) => (
          <div key={sido} className="viz-sido-row">
            <span className="viz-sido-name">{sido}</span>
            <div className="viz-sido-track">
              <div
                className="viz-sido-fill"
                style={{ width: `${(count / maxSido) * 100}%` }}
              />
            </div>
            <span className="viz-sido-count">{count}</span>
          </div>
        ))}
      </div>

      <div className="viz-metrics">
        <div className="vm">
          <div className="vm-label">심각 등급 (TOP 1%)</div>
          <div className="vm-val red">{top1.toLocaleString()}</div>
        </div>
        <div className="vm">
          <div className="vm-label">분석 대상 학교</div>
          <div className="vm-val blue">{total.toLocaleString()}</div>
        </div>
      </div>

      {tickerItems.length > 0 && (
        <div className="ticker-wrap">
          <div className="ticker">
            {tickerItems.map((t, i) => (
              <span className="ticker-item" key={i}>
                <span className="dot">●</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubscribeModal({
  schools,
  onClose,
}: {
  schools: { 시도: string }[];
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [region, setRegion] = useState("전체");
  const [level, setLevel] = useState("전체");
  const [thresh, setThresh] = useState(70);
  const [done, setDone] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const regions = Array.from(
    new Set(schools.map((s) => s.시도).filter(Boolean)),
  ).sort();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (!email || !email.includes("@")) {
      if (emailRef.current) emailRef.current.style.borderColor = "var(--accent)";
      emailRef.current?.focus();
      return;
    }
    setDone(true);
  };

  return (
    <div className="overlay on" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        {!done ? (
          <div>
            <div className="modal-title">위험 알림 구독</div>
            <div className="modal-desc">
              관심 지역 번아웃 위험학교 변동 정보를 이메일로 받아보세요.
            </div>
            <div className="fg">
              <label className="fl">이메일 주소</label>
              <input
                ref={emailRef}
                className="fi"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="fr">
              <div className="fg">
                <label className="fl">관심 지역</label>
                <select
                  className="fs"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  <option>전체</option>
                  {regions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="fg">
                <label className="fl">위험 등급</label>
                <select
                  className="fs"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option>전체</option>
                  <option>심각 (상위 1%)</option>
                  <option>경고 (상위 3%)</option>
                  <option>주의 (상위 5%)</option>
                </select>
              </div>
            </div>
            <div className="rg">
              <div className="rl">
                <span>위험지수 임계치</span>
                <span className="rv">{thresh}점</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={thresh}
                style={{ ["--pct" as string]: `${thresh}%` }}
                onChange={(e) => setThresh(Number(e.target.value))}
              />
              <div
                className="rl"
                style={{ color: "var(--text-dim)", fontSize: ".7rem" }}
              >
                <span>0점 (모든 학교)</span>
                <span>100점 (최고 위험만)</span>
              </div>
            </div>
            <div className="notify-row">
              <div className="notify-icon">🔔</div>
              <div className="notify-txt">
                <strong>임계치 초과 즉시 알림</strong> + 주간 요약 리포트를
                이메일로 받게 됩니다.
              </div>
            </div>
            <button className="btn-submit" onClick={submit}>
              📬 구독 신청하기
            </button>
          </div>
        ) : (
          <div className="success-box on">
            <div className="s-icon">✅</div>
            <div className="s-title">구독 완료!</div>
            <div className="s-desc">
              {email}으로 알림을 발송합니다.
              <br />📍 {region} · {level} | ⚠️ 임계치 {thresh}점 이상
            </div>
            <button
              className="btn-submit"
              style={{ marginTop: 24 }}
              onClick={onClose}
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
