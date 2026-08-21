const state = { duration: 10 };

const $ = (id) => document.getElementById(id);
const storyboardEl = $('storyboard');
const flowEl = $('flow');
const subtitleEl = $('subtitle');

function emptyState() {
  storyboardEl.innerHTML = `<div class="empty-state"><div><strong>광고 정보를 입력해 주세요</strong><p>왼쪽 기획 정보를 바탕으로 10초 또는 30초 스토리보드를 자동 구성합니다.</p></div></div>`;
  flowEl.innerHTML = `<div class="empty-state"><div><strong>Flow 프롬프트 대기 중</strong><p>생성 버튼을 누르면 장면별 짧은 영문 프롬프트가 만들어집니다.</p></div></div>`;
  subtitleEl.innerHTML = `<div class="empty-state"><div><strong>후편집 자막 대기 중</strong><p>한글 자막은 영상 생성 후 편집 단계에서 넣는 것을 권장합니다.</p></div></div>`;
}

function getFormData() {
  return {
    purpose: $('purpose').value,
    brand: $('brand').value.trim() || 'YOUR BRAND',
    problem: $('problem').value.trim() || '사람들이 중요한 기회와 정보를 놓치고 있다.',
    solution: $('solution').value.trim() || '필요한 정보와 사람을 빠르게 연결해 문제를 해결한다.',
    target: $('target').value.trim() || '핵심 사용자',
    message: $('message').value.trim() || '작은 변화가 큰 기회를 만든다.',
    mood: $('mood').value,
    characterLock: $('characterLock').checked,
    subtitleMode: $('subtitleMode').value,
  };
}

function promptPrefix(data) {
  const identity = data.characterLock
    ? 'Use the uploaded reference image as the fixed character identity. Keep the same face, hairstyle, outfit, age, ethnicity, and overall appearance. Do not redesign or replace the character. '
    : '';
  return `${identity}Cinematic 16:9 commercial, ${data.mood.toLowerCase()}, clean composition, realistic motion, no embedded Korean text, no logos unless provided. `;
}

function subtitleFor(text, mode) {
  if (mode === 'none') return '없음 — 영상 생성 단계 무자막';
  if (mode === 'placeholder') return 'ENGLISH PLACEHOLDER';
  return text;
}

function build10s(data) {
  const prefix = promptPrefix(data);
  return [
    {
      time: '0–2초', title: 'HOOK · 문제 포착',
      visual: `${data.target}이(가) ${data.problem}`,
      motion: '빠른 푸시인, 짧은 정지, 시선이 문제 지점으로 집중',
      subtitle: subtitleFor(data.problem, data.subtitleMode),
      prompt: `${prefix}Open on ${data.target} experiencing a clear everyday problem: ${data.problem}. Fast push-in, strong visual hook, expressive but natural acting.`
    },
    {
      time: '2–5초', title: 'ACTION · 해결책 등장',
      visual: `${data.brand}가 자연스럽게 등장하고 핵심 기능이 한눈에 보인다.`,
      motion: '문제 장면에서 앱/서비스 화면으로 매치 컷, 속도감 있는 전환',
      subtitle: subtitleFor(data.solution, data.subtitleMode),
      prompt: `${prefix}Match cut from the problem into the ${data.brand} solution. Show the core function clearly through visual action: ${data.solution}. Crisp interface-like motion, no readable Korean text.`
    },
    {
      time: '5–8초', title: 'TRANSFORMATION · 변화',
      visual: '사용자의 표정과 상황이 빠르게 긍정적으로 바뀐다.',
      motion: '비포→애프터 리듬, 부드러운 트래킹, 화면 밝기와 에너지 상승',
      subtitle: subtitleFor(data.message, data.subtitleMode),
      prompt: `${prefix}Show a fast before-and-after transformation. The same character becomes confident and connected after using the solution. Smooth tracking shot, uplifting energy, premium commercial rhythm.`
    },
    {
      time: '8–10초', title: 'BRAND · 엔딩',
      visual: `${data.brand} 중심의 깨끗한 히어로 엔딩.`,
      motion: '카메라 정지, 브랜드 여운을 위한 1초 홀드',
      subtitle: subtitleFor(`${data.brand} · ${data.message}`, data.subtitleMode),
      prompt: `${prefix}Final hero shot for ${data.brand}. Clean premium ending, confident character pose, simple brand-centered composition, hold the final frame. No generated Korean typography.`
    }
  ];
}

function build30s(data) {
  const prefix = promptPrefix(data);
  return [
    {
      time: '1편 · 0–10초', title: '문제와 공감',
      visual: `${data.target}이(가) 겪는 문제를 실제 상황처럼 보여주고 감정적으로 공감시킨다.`,
      motion: '관찰형 시작 → 빠른 클로즈업 → 문제를 상징하는 디테일 컷',
      subtitle: subtitleFor(data.problem, data.subtitleMode),
      prompt: `${prefix}10-second Part 1. Focus only on the problem and emotional empathy. Follow ${data.target} struggling with: ${data.problem}. Realistic acting, cinematic close-ups, escalating tension, end on a clear need for change.`
    },
    {
      time: '2편 · 10–20초', title: '해결책과 기능',
      visual: `${data.brand}가 등장해 ${data.solution}의 핵심 기능을 행동으로 보여준다.`,
      motion: '앱 등장 → 핵심 기능 2~3개 → 빠른 결과, 명확한 시선 유도',
      subtitle: subtitleFor(data.solution, data.subtitleMode),
      prompt: `${prefix}10-second Part 2. Introduce ${data.brand} as the solution. Demonstrate the core function through clear visual action: ${data.solution}. Fast, readable sequence, consistent character identity, no generated Korean text.`
    },
    {
      time: '3편 · 20–30초', title: '가치·사람 연결·브랜드',
      visual: '문제가 해결된 뒤 사람과 사람이 연결되고, 긍정적인 변화가 확장되며 브랜드로 마무리된다.',
      motion: '인물 연결 → 공간 확장 → 감정적 클라이맥스 → 브랜드 히어로 컷',
      subtitle: subtitleFor(`${data.message} — ${data.brand}`, data.subtitleMode),
      prompt: `${prefix}10-second Part 3. Show the human value after the solution: people connect, confidence grows, opportunities open. End with a premium hero frame for ${data.brand}. Emotional payoff, uplifting cinematic finish, no generated Korean typography.`
    }
  ];
}

function renderScenes(scenes) {
  storyboardEl.innerHTML = '';
  const template = $('sceneTemplate');
  scenes.forEach((scene) => {
    const node = template.content.cloneNode(true);
    node.querySelector('.time-badge').textContent = scene.time;
    node.querySelector('.scene-title').textContent = scene.title;
    node.querySelector('.scene-visual').textContent = scene.visual;
    node.querySelector('.scene-motion').textContent = scene.motion;
    node.querySelector('.scene-subtitle').textContent = scene.subtitle;
    node.querySelector('.scene-prompt').textContent = scene.prompt;
    node.querySelector('.copy-btn').addEventListener('click', () => copyText(`${scene.time}\n${scene.title}\n화면: ${scene.visual}\n카메라/모션: ${scene.motion}\n자막: ${scene.subtitle}\n프롬프트: ${scene.prompt}`));
    storyboardEl.appendChild(node);
  });
}

function renderFlow(scenes, data) {
  flowEl.innerHTML = '';
  scenes.forEach((scene, idx) => {
    const card = document.createElement('article');
    card.className = 'flow-card';
    card.innerHTML = `<h3>${state.duration === 30 ? `${idx + 1}편` : `Scene ${idx + 1}`} · ${scene.time}</h3><div class="codeish"></div><div class="copy-row"><button class="copy-btn">프롬프트 복사</button></div>`;
    card.querySelector('.codeish').textContent = scene.prompt;
    card.querySelector('.copy-btn').addEventListener('click', () => copyText(scene.prompt));
    flowEl.appendChild(card);
  });

  const all = document.createElement('article');
  all.className = 'flow-card';
  const combined = scenes.map((s, i) => `${i + 1}. ${s.prompt}`).join('\n\n');
  all.innerHTML = `<h3>${state.duration}초 전체 프롬프트</h3><div class="codeish"></div><div class="copy-row"><button class="copy-btn">전체 복사</button></div>`;
  all.querySelector('.codeish').textContent = state.duration === 30
    ? `Create a 30-second commercial as three separate 10-second clips. Maintain identical character identity, wardrobe, visual style, lighting logic, and brand world across all three clips.\n\n${combined}`
    : combined;
  all.querySelector('.copy-btn').addEventListener('click', () => copyText(all.querySelector('.codeish').textContent));
  flowEl.appendChild(all);
}

function renderSubtitle(scenes, data) {
  const lines = scenes.map((s) => `${s.time}  ${s.subtitle}`).join('\n');
  subtitleEl.innerHTML = `<article class="subtitle-card"><h3>후편집 자막 스크립트</h3><p>권장 방식: 생성형 영상에는 글자를 넣지 않고, 완성된 영상 위에 정확한 한글 자막을 별도로 합성하세요.</p><div class="codeish"></div><div class="copy-row"><button id="copySubtitle" class="copy-btn">자막 복사</button></div></article>
  <article class="subtitle-card"><h3>일관성 체크</h3><p>✓ 기준 이미지와 얼굴 동일<br>✓ 의상/헤어/연령 유지<br>✓ 장면 사이 인종·성별·외형 변경 금지<br>✓ 영상 내부 한글 자동 생성 금지<br>✓ 30초 영상은 10초씩 개별 생성 후 편집 연결</p></article>`;
  subtitleEl.querySelector('.codeish').textContent = lines;
  $('copySubtitle').addEventListener('click', () => copyText(lines));
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

function generate() {
  const data = getFormData();
  const scenes = state.duration === 30 ? build30s(data) : build10s(data);
  renderScenes(scenes);
  renderFlow(scenes, data);
  renderSubtitle(scenes, data);
}

document.querySelectorAll('.duration-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.duration-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    state.duration = Number(btn.dataset.duration);
  });
});

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    tab.classList.add('active');
    $(tab.dataset.tab).classList.add('active');
  });
});

$('presetBtn').addEventListener('click', () => {
  $('brand').value = 'Algo';
  $('problem').value = '필요한 정보와 사람을 찾기 어렵고, 좋은 기회를 놓치기 쉽다.';
  $('solution').value = '관심사와 목적에 맞는 정보와 사람을 빠르게 연결하고, 필요한 행동으로 이어지게 한다.';
  $('target').value = '새로운 기회와 연결이 필요한 사용자';
  $('message').value = '연결이 기회를 만든다';
  $('mood').value = '프리미엄 · 세련됨';
  state.duration = 30;
  document.querySelectorAll('.duration-btn').forEach((b) => b.classList.toggle('active', b.dataset.duration === '30'));
  generate();
});

$('generateBtn').addEventListener('click', generate);
emptyState();