'use strict';
/* ═══════════════════════════════════════════
   SECTION THEMES
   Each section → unique canvas behavior + accent

   Modes:
   net       – neural network (home)
   float     – slow dreamy orbs (about)
   matrix    – character rain (skills)
   rise      – golden ascending stream (experience)
   blueprint – PCB grid + nodes (projects)
   orbit     – electrons around nuclei (education)
   pages     – horizontal drifting lines (publications)
   wave      – sonar rings + outward pulse (contact)
   ════════════════════════════════════════════ */
const THEMES = {
  home:          { mode:'net',       colors:['#00d4ff','#7c3aed','#00aaff','#a78bfa','#ffffff'], count:100 },
  about:         { mode:'float',     colors:['#b57bff','#d8b4fe','#c084fc','#e9d5ff','#f0abfc'], count:55 },
  skills:        { mode:'matrix',    colors:['#00ff88','#34d399','#00cc6a','#6ee7b7','#a7f3d0'], count:80 },
  experience:    { mode:'rise',      colors:['#ffb800','#fbbf24','#f97316','#fb923c','#fde68a'], count:70 },
  projects:      { mode:'blueprint', colors:['#38bdf8','#0ea5e9','#06b6d4','#7dd3fc','#bae6fd'], count:65 },
  education:     { mode:'orbit',     colors:['#6d9fff','#60a5fa','#93c5fd','#3b82f6','#bfdbfe'], count:55 },
  publications:  { mode:'pages',     colors:['#ffa040','#fbbf24','#f59e0b','#fde68a','#fff3b0'], count:50 },
  certifications:{ mode:'net',       colors:['#34d399','#10b981','#6ee7b7','#00ff88','#a7f3d0'], count:80 },
  contact:       { mode:'wave',      colors:['#00e5c8','#06b6d4','#67e8f9','#a5f3fc','#34d399'], count:65 },
};

/* ═══════════════════════════════════════════
   CANVAS SETUP
   ════════════════════════════════════════════ */
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let W, H;
let particles   = [];
let waveRings   = [];            // for 'wave' mode sonar rings
let activeId    = 'home';
const mouse     = { x:-9999, y:-9999 };

/* fixed orbit centres (resolved on resize) */
const ORBIT_DEF = [{rx:.2,ry:.28},{rx:.78,ry:.28},{rx:.5,ry:.58},{rx:.22,ry:.74},{rx:.78,ry:.74}];
let orbCentres  = [];

/* matrix character set */
const MCHARS = '01アイウカキ∑∆⊕⊗ABCDEFabcdef0123456789#';

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
  orbCentres = ORBIT_DEF.map(d => ({ x:d.rx*W, y:d.ry*H }));
}

/* ─── Particle ─── */
class Particle {
  constructor(theme) { this.spawn(theme, true); }

  spawn(theme, init=false) {
    this.theme = theme;
    const mode = theme.mode;
    this.color = theme.colors[Math.floor(Math.random() * theme.colors.length)];
    this.alpha = Math.random() * 0.55 + 0.18;
    this.r     = Math.random() * 1.8 + 0.5;
    this.char  = MCHARS[Math.floor(Math.random() * MCHARS.length)]; // matrix
    this.vx = 0; this.vy = 0;

    if (mode === 'matrix') {
      this.col = Math.floor(Math.random() * Math.ceil(W / 16)) * 16 + 8;
      this.x   = this.col;
      this.y   = init ? Math.random() * H : -10;
      this.vy  = Math.random() * 1.6 + 0.5;
      this.r   = 6 + Math.random() * 3;   // font size stored in r for matrix
      return;
    }
    if (mode === 'rise') {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.vx = (Math.random() - 0.5) * 0.28;
      return;
    }
    if (mode === 'float') {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 15;
      this.r  = Math.random() * 4 + 1.5;
      this.alpha = Math.random() * 0.3 + 0.08;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = -(Math.random() * 0.12 + 0.02);
      return;
    }
    if (mode === 'orbit') {
      const c = orbCentres[Math.floor(Math.random() * orbCentres.length)];
      this.cx = c.x; this.cy = c.y;
      this.oR  = Math.random() * 90 + 25;
      this.ang = Math.random() * Math.PI * 2;
      this.spd = (Math.random() * 0.007 + 0.003) * (Math.random() < 0.5 ? 1 : -1);
      this.x   = this.cx + Math.cos(this.ang) * this.oR;
      this.y   = this.cy + Math.sin(this.ang) * this.oR;
      return;
    }
    if (mode === 'pages') {
      this.x  = init ? Math.random() * W : -12;
      this.y  = Math.floor(Math.random() * 10) * (H / 10) + (H / 20);
      this.vx = Math.random() * 0.32 + 0.08;
      this.vy = (Math.random() - 0.5) * 0.04;
      return;
    }
    if (mode === 'wave') {
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 0.4 + 0.15;
      this.x  = W/2 + (Math.random() - 0.5) * 80;
      this.y  = H/2 + (Math.random() - 0.5) * 80;
      this.vx = Math.cos(ang) * spd;
      this.vy = Math.sin(ang) * spd;
      return;
    }
    if (mode === 'blueprint') {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      return;
    }
    // net (default)
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.45;
    this.vy = (Math.random() - 0.5) * 0.45;
  }

  step(theme) {
    const mode = theme.mode;

    // mouse repel (skip orbit – looks jittery)
    if (mode !== 'orbit') {
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const d  = Math.hypot(dx, dy);
      if (d < 85 && d > 0) { this.vx += (dx/d)*0.07; this.vy += (dy/d)*0.07; }
    }

    switch(mode) {
      case 'matrix':
        this.char = MCHARS[Math.floor(Math.random() * MCHARS.length)]; // flicker
        this.y += this.vy;
        if (this.y > H + 8) { this.y = -8; this.col = Math.floor(Math.random() * Math.ceil(W/16))*16+8; this.x = this.col; }
        break;

      case 'rise':
        this.vx *= 0.982; this.vy -= 0.011;
        this.vy = Math.min(this.vy, 0);
        this.vx += (Math.random()-0.5)*0.025;
        this.x += this.vx; this.y += this.vy;
        if (this.y < -12) { this.y = H+12; this.x = Math.random()*W; this.vy = -(Math.random()*0.5+0.15); }
        if (this.x < -12) this.x = W+12; if (this.x > W+12) this.x = -12;
        break;

      case 'float':
        this.vx *= 0.99; this.vy -= 0.003;
        this.vx += (Math.random()-0.5)*0.008;
        this.x += this.vx; this.y += this.vy;
        if (this.y < -15) { this.y = H+15; this.x = Math.random()*W; }
        if (this.x < -15) this.x = W+15; if (this.x > W+15) this.x = -15;
        break;

      case 'orbit':
        this.ang += this.spd;
        this.x = this.cx + Math.cos(this.ang) * this.oR;
        this.y = this.cy + Math.sin(this.ang) * this.oR;
        break;

      case 'pages':
        this.vx = Math.max(this.vx, 0.07); this.vy *= 0.99;
        this.x += this.vx; this.y += this.vy;
        if (this.x > W+12) { this.x=-12; this.y=Math.floor(Math.random()*10)*(H/10)+(H/20); }
        break;

      case 'wave': {
        this.x += this.vx; this.y += this.vy;
        const d2 = Math.hypot(this.x - W/2, this.y - H/2);
        if (d2 > Math.min(W,H)*0.54) {
          this.x = W/2+(Math.random()-0.5)*70; this.y = H/2+(Math.random()-0.5)*70;
          const a = Math.random()*Math.PI*2, s = Math.random()*0.4+0.15;
          this.vx = Math.cos(a)*s; this.vy = Math.sin(a)*s;
        }
        break;
      }

      case 'blueprint':
        this.vx *= 0.97; this.vy *= 0.97;
        this.vx += (Math.random()-0.5)*0.055; this.vy += (Math.random()-0.5)*0.055;
        this.x += this.vx; this.y += this.vy;
        if (this.x<0||this.x>W) this.vx*=-1; if (this.y<0||this.y>H) this.vy*=-1;
        break;

      default: // net
        this.vx *= 0.978; this.vy *= 0.978;
        this.x += this.vx; this.y += this.vy;
        if (this.x < -12) this.x = W+12; if (this.x > W+12) this.x = -12;
        if (this.y < -12) this.y = H+12; if (this.y > H+12) this.y = -12;
    }
  }

  draw(mode) {
    if (mode === 'matrix') {
      ctx.font         = `${this.r}px 'JetBrains Mono', monospace`;
      ctx.fillStyle    = this.color;
      ctx.globalAlpha  = this.alpha;
      ctx.fillText(this.char, this.x, this.y);
      ctx.globalAlpha  = 1;
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle    = this.color;
      ctx.globalAlpha  = this.alpha;
      ctx.fill();
      ctx.globalAlpha  = 1;
    }
  }
}

/* ─── Connections ─── */
function drawLinks(theme) {
  const mode = theme.mode;
  if (mode === 'float') return;

  if (mode === 'matrix') {
    // vertical column links
    for (let i=0;i<particles.length-1;i++) for (let j=i+1;j<particles.length;j++) {
      const dx=Math.abs(particles[i].x-particles[j].x), dy=Math.abs(particles[i].y-particles[j].y);
      if (dx<14 && dy<60) {
        line(particles[i],particles[j],(1-dy/60)*0.25,0.75);
      }
    }
    return;
  }

  if (mode === 'pages') {
    // horizontal paper links
    for (let i=0;i<particles.length-1;i++) for (let j=i+1;j<particles.length;j++) {
      const dy=Math.abs(particles[i].y-particles[j].y), dx=Math.abs(particles[i].x-particles[j].x);
      if (dy<13 && dx<115) line(particles[i],particles[j],(1-dx/115)*0.18,0.6);
    }
    return;
  }

  if (mode === 'orbit') {
    // same-centre orbital links
    for (let i=0;i<particles.length-1;i++) for (let j=i+1;j<particles.length;j++) {
      if (particles[i].cx===particles[j].cx && particles[i].cy===particles[j].cy) {
        const d=Math.hypot(particles[i].x-particles[j].x,particles[i].y-particles[j].y);
        if (d<90) line(particles[i],particles[j],(1-d/90)*0.28,0.6);
      }
    }
    return;
  }

  if (mode === 'blueprint') {
    // tight wiring
    for (let i=0;i<particles.length-1;i++) for (let j=i+1;j<particles.length;j++) {
      const d=Math.hypot(particles[i].x-particles[j].x,particles[i].y-particles[j].y);
      if (d<70) line(particles[i],particles[j],(1-d/70)*0.38,0.8);
    }
    return;
  }

  if (mode === 'wave') {
    // concentric-ring links
    for (let i=0;i<particles.length-1;i++) for (let j=i+1;j<particles.length;j++) {
      const ri=Math.hypot(particles[i].x-W/2,particles[i].y-H/2);
      const rj=Math.hypot(particles[j].x-W/2,particles[j].y-H/2);
      const d =Math.hypot(particles[i].x-particles[j].x,particles[i].y-particles[j].y);
      if (Math.abs(ri-rj)<26 && d<95) line(particles[i],particles[j],(1-d/95)*0.18,0.6);
    }
    return;
  }

  // net / rise
  const maxD = mode==='rise' ? 105 : 135;
  for (let i=0;i<particles.length-1;i++) for (let j=i+1;j<particles.length;j++) {
    const d=Math.hypot(particles[i].x-particles[j].x,particles[i].y-particles[j].y);
    if (d<maxD) line(particles[i],particles[j],(1-d/maxD)*0.13,0.7);
  }
}

function line(a,b,alpha,lw) {
  ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
  ctx.strokeStyle=a.color; ctx.globalAlpha=alpha; ctx.lineWidth=lw; ctx.stroke(); ctx.globalAlpha=1;
}

/* ─── Extra canvas features ─── */
function drawOrbRings() {
  // orbital rings for education mode
  orbCentres.forEach(c => {
    // nucleus
    ctx.beginPath(); ctx.arc(c.x,c.y,3.5,0,Math.PI*2);
    ctx.fillStyle='#60a5fa'; ctx.globalAlpha=0.55; ctx.fill(); ctx.globalAlpha=1;
    // rings
    [30,58,88].forEach((r,i) => {
      ctx.beginPath();
      ctx.ellipse(c.x,c.y, r, r*0.38, Math.PI/4+i*0.3, 0, Math.PI*2);
      ctx.strokeStyle='#3b82f6'; ctx.globalAlpha=0.06; ctx.lineWidth=0.8; ctx.stroke(); ctx.globalAlpha=1;
    });
  });
}

function drawBpGrid() {
  // blueprint grid for projects mode
  const step=52;
  ctx.strokeStyle='#38bdf8'; ctx.lineWidth=0.4;
  for (let x=0;x<W;x+=step){
    ctx.globalAlpha=0.045; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
  }
  for (let y=0;y<H;y+=step){
    ctx.globalAlpha=0.045; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  }
  ctx.globalAlpha=1;
}

let lastRingMs=0;
function tickWaveRings(ts) {
  if (ts-lastRingMs > 900) { lastRingMs=ts; waveRings.push({r:0,alpha:0.45}); }
  waveRings = waveRings.filter(ring => {
    ring.r += 1.8; ring.alpha -= 0.004;
    if (ring.alpha <= 0) return false;
    ctx.beginPath(); ctx.arc(W/2,H/2,ring.r,0,Math.PI*2);
    ctx.strokeStyle='#00e5c8'; ctx.globalAlpha=ring.alpha; ctx.lineWidth=1.2; ctx.stroke(); ctx.globalAlpha=1;
    return true;
  });
}

const SKILL_WORDS = [
  'Java','Python','Docker','AWS','Kotlin','Go','TypeScript','GCP','CI/CD','AI Agents','LLMs','Microservices'
];
const PROJECT_CLUSTERS = [
  { id:'agentic', label:'Agentic Systems', x:.22, y:.42, color:'#38bdf8', r:80, detail:'Autonomous agent workflows with high reliability.' },
  { id:'defense', label:'DefenseMatrix', x:.5, y:.58, color:'#0ea5e9', r:72, detail:'Secure operational pipelines for mission-critical systems.' },
  { id:'vision', label:'VisionML', x:.78, y:.38, color:'#06b6d4', r:68, detail:'3D semantic pipelines for high-throughput perception.' },
];
const experiencePhases = [
  { label:'Startup AI', offset:0.18, color:'#f97316' },
  { label:'Cloud Security', offset:0.45, color:'#8b5cf6' },
  { label:'Research & Scale', offset:0.72, color:'#22c55e' }
];
let selectedCluster = null;
const globeState = { angleX:0, angleY:0, dragging:false, lastX:0, lastY:0, auto:0 };
const educationFlight = { progress:0, active:false, speed:0.0015 };

function drawCurve(points, alpha, width, color) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i=1;i<points.length;i++) {
    const midX = (points[i-1].x + points[i].x) / 2;
    const midY = (points[i-1].y + points[i].y) / 2;
    ctx.quadraticCurveTo(points[i-1].x, points[i-1].y, midX, midY);
  }
  ctx.lineTo(points[points.length-1].x, points[points.length-1].y);
  ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.stroke(); ctx.globalAlpha = 1;
}

function drawTextLabels(words) {
  words.forEach(w => {
    ctx.font = '700 18px Inter';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText(w.text, w.x, w.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeText(w.text, w.x, w.y);
  });
}

function drawAboutNetwork(theme, ts) {
  const nodes = particles.slice(0, Math.min(32, particles.length));
  nodes.forEach((node, idx) => {
    const offset = Math.sin((window.scrollY*0.002)+(idx*0.45))*18;
    node.x += Math.cos(idx*1.1+window.scrollY*0.001)*0.25 + offset*0.01;
    node.y += Math.sin(idx*0.9+window.scrollY*0.001)*0.14;
    node.alpha = 0.35 + Math.sin(ts*0.004 + idx)*0.12;
  });
  drawLinks(theme);
  nodes.forEach(n => { n.draw(''); });
}

function drawSkillsCloud(theme) {
  if (!window.skillCloud || window.skillCloud.length===0) {
    window.skillCloud = SKILL_WORDS.map((word,i)=>({
      text: word,
      x: W*0.12 + (i%4)*W*0.18 + Math.random()*30,
      y: H*0.3 + Math.floor(i/4)*H*0.16 + Math.random()*18,
      vx:(Math.random()-0.5)*0.2,
      vy:(Math.random()-0.5)*0.24,
      angle:Math.random()*Math.PI*2,
      alpha:0.85
    }));
  }
  window.skillCloud.forEach(item => {
    item.x += item.vx + Math.cos(item.angle)*0.08;
    item.y += item.vy + Math.sin(item.angle)*0.06;
    item.angle += 0.007;
    if (item.x < 40 || item.x > W-140) item.vx *= -1;
    if (item.y < 80 || item.y > H-80) item.vy *= -1;
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(Math.sin(item.angle)*0.06);
    ctx.globalAlpha = item.alpha;
    ctx.font = '700 20px Inter';
    const labelWidth = ctx.measureText(item.text).width;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(-8, -24, labelWidth + 28, 42);
    ctx.fillStyle = theme.mode === 'matrix' ? '#a7f3d0' : '#ffffff';
    ctx.fillText(item.text, 10, 0);
    ctx.restore();
  });
}

function drawExperienceTimeline(theme) {
  const x = W*0.15;
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=4;
  ctx.beginPath(); ctx.moveTo(x,H*0.16); ctx.lineTo(x,H*0.86); ctx.stroke();
  experiencePhases.forEach(phase => {
    const py = H*phase.offset;
    ctx.beginPath(); ctx.arc(x, py, 12, 0, Math.PI*2);
    ctx.fillStyle = phase.color; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
    ctx.font='600 14px Inter'; ctx.fillStyle='rgba(255,255,255,0.85)';
    ctx.fillText(phase.label, x+24, py+5);
  });
  const view = document.getElementById('experience');
  if (view) {
    const rect = view.getBoundingClientRect();
    const progress = Math.min(Math.max((H-rect.top)/ (rect.height+H),0),1);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth=6;
    ctx.beginPath(); ctx.moveTo(x,H*0.16); ctx.lineTo(x,H*0.16 + (H*0.7*progress)); ctx.stroke();
  }
}

function drawEducationMap(theme) {
  const centerX = W*0.55, centerY = H*0.5, scale = Math.min(W,H)*0.4;
  const mapColor = theme.mode==='orbit' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = mapColor; ctx.lineWidth = 1.2;
  for (let i=0;i<7;i++){ ctx.beginPath(); ctx.ellipse(centerX, centerY, scale - i*16, (scale*0.5) - i*8, 0, 0, Math.PI*2); ctx.stroke(); }
  const path = [
    {x: W*0.16, y:H*0.55},
    {x: W*0.34, y:H*0.48},
    {x: W*0.54, y:H*0.4},
    {x: W*0.68, y:H*0.3}
  ];
  drawCurve(path, 0.24, 2.8, '#60a5fa');
  educationFlight.progress = Math.min(1, educationFlight.progress + (educationFlight.active?educationFlight.speed:0));
  const planePos = {
    x: path[0].x + (path[3].x-path[0].x)*educationFlight.progress,
    y: path[0].y + (path[3].y-path[0].y)*educationFlight.progress - Math.sin(educationFlight.progress*Math.PI)*28
  };
  ctx.save(); ctx.translate(planePos.x, planePos.y); ctx.rotate(Math.sin(educationFlight.progress*Math.PI)*0.2);
  ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(12,5); ctx.lineTo(0,10); ctx.lineTo(4,5); ctx.closePath(); ctx.fill(); ctx.restore();
  if (educationFlight.progress > 0.92) {
    ctx.beginPath(); ctx.arc(path[3].x, path[3].y, 18,0,Math.PI*2);
    ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2.4; ctx.globalAlpha=0.9; ctx.stroke();
    ctx.globalAlpha=1; ctx.fillStyle='rgba(34,211,238,0.16)'; ctx.beginPath(); ctx.arc(path[3].x, path[3].y, 34,0,Math.PI*2); ctx.fill();
    ctx.font='700 14px Inter'; ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.fillText('George Mason University', path[3].x+30, path[3].y+5);
  }
}

function drawProjectsClusters(theme) {
  const baseX = W*0.24;
  PROJECT_CLUSTERS.forEach(cluster => {
    const cx = cluster.x * W;
    const cy = cluster.y * H;
    const radius = selectedCluster===cluster.id ? cluster.r*1.45 : cluster.r;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI*2);
    ctx.fillStyle = cluster.color; ctx.globalAlpha = 0.14; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = cluster.color; ctx.globalAlpha = 0.4; ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font='700 18px Inter'; ctx.fillStyle=cluster.color; ctx.fillText(cluster.label, cx - ctx.measureText(cluster.label).width/2, cy + radius + 30);
    if (selectedCluster===cluster.id) {
      ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.font='600 14px Inter';
      const desc = cluster.detail;
      const textWidth = Math.min(280, W*0.24);
      ctx.fillText(desc, cx - textWidth/2, cy + 48);
    }
  });
}

function projectClusterHit(x,y) {
  return PROJECT_CLUSTERS.find(cluster => {
    const cx = cluster.x*W, cy = cluster.y*H;
    return Math.hypot(x-cx,y-cy) <= cluster.r * 1.1;
  });
}

function handleProjectClick(e) {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const hit = projectClusterHit(x,y);
  if (hit) selectedCluster = selectedCluster===hit.id ? null : hit.id;
}

function drawPublicationsArchive(theme) {
  const center = {x: W*0.5, y:H*0.45};
  const cardCount = 4;
  for (let i=0;i<cardCount;i++) {
    const angle = i*0.9 + Date.now()*0.0006;
    const px = center.x + Math.cos(angle)*W*0.16;
    const py = center.y + Math.sin(angle)*H*0.06 + i*18;
    const w = 220; const h = 140;
    ctx.save(); ctx.translate(px,py); ctx.rotate(Math.sin(angle)*0.08);
    ctx.fillStyle='rgba(15,23,42,0.74)'; ctx.shadowColor='rgba(56,189,248,0.25)'; ctx.shadowBlur=18;
    ctx.fillRect(-w/2,-h/2,w,h);
    ctx.strokeStyle='rgba(56,189,248,0.6)'; ctx.lineWidth=1.2; ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.fillStyle='rgba(255,255,255,0.88)'; ctx.font='700 14px Inter';
    ctx.fillText(i===0?'Mobile Applications for Smart City Logistics': i===1?'Secure Cloud Guardian':'Patents & Research', -w/2 + 18, -h/2 + 28);
    ctx.fillStyle='rgba(148,163,184,0.85)'; ctx.font='500 12px Inter';
    ctx.fillText('Futuristic archive citation', -w/2 + 18, -h/2 + 52);
    ctx.restore();
  }
}

function drawContactGlobe(theme) {
  const cx=W*0.5, cy=H*0.5, rad=Math.min(W,H)*0.23;
  globeState.auto += 0.002;
  if (!globeState.dragging) globeState.angleY += 0.0015;
  const rotY = globeState.angleY + globeState.lastX*0.002;
  const rotX = globeState.angleX*0.003;
  ctx.save(); ctx.translate(cx,cy);
  ctx.fillStyle='rgba(15,23,42,0.88)'; ctx.beginPath(); ctx.arc(0,0,rad,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(0,0,rad-10,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle='rgba(56,189,248,0.18)';
  for (let i=0;i<10;i++) {
    const ang = i*(Math.PI/5)+rotY*0.5;
    const r = rad - 14 - (i%2)*8;
    ctx.beginPath(); ctx.ellipse(0,0,r,r*0.6, ang, 0, Math.PI*2); ctx.stroke();
  }
  ctx.restore();
  const marker = (lat, lon) => {
    const phi = (90-lat)*Math.PI/180;
    const theta = (lon+rotY*30)%360 * Math.PI/180;
    const x = cx + rad * Math.sin(phi)*Math.cos(theta);
    const y = cy + rad * Math.cos(phi);
    return {x,y};
  };
  const india = marker(20,78);
  const usa = marker(38,-97);
  ctx.strokeStyle='rgba(56,189,248,0.85)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(india.x, india.y); ctx.quadraticCurveTo((india.x+usa.x)/2, cy-70, usa.x, usa.y); ctx.stroke();
  ctx.fillStyle='#0ea5e9'; ctx.beginPath(); ctx.arc(india.x, india.y, 6,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(usa.x, usa.y, 6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.font='600 12px Inter'; ctx.fillText('India', india.x+10, india.y+4); ctx.fillText('USA', usa.x+10, usa.y+4);
  ctx.beginPath(); ctx.moveTo(india.x, india.y); ctx.lineTo(india.x+18, india.y-10); ctx.lineTo(india.x+12, india.y+2); ctx.fill();
}

function updateSectionAnimations(ts) {
  if (activeId==='about') drawAboutNetwork(THEMES.about, ts);
  if (activeId==='skills') drawSkillsCloud(THEMES.skills);
  if (activeId==='experience') drawExperienceTimeline(THEMES.experience);
  if (activeId==='education') drawEducationMap(THEMES.education);
  if (activeId==='projects') drawProjectsClusters(THEMES.projects);
  if (activeId==='publications') drawPublicationsArchive(THEMES.publications);
  if (activeId==='contact') drawContactGlobe(THEMES.contact);
}

canvas.addEventListener('click', (e)=>{ if (activeId==='projects') handleProjectClick(e); }, {passive:true});
canvas.addEventListener('mousedown',(e)=>{ if (activeId==='contact') { globeState.dragging=true; globeState.lastX=e.clientX; globeState.lastY=e.clientY; }});
canvas.addEventListener('mouseup',()=>{ globeState.dragging=false; });
canvas.addEventListener('mousemove',(e)=>{ if (activeId==='contact' && globeState.dragging) {
  const dx = e.clientX - globeState.lastX;
  globeState.angleY += dx * 0.008;
  globeState.lastX = e.clientX;
}});

/* ─── Build particles ─── */
function buildParts(id) {
  const t = THEMES[id] || THEMES.home;
  particles = Array.from({length:t.count}, () => new Particle(t));
  if (id !== 'contact') waveRings = [];
  if (id==='education') educationFlight.active=true; else educationFlight.active=false;
  if (id!=='projects') selectedCluster=null;
}

/* ─── Render loop ─── */
function frame(ts) {
  ctx.clearRect(0,0,W,H);
  const theme = THEMES[activeId] || THEMES.home;

  if (theme.mode==='blueprint')  drawBpGrid();
  if (theme.mode==='orbit')      drawOrbRings();
  if (theme.mode==='wave')       tickWaveRings(ts);

  drawLinks(theme);
  particles.forEach(p => { p.step(theme); p.draw(theme.mode); });
  updateSectionAnimations(ts);
  requestAnimationFrame(frame);
}

window.addEventListener('resize', ()=>{ resize(); buildParts(activeId); }, {passive:true});
canvas.addEventListener('mousemove', e=>{ mouse.x=e.clientX; mouse.y=e.clientY; }, {passive:true});
canvas.addEventListener('mouseleave',()=>{ mouse.x=-9999; mouse.y=-9999; }, {passive:true});

resize();
buildParts('home');
requestAnimationFrame(frame);

/* ═══════════════════════════════════════════
   SECTION GLOW (per-section subtle centre glow)
   ════════════════════════════════════════════ */
const sectionGlow = document.getElementById('sectionGlow');
function applyGlow(id) {
  // Uses CSS --acc-rgb already set on body; just updates the radial gradient
  sectionGlow.style.background =
    `radial-gradient(ellipse 55% 45% at 50% 50%, rgba(var(--acc-rgb),0.05), transparent 70%)`;
}

/* ═══════════════════════════════════════════
   SECTION OBSERVER — switches theme as you scroll
   ════════════════════════════════════════════ */
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const id = e.target.id;
    if (!THEMES[id] || id===activeId || cinRunning) return;
    activeId = id;
    document.body.dataset.section = id;
    buildParts(id);
    applyGlow(id);
    markActiveNav(id);
  });
}, { threshold:0.38 });

document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));

/* ═══════════════════════════════════════════
   CINEMA
   ════════════════════════════════════════════ */
const cinEl = document.createElement('div');
cinEl.id = 'cinema';
cinEl.innerHTML = `
  <div class="cp cp-l"></div>
  <div class="cp cp-r"></div>
  <div class="cc">
    <p class="cc-ch" id="cinCh">Ch. 01</p>
    <h2 class="cc-title" id="cinTitle">HOME</h2>
    <span class="cc-bar"></span>
  </div>`;
document.body.appendChild(cinEl);

const CIN_META = {
  home:'Ch. 01',about:'Ch. 02',skills:'Ch. 03',experience:'Ch. 04',
  projects:'Ch. 05',education:'Ch. 06',publications:'Ch. 07',
  certifications:'Ch. 08',contact:'Ch. 09',
};

let cinRunning = false;

function cinGo(targetId) {
  if (cinRunning) return;
  cinRunning = true;

  document.getElementById('cinTitle').textContent = targetId.toUpperCase();
  document.getElementById('cinCh').textContent    = CIN_META[targetId] || '';
  cinEl.className = '';

  requestAnimationFrame(()=>requestAnimationFrame(()=>{ cinEl.classList.add('in'); }));

  setTimeout(()=>{
    // while screen is covered — switch theme + instant scroll
    activeId = targetId;
    document.body.dataset.section = targetId;
    buildParts(targetId);
    applyGlow(targetId);
    markActiveNav(targetId);

    const target = document.getElementById(targetId);
    if (target) window.scrollTo({top:Math.max(0,target.offsetTop-64+1),behavior:'instant'});

    cinEl.classList.add('text');
  }, 540);

  setTimeout(()=>{ cinEl.classList.replace('in','out'); cinEl.classList.add('out'); cinEl.classList.remove('in'); }, 1220);

  setTimeout(()=>{ cinEl.className=''; cinRunning=false; }, 1900);
}

/* ═══════════════════════════════════════════
   NAVBAR
   ════════════════════════════════════════════ */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll',()=>{ navbar.classList.toggle('scrolled',scrollY>30); },{passive:true});

function markActiveNav(id) {
  document.querySelectorAll('.nl').forEach(l=>{
    l.classList.toggle('active', l.getAttribute('href')==='#'+id);
  });
}
markActiveNav('home');

navToggle.addEventListener('click',()=>{
  const open = navLinks.classList.toggle('open');
  const s    = navToggle.querySelectorAll('span');
  s[0].style.transform = open?'translateY(6.5px) rotate(45deg)':'';
  s[1].style.opacity   = open?'0':'1';
  s[2].style.transform = open?'translateY(-6.5px) rotate(-45deg)':'';
});

/* intercept all # links for cinema */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    const id = this.getAttribute('href').slice(1);
    if (!document.getElementById(id)) return;
    e.preventDefault();
    navLinks.classList.remove('open');
    navToggle.querySelectorAll('span').forEach(s=>{s.style.transform='';s.style.opacity='';});
    cinGo(id);
  });
});

/* ═══════════════════════════════════════════
   SECTION GHOST NUMBERS  (injected via JS)
   ════════════════════════════════════════════ */
const SEC_NUMS = {home:'00',about:'01',skills:'02',experience:'03',projects:'04',education:'05',publications:'06',certifications:'07',contact:'08'};
document.querySelectorAll('section[id]').forEach(sec=>{
  const h2 = sec.querySelector('.sec-head h2');
  if (h2 && SEC_NUMS[sec.id]) h2.dataset.num = SEC_NUMS[sec.id];
});

/* ═══════════════════════════════════════════
   TYPING EFFECT
   ════════════════════════════════════════════ */
(function(){
  const el = document.getElementById('typingText');
  const phrases = ['autonomous AI agents','distributed systems','cloud-native backends','intelligent workflows','scalable infrastructure'];
  let pi=0,ci=0,del=false;
  function tick(){
    const p=phrases[pi];
    el.textContent=del?p.slice(0,ci--):p.slice(0,ci++);
    if (!del&&ci>p.length){del=true;setTimeout(tick,1800);return;}
    if (del&&ci<0){del=false;ci=0;pi=(pi+1)%phrases.length;setTimeout(tick,400);return;}
    setTimeout(tick,del?44:82);
  }
  setTimeout(tick,900);
})();

/* ═══════════════════════════════════════════
   DARK/LIGHT MODE THEME TOGGLE
   ════════════════════════════════════════════ */
(function(){
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const body = document.body;
  
  // Check saved preference or system preference
  const getSavedTheme = () => {
    return localStorage.getItem('portfolio-theme');
  };
  
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const applyTheme = (theme) => {
    if (!themeToggle) return;
    if (theme === 'light') {
      body.classList.add('light-mode');
      themeToggle.title = 'Switch to Dark Mode';
    } else {
      body.classList.remove('light-mode');
      themeToggle.title = 'Switch to Light Mode';
    }
    localStorage.setItem('portfolio-theme', theme);
  };
  
  // Initialize theme
  const savedTheme = getSavedTheme();
  const initialTheme = savedTheme || getSystemTheme();
  applyTheme(initialTheme);
  
  // Theme toggle click handler
  themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  });
  
  // Listen for system theme changes
  const darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemTheme = (e) => {
    if (!getSavedTheme()) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  };
  if (typeof darkMedia.addEventListener === 'function') {
    darkMedia.addEventListener('change', handleSystemTheme);
  } else if (typeof darkMedia.addListener === 'function') {
    darkMedia.addListener(handleSystemTheme);
  }
})();
(function(){
  const el = document.getElementById('heroSys');
  const lines = [
    '> initialising portfolio.sh...',
    '> loading modules: AI · Backend · Cloud...',
    '> status: READY · open to opportunities',
  ];
  let li=0,ci=0;
  function tick(){
    if (li>=lines.length) return;
    el.textContent = lines[li].slice(0,ci++);
    if (ci>lines[li].length){
      if (li<lines.length-1){ li++; ci=0; setTimeout(tick,600); }
      return;
    }
    setTimeout(tick,35);
  }
  setTimeout(tick,200);
})();

/* ═══════════════════════════════════════════
   MAGNETIC MOUSE EFFECT FOR INTERACTIVE ELEMENTS
   ════════════════════════════════════════════ */
const magneticElements = document.querySelectorAll('a[href], button, .icon-link');
magneticElements.forEach(el => {
  el.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    
    if (distance < 100) {
      const force = (1 - distance / 100) * 0.15;
      this.style.transform = `translate(${x * force}px, ${y * force}px)`;
    }
  });
  
  el.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

/* ═══════════════════════════════════════════
   SMOOTH SCROLL REVEAL with Parallax
   ════════════════════════════════════════════ */
(function(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (!e.isIntersecting) return;
      const sibs = Array.from(e.target.parentElement.querySelectorAll('.reveal:not(.in)'));
      const idx  = sibs.indexOf(e.target);
      setTimeout(()=>{
        e.target.classList.add('in');
        // Parallax effect
        if (e.target.classList.contains('proj-card') || e.target.classList.contains('edu-card')) {
          e.target.style.transform = 'translateY(0)';
        }
      }, idx*80);
      io.unobserve(e.target);
    });
  },{threshold:0.15,rootMargin:'0px 0px -60px 0px'});
  
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();

/* ═══════════════════════════════════════════
   COUNTER ANIMATION with easing
   ════════════════════════════════════════════ */
(function(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if (!e.isIntersecting) return;
      const el=e.target, tgt=parseInt(el.dataset.target,10);
      let cur=0; const step=1100/tgt;
      const t=setInterval(()=>{
        cur++;
        el.textContent=cur;
        if(cur>=tgt) clearInterval(t);
      },step);
      io.unobserve(el);
    });
  },{threshold:0.5});
  document.querySelectorAll('.kpi-val[data-target]').forEach(el=>io.observe(el));
})();

/* ═══════════════════════════════════════════
   ADVANCED 3D TILT on PROJECT CARDS
   ════════════════════════════════════════════ */
document.querySelectorAll('.proj-card').forEach(c=>{
  c.addEventListener('mousemove',function(e){
    const r=this.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
    const rotX = -y*8;
    const rotY = x*8;
    this.style.transform=`translateY(-8px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
    this.style.boxShadow = `${x*20}px ${y*20}px 40px rgba(var(--acc-rgb), 0.3)`;
    this.style.transition='none';
  });
  c.addEventListener('mouseleave',function(){
    this.style.transform=''; 
    this.style.boxShadow = '';
    this.style.transition='all 0.5s cubic-bezier(0.34,1.56,0.64,1)';
  });
});

/* ═══════════════════════════════════════════
   TAG RIPPLE EFFECT (enhanced)
───────────────────────────────────────────── */
const rs=document.createElement('style');
rs.textContent=`
  @keyframes tagRipple { 
    to { transform:scale(2.8); opacity:0; } 
  }
  @keyframes tagGlitch {
    0% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    50% { transform: translateX(2px); }
    75% { transform: translateX(-1px); }
    100% { transform: translateX(0); }
  }
`;
document.head.appendChild(rs);

document.querySelectorAll('.tag').forEach(tag=>{
  tag.addEventListener('mouseenter',function(e){
    const r=this.getBoundingClientRect();
    
    // Ripple
    const s=document.createElement('span');
    Object.assign(s.style,{
      position:'absolute',borderRadius:'50%',pointerEvents:'none',
      width:'60px',height:'60px',
      left:`${e.clientX-r.left-30}px`,top:`${e.clientY-r.top-30}px`,
      background:'rgba(var(--acc-rgb),0.3)',
      transform:'scale(0)',animation:'tagRipple 0.5s ease-out forwards',
    });
    this.style.position='relative'; 
    this.style.overflow='hidden';
    this.appendChild(s);
    
    // Glitch
    this.style.animation = 'tagGlitch 0.2s ease-in-out';
    
    setTimeout(()=>s.remove(),500);
    setTimeout(()=>{ this.style.animation = ''; },200);
  });
  
  tag.addEventListener('mouseleave',function(){
    this.style.animation = '';
  });
});

/* ═══════════════════════════════════════════
   SCROLL-BASED PARALLAX on Canvas Glow
   ════════════════════════════════════════════ */
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const sectionGlow = document.getElementById('sectionGlow');
  const scroll = window.scrollY;
  const offset = (scroll - lastScroll) * 0.1;
  sectionGlow.style.backgroundPosition = `0 ${offset}px`;
  lastScroll = scroll;
}, { passive: true });

/* ═══════════════════════════════════════════
   HERO SCROLL INDICATOR - Click to scroll
   ════════════════════════════════════════════ */
document.querySelector('.hero-scroll')?.addEventListener('click', () => {
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
