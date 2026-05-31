// 랜딩 페이지 전용 CSS — 사용자가 제공한 디자인을 .landing 스코프로 이식
export const LANDING_CSS = `
.landing{
  --bg:#0a0c10; --bg2:#0f1218; --bg3:#151a22;
  --accent:#e8533a; --accent2:#f5a623; --accent3:#4a9eff;
  --text:#e8e6e0; --text-muted:#7a8290; --text-dim:#4a5060;
  --border:rgba(255,255,255,0.07); --card:rgba(255,255,255,0.03);
  --serif:'Nanum Myeongjo',serif; --sans:'Pretendard','Apple SD Gothic Neo',sans-serif; --mono:'JetBrains Mono',monospace;
  background:var(--bg);color:var(--text);font-family:var(--sans);line-height:1.6;position:relative;-webkit-font-smoothing:antialiased;letter-spacing:-0.01em;
}
.landing *{box-sizing:border-box}
.landing::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");pointer-events:none;z-index:1000;opacity:.35}

.landing nav{position:fixed;top:0;left:0;right:0;z-index:900;display:flex;align-items:center;justify-content:space-between;padding:0 48px;height:64px;background:rgba(10,12,16,.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.landing .nav-logo{display:flex;align-items:center;gap:10px;font-family:var(--sans);font-size:1rem;font-weight:700;color:var(--text);text-decoration:none;letter-spacing:-.01em}
.landing .nav-logo .dot{width:8px;height:8px;background:var(--accent);border-radius:50%;animation:pulse-dot 2s ease-in-out infinite}
.landing .nav-links{display:flex;gap:32px;list-style:none;margin:0;padding:0}
.landing .nav-links a{color:var(--text-muted);text-decoration:none;font-size:.875rem;font-weight:500;letter-spacing:-.01em;transition:color .2s}
.landing .nav-links a:hover{color:var(--text)}
.landing .nav-cta{display:flex;gap:12px;align-items:center}
.landing .btn-sub{padding:8px 20px;border:1px solid var(--border);background:var(--card);color:var(--text-muted);font-size:.8rem;font-family:var(--sans);border-radius:6px;cursor:pointer;transition:all .2s}
.landing .btn-sub:hover{border-color:var(--accent);color:var(--accent)}
.landing .btn-go{padding:8px 22px;background:var(--accent);color:#fff;border:none;border-radius:6px;font-size:.8rem;font-family:var(--sans);font-weight:700;cursor:pointer;text-decoration:none;transition:all .2s;display:inline-flex;align-items:center;gap:6px}
.landing .btn-go:hover{background:#d4452c;transform:translateY(-1px)}

.landing .hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;padding-top:64px;position:relative;overflow:hidden}
.landing .hero::after{content:'';position:absolute;top:-200px;right:-200px;width:700px;height:700px;background:radial-gradient(circle,rgba(232,83,58,.1) 0%,transparent 70%);pointer-events:none}
.landing .hero-left{display:flex;flex-direction:column;justify-content:center;padding:80px 64px 80px 80px;position:relative;z-index:2}
.landing .badge{display:inline-flex;align-items:center;gap:8px;background:rgba(232,83,58,.1);border:1px solid rgba(232,83,58,.25);color:var(--accent);padding:6px 14px;border-radius:20px;font-size:.78rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:32px;width:fit-content;animation:fade-in-up .8s ease both}
.landing .badge::before{content:'';width:6px;height:6px;background:var(--accent);border-radius:50%;animation:pulse-dot 1.5s ease-in-out infinite}
.landing .hero-title{font-family:var(--serif);font-size:clamp(2.4rem,4vw,3.6rem);font-weight:800;line-height:1.25;letter-spacing:-.02em;margin-bottom:24px;animation:fade-in-up .8s .1s ease both}
.landing .hero-title em{font-style:normal;color:var(--accent);position:relative;display:inline-block}
.landing .hero-title em::after{content:'';position:absolute;bottom:2px;left:0;right:0;height:3px;background:var(--accent);opacity:.35;border-radius:2px}
.landing .hero-desc{font-size:1rem;color:var(--text-muted);line-height:1.85;max-width:480px;margin-bottom:24px;font-weight:400;letter-spacing:0;animation:fade-in-up .8s .2s ease both}
.landing .hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden;margin-bottom:40px;animation:fade-in-up .8s .3s ease both}
.landing .stat-item{background:var(--bg2);padding:20px 18px;text-align:center}
.landing .stat-num{font-family:var(--serif);font-size:2rem;font-weight:900;color:var(--accent);line-height:1;display:block;margin-bottom:4px}
.landing .stat-num.blue{color:var(--accent3)} .landing .stat-num.yellow{color:var(--accent2)}
.landing .stat-label{font-size:.72rem;color:var(--text-dim);font-weight:500;letter-spacing:.04em}
.landing .hero-actions{display:flex;gap:12px;align-items:center;animation:fade-in-up .8s .4s ease both;flex-wrap:wrap}
.landing .btn-primary{padding:14px 32px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:.95rem;font-weight:700;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .25s}
.landing .btn-primary:hover{background:#d4452c;transform:translateY(-2px);box-shadow:0 8px 24px rgba(232,83,58,.3)}
.landing .btn-secondary{padding:14px 28px;background:transparent;color:var(--text-muted);border:1px solid var(--border);border-radius:8px;font-family:var(--sans);font-size:.95rem;font-weight:500;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:8px;transition:all .25s}
.landing .btn-secondary:hover{border-color:var(--text-dim);color:var(--text)}

.landing .hero-right{display:flex;align-items:center;justify-content:center;padding:80px 40px;overflow:hidden}
.landing .viz-box{background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:24px;width:100%;max-width:480px;position:relative;overflow:hidden;animation:fade-in .9s ease both}
.landing .viz-box::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 40%,rgba(232,83,58,.07) 0%,transparent 50%),radial-gradient(circle at 70% 70%,rgba(74,158,255,.04) 0%,transparent 50%);pointer-events:none}
.landing .viz-label{font-family:var(--mono);font-size:.7rem;color:var(--text-dim);letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px;position:relative;z-index:1}
.landing .viz-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:140px;gap:12px;position:relative;z-index:1}
.landing .viz-empty-icon{font-size:2rem;opacity:.4}
.landing .viz-empty-msg{font-size:.78rem;color:var(--text-dim);text-align:center;line-height:1.6}
.landing .viz-bars-section{position:relative;z-index:1;margin-bottom:16px}
.landing .viz-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.landing .viz-bar-label{font-size:.72rem;color:var(--text-muted);min-width:40px;flex-shrink:0}
.landing .viz-bar-track{flex:1;height:6px;background:rgba(255,255,255,.06);border-radius:3px;overflow:hidden}
.landing .viz-bar-fill{height:100%;background:linear-gradient(90deg,var(--accent),#f5a623);border-radius:3px;transition:width .8s ease}
.landing .viz-bar-count{font-family:var(--mono);font-size:.72rem;color:var(--accent);min-width:32px;text-align:right}
.landing .viz-sido-section{position:relative;z-index:1;margin-bottom:16px;padding:12px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:10px}
.landing .viz-sido-title{font-size:.68rem;color:var(--text-dim);letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}
.landing .viz-sido-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.landing .viz-sido-name{font-size:.72rem;color:var(--text-muted);min-width:36px;flex-shrink:0}
.landing .viz-sido-track{flex:1;height:4px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.landing .viz-sido-fill{height:100%;background:var(--accent3);border-radius:2px;opacity:.8;transition:width .8s ease}
.landing .viz-sido-count{font-family:var(--mono);font-size:.68rem;color:var(--accent3);min-width:24px;text-align:right}
.landing .viz-metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px;position:relative;z-index:1}
.landing .vm{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:12px 14px}
.landing .vm-label{font-size:.7rem;color:var(--text-dim);margin-bottom:4px}
.landing .vm-val{font-family:var(--mono);font-size:1.1rem;color:var(--text);font-weight:500}
.landing .vm-val.red{color:var(--accent)} .landing .vm-val.blue{color:var(--accent3)}
.landing .ticker-wrap{overflow:hidden;position:relative;z-index:1;margin-top:12px;border-top:1px solid var(--border);padding-top:10px}
.landing .ticker{display:flex;gap:48px;white-space:nowrap;animation:ticker 22s linear infinite}
.landing .ticker-item{font-family:var(--mono);font-size:.7rem;color:var(--text-dim);display:inline-flex;gap:8px}
.landing .ticker-item .dot{color:var(--accent)}

.landing .status-banner{background:rgba(232,83,58,.1);border:1px solid rgba(232,83,58,.3);border-radius:10px;padding:14px 20px;margin:0 0 24px;font-size:.85rem;color:var(--accent);display:flex;align-items:center;gap:10px;max-width:480px}
.landing .status-banner.status-ok{background:rgba(46,204,113,.1);border-color:rgba(46,204,113,.3);color:#2ecc71}

.landing section{position:relative}
.landing .sec-label{font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--text-dim);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.landing .sec-label::before{content:'';width:24px;height:1px;background:var(--accent)}
.landing .sec-title{font-family:var(--serif);font-size:clamp(1.8rem,3vw,2.6rem);font-weight:800;letter-spacing:-.02em;line-height:1.25;margin-bottom:16px}
.landing .sec-sub{color:var(--text-muted);font-size:1rem;line-height:1.8;max-width:560px;font-weight:400;letter-spacing:0}

.landing .facts-sec{padding:100px 80px;background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.landing .facts-header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:60px;gap:24px;flex-wrap:wrap}
.landing .facts-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.landing .fact-card{background:var(--bg3);padding:36px 28px;position:relative;overflow:hidden;transition:background .3s}
.landing .fact-card:hover{background:rgba(255,255,255,.04)}
.landing .fact-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--fc,var(--accent))}
.landing .fact-card:nth-child(2){--fc:var(--accent2)} .landing .fact-card:nth-child(3){--fc:var(--accent3)} .landing .fact-card:nth-child(4){--fc:#9b59b6}
.landing .fact-num{font-family:var(--serif);font-size:3rem;font-weight:900;line-height:1;margin-bottom:8px;color:var(--fc,var(--accent));display:flex;align-items:baseline;gap:4px}
.landing .fact-num sup{font-size:1.2rem}
.landing .fact-title{font-size:.9rem;font-weight:700;margin-bottom:6px}
.landing .fact-desc{font-size:.82rem;color:var(--text-muted);line-height:1.7;letter-spacing:0}

.landing .live-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px}
.landing .live-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:24px;text-align:center}
.landing .live-num{font-family:var(--mono);font-size:2rem;font-weight:500;color:var(--accent);margin-bottom:6px}
.landing .live-label{font-size:.8rem;color:var(--text-muted)}

.landing .news-sec{padding:100px 80px}
.landing .news-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:24px;margin-top:48px}
.landing .news-main{background:var(--bg3);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:transform .3s,border-color .3s;text-decoration:none;color:inherit;display:block}
.landing .news-main:hover{transform:translateY(-4px);border-color:var(--accent)}
.landing .news-img{height:220px;background:linear-gradient(135deg,#1a0a08,#2a1010 50%,#1a1a2a);position:relative;overflow:hidden;display:flex;align-items:flex-end;padding:20px}
.landing .news-tag{position:absolute;top:16px;left:16px;background:var(--accent);color:#fff;padding:4px 12px;border-radius:4px;font-size:.72rem;font-weight:700;letter-spacing:.06em}
.landing .news-bars{display:flex;gap:4px;align-items:flex-end;width:100%;height:120px}
.landing .bar{background:var(--accent);border-radius:2px 2px 0 0;flex:1;opacity:.7;transform-origin:bottom;animation:bar-grow 1.5s ease both}
.landing .big76{position:absolute;right:16px;bottom:-10px;font-family:var(--serif);font-size:8rem;font-weight:900;color:rgba(232,83,58,.13);line-height:1}
.landing .news-body{padding:24px}
.landing .news-src{font-family:var(--mono);font-size:.7rem;color:var(--text-dim);letter-spacing:.08em;margin-bottom:10px}
.landing .news-ttl{font-family:var(--serif);font-size:1.3rem;font-weight:700;line-height:1.4;margin-bottom:12px;letter-spacing:-.02em}
.landing .news-body p{font-size:.87rem;color:var(--text-muted);line-height:1.7;margin-bottom:16px}
.landing .news-link{display:inline-flex;align-items:center;gap:6px;color:var(--accent);font-size:.82rem;font-weight:700;letter-spacing:.04em}
.landing .arrow{transition:transform .2s}
.landing .news-main:hover .arrow{transform:translateX(4px)}
.landing .news-side{display:flex;flex-direction:column;gap:16px}
.landing .news-sm{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:20px;text-decoration:none;color:inherit;display:block;transition:border-color .2s,transform .2s;position:relative;overflow:hidden}
.landing .news-sm:hover{border-color:var(--accent);transform:translateX(4px)}
.landing .news-sm::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--nc,var(--accent))}
.landing .news-sm:nth-child(2){--nc:var(--accent2)} .landing .news-sm:nth-child(3){--nc:var(--accent3)}
.landing .news-date{font-family:var(--mono);font-size:.68rem;color:var(--text-dim);margin-bottom:6px}
.landing .news-sm-ttl{font-size:.88rem;font-weight:700;line-height:1.45;margin-bottom:6px}
.landing .news-sm-desc{font-size:.78rem;color:var(--text-muted);line-height:1.5}

.landing .feat-sec{padding:100px 80px;background:var(--bg2);border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.landing .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
.landing .feat-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:28px;transition:border-color .3s,transform .3s;cursor:pointer}
.landing .feat-card:hover{border-color:rgba(232,83,58,.4);transform:translateY(-4px)}
.landing .feat-icon{width:44px;height:44px;background:rgba(232,83,58,.1);border:1px solid rgba(232,83,58,.2);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:16px}
.landing .feat-card:nth-child(2) .feat-icon{background:rgba(245,166,35,.1);border-color:rgba(245,166,35,.2)}
.landing .feat-card:nth-child(3) .feat-icon{background:rgba(74,158,255,.1);border-color:rgba(74,158,255,.2)}
.landing .feat-card:nth-child(4) .feat-icon{background:rgba(155,89,182,.1);border-color:rgba(155,89,182,.2)}
.landing .feat-card:nth-child(5) .feat-icon{background:rgba(46,204,113,.1);border-color:rgba(46,204,113,.2)}
.landing .feat-card:nth-child(6) .feat-icon{background:rgba(231,76,60,.1);border-color:rgba(231,76,60,.2)}
.landing .feat-ttl{font-weight:700;font-size:.95rem;margin-bottom:8px}
.landing .feat-desc{font-size:.82rem;color:var(--text-muted);line-height:1.6}
.landing .feat-badge{display:inline-block;margin-top:12px;padding:3px 10px;border-radius:4px;font-size:.68rem;font-weight:700;letter-spacing:.06em;background:rgba(232,83,58,.1);color:var(--accent);border:1px solid rgba(232,83,58,.2)}

.landing .cta-sec{padding:120px 80px;text-align:center;position:relative;overflow:hidden}
.landing .cta-sec .sec-sub{margin:0 auto}
.landing .cta-sec::before{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:400px;background:radial-gradient(ellipse,rgba(232,83,58,.07) 0%,transparent 70%);pointer-events:none}
.landing .cta-btns{display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-top:40px}
.landing .btn-lg{padding:16px 40px;font-size:1rem;font-weight:700}

.landing .overlay{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px}
.landing .modal{background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:48px;width:100%;max-width:520px;position:relative;animation:modal-in .3s ease;max-height:90vh;overflow-y:auto}
.landing .modal-close{position:absolute;top:20px;right:20px;background:var(--card);border:1px solid var(--border);color:var(--text-muted);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all .2s}
.landing .modal-close:hover{background:rgba(232,83,58,.1);color:var(--accent);border-color:var(--accent)}
.landing .modal-title{font-family:var(--serif);font-size:1.6rem;font-weight:800;letter-spacing:-.02em;margin-bottom:8px}
.landing .modal-desc{color:var(--text-muted);font-size:.88rem;margin-bottom:32px;line-height:1.6}
.landing .fg{margin-bottom:16px}
.landing .fl{display:block;font-size:.78rem;font-weight:700;color:var(--text-muted);margin-bottom:6px;letter-spacing:.06em;text-transform:uppercase}
.landing .fi,.landing .fs{width:100%;padding:12px 16px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:8px;font-family:var(--sans);font-size:.9rem;transition:border-color .2s,box-shadow .2s;outline:none}
.landing .fi:focus,.landing .fs:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(232,83,58,.12)}
.landing .fs option{background:var(--bg3)}
.landing .fr{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.landing .rg{margin-bottom:16px}
.landing .rl{display:flex;justify-content:space-between;font-size:.78rem;margin-bottom:8px}
.landing .rl span:first-child{color:var(--text-muted);font-weight:700}
.landing .rv{color:var(--accent);font-weight:700;font-family:var(--mono)}
.landing input[type=range]{width:100%;height:4px;-webkit-appearance:none;appearance:none;background:linear-gradient(to right,var(--accent) 0%,var(--accent) var(--pct,70%),var(--bg) var(--pct,70%));border-radius:2px;outline:none;cursor:pointer}
.landing input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:var(--accent);border-radius:50%;border:2px solid var(--bg3);box-shadow:0 2px 8px rgba(232,83,58,.4)}
.landing .notify-row{display:flex;gap:12px;align-items:flex-start;margin-bottom:24px}
.landing .notify-icon{width:36px;height:36px;background:rgba(232,83,58,.08);border:1px solid rgba(232,83,58,.2);border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1rem}
.landing .notify-txt{font-size:.82rem;color:var(--text-muted);line-height:1.5}
.landing .notify-txt strong{color:var(--text)}
.landing .btn-submit{width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-family:var(--sans);font-size:.95rem;font-weight:700;cursor:pointer;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:8px}
.landing .btn-submit:hover{background:#d4452c;transform:translateY(-1px)}
.landing .success-box{text-align:center;padding:20px 0}
.landing .s-icon{width:64px;height:64px;background:rgba(46,204,113,.1);border:2px solid rgba(46,204,113,.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 20px}
.landing .s-title{font-family:var(--serif);font-size:1.4rem;font-weight:900;margin-bottom:8px}
.landing .s-desc{color:var(--text-muted);font-size:.88rem;line-height:1.6}

.landing footer{padding:40px 80px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.landing .f-left{font-size:.8rem;color:var(--text-dim)}
.landing .f-left strong{color:var(--text-muted)}
.landing .f-links{display:flex;gap:24px;list-style:none;margin:0;padding:0}
.landing .f-links a{font-size:.78rem;color:var(--text-dim);text-decoration:none}
.landing .f-links a:hover{color:var(--text-muted)}

@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes bar-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes fade-in{from{opacity:0}to{opacity:1}}
@keyframes modal-in{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}

@media(max-width:1024px){
  .landing .hero{grid-template-columns:1fr;min-height:auto}
  .landing .hero-right{display:none}
  .landing .hero-left{padding:100px 40px 60px}
  .landing .facts-grid{grid-template-columns:repeat(2,1fr)}
  .landing .news-grid{grid-template-columns:1fr}
  .landing .feat-grid{grid-template-columns:repeat(2,1fr)}
  .landing nav{padding:0 24px} .landing .nav-links{display:none}
  .landing .facts-sec,.landing .news-sec,.landing .feat-sec,.landing .cta-sec{padding:64px 40px}
  .landing footer{flex-direction:column;gap:16px;padding:32px 40px}
}
@media(max-width:640px){
  .landing .facts-grid,.landing .feat-grid{grid-template-columns:1fr}
  .landing .hero-stats{grid-template-columns:1fr}
  .landing .modal{padding:32px 24px} .landing .fr{grid-template-columns:1fr}
  .landing .live-stats{grid-template-columns:1fr}
}
`;
