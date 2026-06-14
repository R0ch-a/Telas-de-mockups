/* ===================== HAULIX APP ===================== */
const screensEl = document.getElementById('screens');

/* ---------- helpers ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
function smooth(pts,W){let d=`M${pts[0][0]},${pts[0][1]}`;for(let i=1;i<pts.length;i++){const[x0,y0]=pts[i-1],[x1,y1]=pts[i],cx=(x0+x1)/2;d+=` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;}return d;}

/* ===================================================== */
/* 1) OPERATIONS DASHBOARD                               */
/* ===================================================== */
function dashboardHTML(){
  return `
  <div class="screen active" id="sc-dashboard">
    <div class="page-head anim">
      <div>
        <h1>Operations Dashboard</h1>
        <div class="sub">Monday, April 8, 2026 · Real-time overview</div>
      </div>
      <div class="dropdown">Last 7 days <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></div>
    </div>

    <div class="dash-grid">
      <!-- LEFT COLUMN -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card anim">
          <div class="card-h"><div class="ti"><svg viewBox="0 0 24 24"><path d="M12 2 4 6v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6z"/></svg>Quick Actions</div></div>
          <div class="quick-actions">
            <button class="qa"><span class="qi"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span>Add New Trip</button>
            <button class="qa"><span class="qi"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 19a6 6 0 0 1 12 0M17 8v6M14 11h6"/></svg></span>Assign Driver</button>
            <button class="qa" onclick="nav('map')"><span class="qi"><svg viewBox="0 0 24 24"><path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z"/><path d="M9 3v15M15 6v15"/></svg></span>Live Map</button>
          </div>
        </div>

        <div class="card anim">
          <div class="card-h"><div class="ti"><svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M9 7h7M7 9v6"/></svg>Alert Priority Queue</div><div class="act"><button class="seeall">See all</button></div></div>
          ${alertHTML('warn','Route Deviation','Warning','Vehicle TX-3360-HX deviated from planned route on I-25 N. Driver rerouted via US...')}
          ${alertHTML('crit','Engine Warning','Critical','Vehicle TX-1147-HX showing engine diagnostic code P0420. Immediate inspection required.')}
          ${alertHTML('crit','Critical Fuel Level','Critical','Vehicle TX-1147-HX fuel level critically low at 12%. Vehicle offline — requires...')}
        </div>

        <div class="card anim">
          <div class="card-h"><div class="ti"><svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M9 7h7M7 9v6"/></svg>Recent Activity</div><div class="act"><button class="seeall">See all</button></div></div>
          ${activityHTML('truck','Geofence entry alert resolved for','TX-3917-HX','8 April, 2026 06:21:57 AM')}
          ${activityHTML('fuel','','TX-4821-HX','8 April, 2026 06:21:57 AM','fueled at Texarkana, TX — 62 gal')}
          ${activityHTML('trip','Trip','HLX-2026-0344','8 April, 2026 06:21:57 AM','departed Fort Worth, TX')}
          ${activityHTML('trip','Trip','HLX-2026-0341','8 April, 2026 05:02:11 AM','arrived Oklahoma City, OK')}
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card anim">
          <div class="card-h"><div class="ti"><svg viewBox="0 0 24 24"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>Fleet Utilization Trend</div><div class="act"><button class="iconbtn-sm"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg></button></div></div>
          <div class="card-desc">Weekly utilization % and total distance</div>
          <div id="utilChart" style="position:relative;margin-top:8px"></div>
        </div>

        <div class="card anim">
          <div class="card-h"><div class="ti"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 9h18M8 21h8"/></svg>On-Time Delivery Performance</div><div class="act"><button class="iconbtn-sm"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5"/></svg></button></div></div>
          <div class="card-desc">Weekly on-time vs delayed delivery percentage</div>
          <div id="otdChart" style="margin-top:8px"></div>
        </div>
      </div>
    </div>
  </div>`;
}
function alertHTML(type,title,badge,body){
  const bcls=type==='warn'?'warn':'crit';
  const ic=type==='warn'
    ? '<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M9 7h7M7 9v6"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M14 4 4 8v5c0 4 2.5 6.5 6 8 .8-.3 1.5-.7 2-1M19 9l-7-3M22 15l-3 3-3-3M19 12v6"/></svg>';
  return `<div class="alert ${type}">
    <div class="alert-top">
      <span class="ai">${ic}</span><b>${title}</b>
      <span class="a-badge ${bcls}">${type==='warn'?'⚠':'△'} ${badge}</span>
      <span class="alert-actions">
        <button class="a-act"><svg viewBox="0 0 24 24"><path d="M2 12l5 5L12 7M12 17l5-5"/></svg></button>
        <button class="a-act eye"><svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg></button>
      </span>
    </div>
    <div class="alert-body">${body}</div>
  </div>`;
}
function activityHTML(ic,pre,tag,time,post){
  const icons={
    truck:'<svg viewBox="0 0 24 24"><path d="M1 16V7h11v9M12 10h4l4 4v2h-8"/><circle cx="6" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/></svg>',
    fuel:'<svg viewBox="0 0 24 24"><path d="M6 20V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v12M4 20h14M16 11h2a2 2 0 0 1 2 2v3"/></svg>',
    trip:'<svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M9 7h7M7 9v6"/></svg>'
  };
  const tagHTML=`<span class="tag">${tag}<svg viewBox="0 0 24 24"><path d="M7 17 17 7M9 7h8v8"/></svg></span>`;
  return `<div class="activity-row">
    <div class="act-ic">${icons[ic]}</div>
    <div class="act-main">
      <div class="l1">${pre?pre+' ':''}${tagHTML}${post?' '+post:''}</div>
      <div class="l2">${time}</div>
    </div>
    <button class="a-act eye" style="width:30px;height:30px;border-radius:9px"><svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></svg></button>
  </div>`;
}

/* ----- Fleet Utilization: 3D-ish cylinder bars ----- */
function renderUtilChart(){
  const wrap=document.getElementById('utilChart'); if(!wrap)return;
  const W=560,H=260,padL=34,padR=44,padB=30,padT=10;
  const days=['2 Sun','3 Mon','4 Mon','5 Mon','6 Mon','7 Mon','8 Mon'];
  const util=[44,86,38,88,55,78,62];
  const dist=[120000,300000,118000,344700,210000,290000,235000];
  const n=days.length, plotH=H-padB-padT, plotW=W-padL-padR;
  const bw=plotW/n*0.5;
  const yU=v=>padT+plotH*(1-v/100);
  let bars='';
  util.forEach((u,i)=>{
    const cx=padL+plotW*(i+0.5)/n;
    const top=yU(u), bot=H-padB, h=bot-top, rx=bw/2, ry=7;
    const hot=i===3;
    const fill=hot?'#5fe0f0':'#1d6f7e';
    const fillTop=hot?'#9af0fb':'#2a8fa0';
    bars+=`<g class="ubar" data-i="${i}" style="cursor:pointer">
      <rect x="${cx-rx}" y="${top}" width="${bw}" height="${h}" fill="${fill}" opacity="${hot?0.95:0.7}"/>
      <ellipse cx="${cx}" cy="${bot}" rx="${rx}" ry="${ry}" fill="${fill}" opacity="${hot?0.95:0.7}"/>
      <ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" fill="${fillTop}"/>
      <rect x="${cx-rx}" y="${top}" width="${bw}" height="${h}" fill="transparent"/>
    </g>`;
  });
  // gridlines + left axis (utilization %)
  let grid='';
  [0,20,40,60,80,100].forEach(v=>{const y=yU(v);grid+=`<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="#23262a" stroke-width="1" stroke-dasharray="3 5"/><text x="${padL-8}" y="${y+4}" fill="#5c6066" font-size="10" text-anchor="end">${v}</text>`;});
  // right axis (distance) — aligned to the same 6 gridlines, evenly spaced
  let rlabels='';
  ['0','60,000','120,000','240,000','300,000','360,000'].forEach((v,i)=>{
    const y=yU(i*20);
    rlabels+=`<text x="${W-padR+8}" y="${y+4}" fill="#5c6066" font-size="10">${v}</text>`;
  });
  let xl='';
  days.forEach((d,i)=>{const cx=padL+plotW*(i+0.5)/n;xl+=`<text x="${cx}" y="${H-10}" fill="#5c6066" font-size="10" text-anchor="middle">${d}</text>`;});

  wrap.innerHTML=`<svg class="chart-svg" viewBox="0 0 ${W} ${H}">${grid}${rlabels}${bars}${xl}</svg>`;

  // tooltips
  const tip=document.getElementById('barTip');
  wrap.querySelectorAll('.ubar').forEach(b=>{
    b.addEventListener('mousemove',e=>{
      const i=+b.dataset.i;
      tip.innerHTML=`<div class="r"><span>Utilization:</span><b>${util[i]}%</b></div><div class="r"><span>Distance:</span><b>${(dist[i]/1000).toFixed(1)} mi</b></div>`;
      tip.style.left=e.clientX+'px';tip.style.top=e.clientY+'px';tip.style.opacity='1';
    });
    b.addEventListener('mouseleave',()=>tip.style.opacity='0');
  });
}

/* ----- On-Time Delivery: purple area chart ----- */
function renderOTD(){
  const wrap=document.getElementById('otdChart'); if(!wrap)return;
  const W=560,H=240,padL=30,padB=28,padT=8;
  const rnd=mulberry32(99);
  const N=80;
  const pts=[];
  for(let i=0;i<N;i++){
    let base=70+Math.sin(i*0.4)*14+Math.sin(i*0.13)*10;
    if(i<8) base=92-i*1.5;
    base+= (rnd()-0.5)*16;
    base=Math.max(35,Math.min(100,base));
    const x=padL+(W-padL-6)*i/(N-1);
    const y=padT+(H-padB-padT)*(1-base/100);
    pts.push([x,y]);
  }
  const path=smooth(pts,W);
  let grid='';
  [0,25,50,75,100].forEach(v=>{const y=padT+(H-padB-padT)*(1-v/100);grid+=`<line x1="${padL}" y1="${y}" x2="${W-6}" y2="${y}" stroke="#23262a" stroke-width="1" stroke-dasharray="3 5"/><text x="${padL-8}" y="${y+4}" fill="#5c6066" font-size="10" text-anchor="end">${v}</text>`;});
  let xl='';['2 Sun','3 Mon','4 Mon','5 Mon','6 Mon','7 Mon','8 Mon'].forEach((d,i,a)=>{const x=padL+(W-padL-6)*i/(a.length-1);xl+=`<text x="${x}" y="${H-8}" fill="#5c6066" font-size="10" text-anchor="middle">${d}</text>`;});
  wrap.innerHTML=`<svg class="chart-svg" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="purpg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7c6cf0" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#7c6cf0" stop-opacity="0.04"/>
    </linearGradient></defs>
    ${grid}
    <path d="${path} L${W-6},${H-padB} L${padL},${H-padB} Z" fill="url(#purpg)"/>
    <path d="${path}" fill="none" stroke="#9b8cf5" stroke-width="1.6"/>
    ${xl}
  </svg>`;
}

window.renderDashboardCharts=function(){renderUtilChart();renderOTD();};

/* ===================================================== */
/* 2) LIVE MAP                                          */
/* ===================================================== */
function mapHTML(){
  return `
  <div class="screen" id="sc-map">
    <div class="page-head anim">
      <div><h1>Operations Dashboard</h1><div class="sub">Monday, April 8, 2026 · Real-time overview</div></div>
      <div class="dropdown">Last 7 days <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></div>
    </div>
    <div class="anim" style="display:flex;align-items:center;gap:14px;margin-bottom:16px;flex-wrap:wrap">
      <div class="seg" id="fleetFilter">
        <button class="on" data-f="All">All <span class="ct">10</span></button>
        <button data-f="Active">Active <span class="ct">6</span></button>
        <button data-f="Idle">Idle <span class="ct">2</span></button>
        <button data-f="Maintenance">Maintenance <span class="ct">1</span></button>
        <button data-f="Offline">Offline <span class="ct">1</span></button>
      </div>
      <button class="iconbtn-sm" style="width:38px;height:38px"><svg viewBox="0 0 24 24"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg></button>
      <div class="toggle-row">
        <span class="toggle-item">Show routes <button class="toggle on" onclick="this.classList.toggle('on')"></button></span>
        <span class="toggle-item">Show alerts <button class="toggle on" onclick="this.classList.toggle('on')"></button></span>
      </div>
    </div>
    <div class="map-stage anim" id="mapStage">
      <div class="map-bg" id="mapBg"></div>
      <!-- vehicle detail panel -->
      <div class="veh-panel">
        <div class="vp-head">
          <span class="vp-truck"><svg viewBox="0 0 24 24"><path d="M1 16V7h11v9M12 10h4l4 4v2h-8"/><circle cx="6" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/></svg></span>
          <b>TX-4821-HX</b><span class="badge-status active">Active</span>
          <span style="margin-left:auto"><button class="iconbtn-sm" style="background:none;border:none"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></span>
        </div>
        <div class="vp-sub">Volvo FH16 · 2023 · V001</div>
        <div class="vp-route">
          <div class="vp-route-top"><span>Dallas, TX → Memphis, TN</span><span><b>282.1 mi</b> 72%</span></div>
          <div class="vp-prog"><i style="width:72%"></i></div>
          <div class="vp-route-bot"><span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> Est. Time to Arrival (ETA): ~1h 8m</span><span><b>72.9 mi</b> Distance remaining</span></div>
        </div>
        <div class="vp-gauges">
          <div class="vp-gauge">
            <div class="vpg-head">Speed <span class="badge-status high">High</span></div>
            <div id="speedGauge"></div>
            <div class="vpg-big">100 mph</div>
          </div>
          <div class="vp-gauge">
            <div class="vpg-head">Fuel level <span class="badge-status amber">31%</span></div>
            <div id="fuelGauge"></div>
          </div>
        </div>
        <div class="vp-break"><svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17.5h.01"/></svg><b>Required Break:</b> 30 min (After 8h of driving)</div>
      </div>
      <!-- compass -->
      <div class="compass"><div class="compass-ring"></div><div class="compass-nw">NW</div><div class="compass-needle"></div></div>
      <!-- map controls -->
      <div class="map-controls">
        <button class="mc"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg></button>
        <button class="mc"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M11 8v6M8 11h6"/></svg></button>
        <button class="mc"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4M8 11h6"/></svg></button>
        <button class="mc"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5"/></svg></button>
        <button class="mc"><svg viewBox="0 0 24 24"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg></button>
        <button class="mc"><svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4"/></svg></button>
      </div>
      <div class="map-foot-l">Space + Drag to pan · Scroll to zoom</div>
      <div class="map-foot-r">Map updates every 3 minutes</div>
    </div>
  </div>`;
}

function renderMapBg(){
  const bg=document.getElementById('mapBg'); if(!bg)return;
  const rnd=mulberry32(7);
  let roads='';
  // grid of irregular streets
  for(let i=0;i<22;i++){
    const y=20+i*46+ (rnd()-0.5)*20;
    roads+=`<line x1="0" y1="${y}" x2="1400" y2="${y+ (rnd()-0.5)*40}" stroke="#1c1f22" stroke-width="${1+rnd()*2}"/>`;
  }
  for(let i=0;i<30;i++){
    const x=20+i*48+ (rnd()-0.5)*20;
    roads+=`<line x1="${x}" y1="0" x2="${x+(rnd()-0.5)*40}" y2="900" stroke="#1c1f22" stroke-width="${1+rnd()*2}"/>`;
  }
  // active route (lime glow) + truck markers
  bg.innerHTML=`<svg viewBox="0 0 1400 900" preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%">
    ${roads}
    <path d="M620 560 Q720 540 760 600 T 980 640 1180 720" fill="none" stroke="#d6f25b" stroke-width="3" opacity="0.85"/>
    <circle cx="640" cy="555" r="40" fill="#d6f25b" opacity="0.18"/>
    <g class="map-truck" style="transform:translate(615px,535px)"><rect x="0" y="0" width="44" height="22" rx="3" fill="#e8e9ea" transform="rotate(-28)"/></g>
  </svg>
  <div class="map-marker" style="left:62%;top:32%;transform:rotate(20deg)"></div>
  <div class="map-marker" style="left:18%;top:62%;transform:rotate(-30deg)"></div>
  <div class="map-marker" style="left:80%;top:55%;transform:rotate(50deg)"></div>`;
}

/* speed + fuel mini gauges */
function renderSpeedGauge(){
  const el=document.getElementById('speedGauge'); if(!el)return;
  // arc 150° span gradient green->amber->red, needle at ~100
  el.innerHTML=`<svg viewBox="0 0 160 110" style="width:100%">
    <defs><linearGradient id="spd" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3ec77a"/><stop offset="0.5" stop-color="#e8c84a"/><stop offset="1" stop-color="#f0564f"/>
    </linearGradient></defs>
    <path d="M22 92 A 58 58 0 1 1 138 92" fill="none" stroke="url(#spd)" stroke-width="9" stroke-linecap="round"/>
    ${[0,25,50,75,100,125,150].map((v,i)=>{const a=(Math.PI*(1+ i/6));const r=42;const x=80+Math.cos(a)*r,y=92+Math.sin(a)*r;return `<text x="${x}" y="${y+3}" fill="#7a7e84" font-size="8" text-anchor="middle">${v}</text>`;}).join('')}
    <g transform="rotate(60 80 92)"><line x1="80" y1="92" x2="80" y2="44" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="80" cy="92" r="5" fill="#fff"/></g>
  </svg>`;
}
function renderFuelGauge(){
  const el=document.getElementById('fuelGauge'); if(!el)return;
  const TARGET=3.61, MAXGAL=11.5;     // 3.61 gal ≈ 31% of tank
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.innerHTML=`<svg viewBox="0 0 150 132" style="width:100%;display:block">
    <defs>
      <clipPath id="fuelClip"><circle cx="75" cy="62" r="50"/></clipPath>
      <linearGradient id="fuelFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f0b43c"/><stop offset="1" stop-color="#c8841a"/>
      </linearGradient>
    </defs>
    <!-- dial face -->
    <circle cx="75" cy="62" r="52" fill="#16181a" stroke="#26292c" stroke-width="1.5"/>
    <!-- ticks ring -->
    <g id="fuelTicks"></g>
    <!-- liquid -->
    <g clip-path="url(#fuelClip)">
      <path id="fuelWaveBack" fill="#c98e1a" opacity="0.45"/>
      <path id="fuelWaveFront" fill="url(#fuelFill)" opacity="0.92"/>
    </g>
    <!-- readouts -->
    <text x="75" y="50" fill="#9a9ea4" font-size="9" text-anchor="middle">⛽</text>
    <text id="fuelGal" x="75" y="68" fill="#fff" font-size="16" font-weight="700" text-anchor="middle" style="font-variant-numeric:tabular-nums">0.00 gal</text>
    <g id="fuelTempPill"><rect x="60" y="76" width="30" height="13" rx="6.5" fill="#202325"/><text id="fuelTemp" x="75" y="85" fill="#9a9ea4" font-size="8" text-anchor="middle">🌡 49°F</text></g>
  </svg>`;

  // ticks around the dial
  let t='';
  for(let i=0;i<60;i++){const a=(i/60)*Math.PI*2;const r1=53,r2=i%5===0?49:51;t+=`<line x1="${75+Math.cos(a)*r1}" y1="${62+Math.sin(a)*r1}" x2="${75+Math.cos(a)*r2}" y2="${62+Math.sin(a)*r2}" stroke="#34373a" stroke-width="1.4"/>`;}
  document.getElementById('fuelTicks').innerHTML=t;

  const front=document.getElementById('fuelWaveFront');
  const back=document.getElementById('fuelWaveBack');
  const galEl=document.getElementById('fuelGal');
  const tempEl=document.getElementById('fuelTemp');

  // build a wave path: liquid surface = baseline + two sine crests; phase animates to slosh
  function wave(level /*0..1*/, phase, amp){
    const cx=75, cy=62, R=50;
    const surfaceY = (cy+R) - level*(2*R);   // y of mean liquid surface
    const pts=[];
    for(let x=cx-R; x<=cx+R; x+=4){
      const k=(x-(cx-R))/(2*R);              // 0..1 across
      const y=surfaceY + Math.sin(k*Math.PI*2 + phase)*amp + Math.sin(k*Math.PI*4 + phase*1.6)*amp*0.4;
      pts.push([x,y]);
    }
    let d=`M${cx-R},${cy+R} L${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for(let i=1;i<pts.length;i++) d+=` L${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`;
    d+=` L${cx+R},${cy+R} Z`;
    return d;
  }

  if(reduced){
    const lvl=TARGET/MAXGAL;
    front.setAttribute('d',wave(lvl,0,3));
    back.setAttribute('d',wave(lvl,Math.PI,3));
    galEl.textContent=TARGET.toFixed(2)+' gal';
    tempEl.textContent='🌡 72°F';
    return;
  }

  // animate: fill rises (count up) over ~2.2s, wave keeps sloshing forever
  const fillDur=2200, startTemp=49, endTemp=72;
  const start=performance.now();
  let raf;
  function frame(now){
    const t=(now-start);
    const fillK=Math.min(t/fillDur,1);
    const ease=1-Math.pow(1-fillK,3);
    const gal=TARGET*ease;
    const lvl=gal/MAXGAL;
    // wave amplitude bigger while filling, calms as it settles
    const amp=2.2 + (1-fillK)*3.2;
    const phase=now/430;
    front.setAttribute('d',wave(lvl,phase,amp));
    back.setAttribute('d',wave(lvl,phase+Math.PI*0.7,amp*0.8));
    galEl.textContent=gal.toFixed(2)+' gal';
    tempEl.textContent='🌡 '+Math.round(startTemp+(endTemp-startTemp)*ease)+'°F';
    raf=requestAnimationFrame(frame);
  }
  raf=requestAnimationFrame(frame);
  // stash so re-entry restarts cleanly
  el._raf && cancelAnimationFrame(el._raf);
  el._raf=raf;
}

/* ===================================================== */
/* 3) FLEET / CARGO (vehicle detail)                    */
/* ===================================================== */
const CARGO=[
  {id:'SHP-8841',risk:'Critical',rc:'crit'},
  {id:'SHP-4574',risk:'High',rc:'high',sel:true},
  {id:'SHP-9856',risk:'Normal',rc:'norm'},
  {id:'SHP-2364',risk:'Low',rc:'low'},
  {id:'SHP-8578',risk:'Low',rc:'low'},
  {id:'SHP-7841',risk:'Normal',rc:'norm',cold:true},
  {id:'SHP-1248',risk:'Critical',rc:'crit',cold:true},
  {id:'SHP-8978',risk:'High',rc:'high'},
  {id:'SHP-7787',risk:'Critical',rc:'crit'},
  {id:'SHP-7801',risk:'Low',rc:'low'},
  {id:'SHP-5678',risk:'High',rc:'high'}
];
function fleetHTML(){
  return `
  <div class="screen" id="sc-fleet">
    <div class="anim" style="display:flex;align-items:center;gap:8px;color:var(--faint);font-size:.82rem;margin-bottom:6px">
      <span style="cursor:pointer" onclick="nav('dashboard')">Dashboard</span> ›
      <span>Fleet Vehicles</span> › <span style="color:var(--text)">TX-4821-HX</span>
    </div>
    <div class="page-head anim" style="margin-bottom:10px">
      <div>
        <h1 style="font-style:italic">TX-9913-HX <span class="badge-status idle">● Idle</span></h1>
        <div class="sub">Kenworth T680</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn-ghost"><svg viewBox="0 0 24 24"><path d="M14 6l-3 3-2-2-5 5v4h4l5-5-2-2 3-3 4 4-1 1"/></svg> Maintenance</button>
        <button class="btn-ghost"><svg viewBox="0 0 24 24"><circle cx="9" cy="12" r="3"/><circle cx="15" cy="12" r="3"/></svg> Take Offline</button>
        <button class="btn-lime"><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg> Activate Route</button>
        <button class="iconbtn-sm" style="width:38px;height:38px;border-radius:11px"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button>
      </div>
    </div>
    <div class="anim" style="display:flex;gap:24px;border-bottom:1px solid var(--line);margin-bottom:16px">
      ${['Overview','Cargo','Trips 2','Maintenance 3','Alerts 0'].map((t,i)=>`<button class="vtab ${i===1?'on':''}">${t.replace(/(\d+)/,'<span class="vtab-ct">$1</span>')}</button>`).join('')}
    </div>

    <div class="fleet-grid">
      <!-- cargo layout -->
      <div class="card anim">
        <div class="card-h"><div class="ti"><svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4zM3 12l9 4 9-4M3 17l9 4 9-4"/></svg>Cargo Layout</div>
          <span class="badge-status loaded" style="margin-left:8px">● Fully loaded</span>
          <div class="act"><button class="iconbtn-sm"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5"/></svg></button></div>
        </div>
        <div class="cap-row">
          <div class="cap"><span class="cap-l"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--faint);fill:none;stroke-width:1.8"><path d="M5 8h14v12H5z M9 8V5h6v3"/></svg> 28 700</span><span class="cap-tot">/ 44 000 lbs</span><div class="cap-meter"><span class="cap-pct">65%</span><div class="cap-bar"><i class="amber" style="width:65%"></i></div></div><div class="cap-cap">Weight capacity</div></div>
          <div class="cap"><span class="cap-l"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--faint);fill:none;stroke-width:1.8"><path d="M3 8l9-5 9 5v8l-9 5-9-5z M12 3v18"/></svg> 2 390</span><span class="cap-tot">/ 2 400 ft³</span><div class="cap-meter"><span class="cap-pct">100%</span><div class="cap-bar"><i class="red" style="width:100%"></i></div></div><div class="cap-cap">Volume capacity</div></div>
        </div>
        <div class="cargo-stage">
          <div class="cargo-grid" id="cargoGrid"></div>
          <div class="cargo-front">← FRONT (Cab)</div>
          <div class="cargo-rear">REAR (Doors) →</div>
        </div>
      </div>

      <!-- packages panel -->
      <div class="card anim">
        <div class="card-h"><div class="ti"><svg viewBox="0 0 24 24"><path d="M3 7l9-4 9 4-9 4zM3 7v10l9 4 9-4V7M12 11v10"/></svg>Packages</div>
          <div class="act"><button class="iconbtn-sm"><svg viewBox="0 0 24 24"><path d="M3 5h18l-7 8v6l-4 2v-8z"/></svg></button><button class="iconbtn-sm"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></button></div>
        </div>
        <div class="card-desc">Total: <b style="color:var(--text)">10/10 Items</b> &nbsp; Total weight: <b style="color:var(--text)">28,700 lbs</b></div>

        <div class="pkg" style="margin-top:14px">
          <div class="pkg-head"><span class="pkg-thumb"></span><b>SHP-8841</b><svg class="pkg-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/></svg><span class="badge-status crit" style="margin-left:auto">Critical</span></div>
          <div class="pkg-sub">Fiber Optic Cables (x200)</div>
          <div class="pkg-tags"><span class="ptag">1 800 lbs</span><span class="ptag">120 ft³</span><span class="ptag fragile">◇ Fragile</span></div>
        </div>

        <div class="pkg open">
          <div class="pkg-head"><span class="pkg-thumb"></span><b>SHP-4574</b><svg class="pkg-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/></svg><span class="badge-status high" style="margin-left:auto">High</span></div>
          <div class="pkg-sub">48" LED Displays (x24)</div>
          <div class="pkg-detail">
            <div class="pd-row"><div><div class="pd-l">Client</div><div class="pd-v">TechFlow Inc.</div></div><div><div class="pd-l">Loading order</div><div class="pd-v">#4</div></div></div>
            <div class="pd-row"><div><div class="pd-l">Destination</div><div class="pd-v">Memphis, TN</div></div><div><div class="pd-l">Risk score</div><div class="pd-v">15% <span class="badge-status low">Low</span></div><div class="risk-bar"><i style="width:15%"></i></div></div></div>
          </div>
          <div class="pkg-meta"><span><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--faint);fill:none;stroke-width:1.8"><path d="M5 8h14v12H5z"/></svg> 4 200 <small>lbs</small></span><span><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:var(--faint);fill:none;stroke-width:1.8"><path d="M3 8l9-5 9 5v8l-9 5-9-5z"/></svg> 320 <small>ft³</small></span></div>
          <div class="pkg-warn"><svg viewBox="0 0 24 24"><path d="M12 3 2.5 20h19z"/><path d="M12 10v4M12 17.5h.01"/></svg><div><b>Fragile</b><br>Handle with care. Shock-absorbing packaging required.</div></div>
          <div class="pkg-actions"><button class="btn-ghost sm"><svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M9 7h7M7 9v6"/></svg> View Route</button><button class="btn-ghost sm"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5"/></svg> Reassign to Another Truck</button></div>
        </div>
      </div>
    </div>
  </div>`;
}
function renderCargoGrid(){
  const g=document.getElementById('cargoGrid'); if(!g)return;
  g.innerHTML=CARGO.map(c=>`
    <div class="cargo-cell ${c.sel?'sel':''} ${c.rc}">
      <div class="cc-id">${c.id} <svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/></svg></div>
      <div class="cc-badge"><span class="rdot ${c.rc}">${c.cold?'❄':'◇'}</span><span class="badge-status ${c.rc}">${c.risk}</span></div>
    </div>`).join('');
  g.querySelectorAll('.cargo-cell').forEach(cell=>cell.onclick=()=>{
    g.querySelectorAll('.cargo-cell').forEach(x=>x.classList.remove('sel'));
    cell.classList.add('sel');
  });
}

/* ===================================================== */
/* 4) DRIVER MANAGEMENT                                  */
/* ===================================================== */
const DRIVERS={
  Driving:[
    {n:'James Miller',e:'j.miller88@example.com',cdl:'CDL-A TX-88421'},
    {n:'Robert Davis',e:'rob.davis.nyc@gmail.com',cdl:'CDL-A TX-15932'},
    {n:'Marcus Johnson',e:'marcus.jj75@example.com',cdl:'CDL-A TX-44701'},
    {n:'William Taylor',e:'w_taylor_pro@outlook.com',cdl:'CDL-A TX-54521'}
  ],
  Resting:[
    {n:'Richard Moore',e:'moore.richard.jr@example.com',cdl:'CDL-A TX-78841'},
    {n:'Joseph Garcia',e:'joegarcia_consulting@mail.com',cdl:'CDL-A TX-35644'},
    {n:'Thomas Martinez',e:'tommy.m_85@protonmail.com',cdl:'CDL-A TX-24554'}
  ],
  'Off Duty':[
    {n:'Charles Robinson',e:'c_robinson@example.com',cdl:'CDL-A TX-90112'}
  ]
};
const COL_COLOR={Driving:'#39c7d8',Resting:'#7c6cf0','Off Duty':'#9a9ea4'};
function driversHTML(){
  const cols=Object.keys(DRIVERS).map(col=>`
    <div class="dcol anim">
      <div class="dcol-head"><span class="dcol-dot" style="background:${COL_COLOR[col]}"></span><b>${col}</b><span class="dcol-ct">${DRIVERS[col].length}</span>
        <button class="iconbtn-sm" style="margin-left:auto;background:none;border:none"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button>
      </div>
      <div class="dcol-sub">Weekly utilization % and total distance</div>
      ${DRIVERS[col].map(driverCard).join('')}
    </div>`).join('');
  return `
  <div class="screen" id="sc-drivers">
    <div class="page-head anim">
      <div><h1>Driver Management</h1><div class="sub">Performance metrics and operational insights</div></div>
    </div>
    <div class="anim" style="display:flex;align-items:center;gap:20px;border-bottom:1px solid var(--line);margin-bottom:8px">
      <button class="vtab"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.8;vertical-align:-2px"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg> List</button>
      <button class="vtab on"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.8;vertical-align:-2px"><rect x="3" y="3" width="7" height="18" rx="1.5"/><rect x="14" y="3" width="7" height="18" rx="1.5"/></svg> Board</button>
      <button class="vtab"><svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.8;vertical-align:-2px"><path d="M6 2h9l3 3v17H6z M9 10h6M9 14h6"/></svg> Workload</button>
      <button class="iconbtn-sm" style="margin-left:auto;width:34px;height:34px;border-radius:50%"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5"/></svg></button>
    </div>
    <div class="drivers-board">${cols}</div>
  </div>`;
}
function driverCard(d){
  const initials=d.n.split(' ').map(x=>x[0]).join('');
  return `<div class="dcard">
    <div class="dc-top"><b>${d.n}</b><span class="dc-cdl">${d.cdl}</span><svg class="pkg-copy" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5h10"/></svg>
      <span class="dc-actions"><button class="dc-rb"><svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.1-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg></button><button class="dc-rb"><svg viewBox="0 0 24 24"><path d="M18 8h1a3 3 0 0 1 0 6h-1M3 8h15v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z M7 1v3M11 1v3M15 1v3"/></svg></button></span>
    </div>
    <div class="dc-body">
      <div class="dc-ava" style="background:linear-gradient(135deg,#3a4256,#2a2f3c)">${initials}<span class="dc-pres"></span></div>
      <div class="dc-mail"><svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 7l10 6 10-6"/></svg>${d.e}</div>
    </div>
    <div class="dc-stats">
      <span><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> 6.5h</span>
      <span><svg viewBox="0 0 24 24"><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M9 7h7M7 9v6"/></svg> 267</span>
      <span><svg viewBox="0 0 24 24" style="stroke:none;fill:var(--yellow)"><path d="M12 2l2.4 6.5H21l-5.3 4 2 6.5L12 15l-5.7 4 2-6.5L3 8.5h6.6z"/></svg> 4.8</span>
    </div>
  </div>`;
}

/* ===================================================== */
/* ROUTER                                                */
/* ===================================================== */
screensEl.innerHTML = dashboardHTML()+mapHTML()+fleetHTML()+driversHTML();

function nav(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const sc=document.getElementById('sc-'+id);
  if(sc) sc.classList.add('active');
  document.querySelectorAll('.sb-item').forEach(b=>b.classList.toggle('on', b.dataset.s===id));
  document.getElementById('scroll').scrollTop=0;
  if(id==='dashboard') renderDashboardCharts();
  if(id==='map'){renderMapBg();renderSpeedGauge();renderFuelGauge();}
  if(id==='fleet') renderCargoGrid();
}
window.nav=nav;
document.querySelectorAll('.sb-item[data-s]').forEach(b=>b.onclick=()=>nav(b.dataset.s));
document.querySelectorAll('#fleetFilter button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#fleetFilter button').forEach(x=>x.classList.remove('on'));b.classList.add('on');
});

/* initial */
renderDashboardCharts();
