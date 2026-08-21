const state = { duration: 10, scenes: [], lastData: null, imageDataUrl: null };
const STORAGE_KEY = 'motion-ad-studio-project-v1';

const $ = (id) => document.getElementById(id);
const storyboardEl = $('storyboard');
const flowEl = $('flow');
const subtitleEl = $('subtitle');
const checklistEl = $('checklist');

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function emptyState() {
  storyboardEl.innerHTML = `<div class="empty-state"><div><strong>광고 정보를 입력해 주세요</strong><p>왼쪽 기획 정보를 바탕으로 10초 또는 30초 스토리보드를 자동 구성합니다.</p></div></div>`;
  flowEl.innerHTML = `<div class="empty-state"><div><strong>Flow 프롬프트 대기 중</strong><p>생성 버튼을 누르면 장면별 짧은 영문 프롬프트가 만들어집니다.</p></div></div>`;
  subtitleEl.innerHTML = `<div class="empty-state"><div><strong>후편집 자막 대기 중</strong><p>한글 자막은 영상 생성 후 편집 단계에서 넣는 것을 권장합니다.</p></div></div>`;
  checklistEl.innerHTML = `<div class="empty-state"><div><strong>생성 체크리스트</strong><p>결과를 생성하면 캐릭터 일관성과 자막 오류 방지를 위한 체크 항목이 표시됩니다.</p></div></div>`;
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
    promptDensity: $('promptDensity').value,
    characterLock: $('characterLock').checked,
    koreanCast: $('koreanCast').checked,
    subtitleMode: $('subtitleMode').value,
    imageName: $('referenceImage').files?.[0]?.name || $('imageName').textContent || ''
  };
}

function densityText(mode) {
  if (mode === 'short') return 'Simple shot design, one clear action, stable composition. ';
  if (mode === 'cinematic') return 'Premium cinematic lighting, deliberate lens language, layered foreground and background, polished commercial pacing. ';
  return 'Cinematic but readable shot design, clear subject action, polished commercial pacing. ';
}

function promptPrefix(data) {
  const identity = data.characterLock
    ? 'Use the uploaded reference image as the fixed character identity. Keep the exact same face, hairstyle, outfit, age, ethnicity, body proportions, and overall appearance in every shot. Do not redesign, replace, or morph the character. '
    : '';
  const cast = data.koreanCast
    ? 'When additional human characters are needed, use contemporary Korean people in a natural Korean setting unless the reference image indicates otherwise. '
    : '';
  return `${identity}${cast}Cinematic 16:9 commercial. Mood: ${data.mood}. ${densityText(data.promptDensity)}Realistic human motion, clean composition, no embedded Korean text, no accidental letters, no invented logos.`;
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
      motion: '빠른 푸시인 → 짧은 정지 → 문제 지점으로 시선 집중',
      subtitle: subtitleFor(data.problem, data.subtitleMode),
      prompt: `${prefix} Open on the fixed main character experiencing this clear problem: ${data.problem}. Fast push-in, strong visual hook, natural expression, one readable action.`
    },
    {
      time: '2–5초', title: 'ACTION · 해결책 등장',
      visual: `${data.brand}의 핵심 기능이 행동 중심으로 등장한다.`,
      motion: '문제 장면 → 서비스 사용 장면 매치 컷 → 빠른 기능 시연',
      subtitle: subtitleFor(data.solution, data.subtitleMode),
      prompt: `${prefix} Match cut from the problem into the ${data.brand} solution. Show the core function through physical visual action: ${data.solution}. Keep the same main character and wardrobe. Do not render readable Korean text.`
    },
    {
      time: '5–8초', title: 'TRANSFORMATION · 변화',
      visual: '같은 인물의 표정과 상황이 긍정적으로 바뀌고 연결이 생긴다.',
      motion: '비포→애프터 리듬 → 부드러운 트래킹 → 에너지 상승',
      subtitle: subtitleFor(data.message, data.subtitleMode),
      prompt: `${prefix} Show a fast before-and-after transformation with the exact same character. Confidence rises, the environment feels more open and connected, smooth tracking shot, uplifting energy.`
    },
    {
      time: '8–10초', title: 'BRAND · 엔딩',
      visual: `${data.brand} 중심의 깨끗한 히어로 엔딩.`,
      motion: '카메라 안정 → 마지막 프레임 1초 홀드',
      subtitle: subtitleFor(`${data.brand} · ${data.message}`, data.subtitleMode),
      prompt: `${prefix} Final hero shot for ${data.brand}. Same main character, confident natural pose, premium clean background, simple brand-centered composition, hold the final frame, no generated Korean typography.`
    }
  ];
}

function build30s(data) {
  const prefix = promptPrefix(data);
  return [
    {
      time: '1편 · 0–10초', title: '문제와 공감',
      visual: `${data.target}이(가) 겪는 문제를 실제 상황처럼 보여주고 감정적으로 공감시킨다.`,
      motion: '관찰형 시작 → 클로즈업 → 문제를 상징하는 디테일 → 여운',
      subtitle: subtitleFor(data.problem, data.subtitleMode),
      prompt: `${prefix} 10-second Part 1. Focus only on the problem and emotional empathy. Follow the fixed main character struggling with: ${data.problem}. Natural acting, cinematic close-ups, escalating tension, end on a clear need for change.`
    },
    {
      time: '2편 · 10–20초', title: '해결책과 기능',
      visual: `${data.brand}가 등장해 ${data.solution}의 핵심 기능을 행동으로 보여준다.`,
      motion: '서비스 등장 → 핵심 기능 → 즉각적인 변화 → 다음 장면 연결',
      subtitle: subtitleFor(data.solution, data.subtitleMode),
      prompt: `${prefix} 10-second Part 2. Continue with the exact same character, outfit, age, setting logic, and visual style from Part 1. Introduce ${data.brand} and demonstrate: ${data.solution}. Fast readable sequence, clear cause and effect, no generated Korean text.`
    },
    {
      time: '3편 · 20–30초', title: '가치·사람 연결·브랜드',
      visual: '문제가 해결된 뒤 사람과 사람이 연결되고 긍정적인 변화가 확장되며 브랜드로 마무리된다.',
      motion: '인물 연결 → 공간 확장 → 감정적 클라이맥스 → 브랜드 히어로 컷',
      subtitle: subtitleFor(`${data.message} — ${data.brand}`, data.subtitleMode),
      prompt: `${prefix} 10-second Part 3. Continue seamlessly with the exact same main character and visual world. Show the human value after the solution: people connect, confidence grows, opportunities open. End with a premium hero frame for ${data.brand}. Emotional payoff, no generated Korean typography.`
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
    node.querySelector('.copy-btn').addEventListener('click', () => {
      copyText(sceneToText(scene));
      showToast('장면 내용을 복사했습니다.');
    });
    storyboardEl.appendChild(node);
  });
}

function renderFlow(scenes) {
  flowEl.innerHTML = '';
  scenes.forEach((scene, idx) => {
    const card = document.createElement('article');
    card.className = 'flow-card';
    card.innerHTML = `<h3>${state.duration === 30 ? `${idx + 1}편` : `Scene ${idx + 1}`} · ${scene.time}</h3><div class="codeish"></div><div class="copy-row"><button class="copy-btn">프롬프트 복사</button></div>`;
    card.querySelector('.codeish').textContent = scene.prompt;
    card.querySelector('.copy-btn').addEventListener('click', () => {
      copyText(scene.prompt);
      showToast('프롬프트를 복사했습니다.');
    });
    flowEl.appendChild(card);
  });

  const all = document.createElement('article');
  all.className = 'flow-card';
  const combined = scenes.map((s, i) => `${i + 1}. ${s.prompt}`).join('\n\n');
  const master = state.duration === 30
    ? `Create a 30-second commercial as three separate 10-second clips. Treat the uploaded reference image as the fixed identity anchor. Maintain identical face, wardrobe, age, ethnicity, body proportions, visual style, lighting logic, and brand world across all three clips. Generate each 10-second part separately, then edit them together.\n\n${combined}`
    : combined;
  all.innerHTML = `<h3>${state.duration}초 마스터 프롬프트</h3><div class="codeish"></div><div class="copy-row"><button class="copy-btn">전체 복사</button></div>`;
  all.querySelector('.codeish').textContent = master;
  all.querySelector('.copy-btn').addEventListener('click', () => {
    copyText(master);
    showToast('마스터 프롬프트를 복사했습니다.');
  });
  flowEl.appendChild(all);
}

function renderSubtitle(scenes) {
  const lines = scenes.map((s) => `${s.time}  ${s.subtitle}`).join('\n');
  subtitleEl.innerHTML = `<article class="subtitle-card"><h3>후편집 자막 스크립트</h3><p>권장 방식: 생성형 영상에는 글자를 넣지 않고, 완성된 영상 위에 정확한 한글 자막을 별도로 합성하세요.</p><div class="codeish"></div><div class="copy-row"><button id="copySubtitle" class="copy-btn">자막 복사</button></div></article>
  <article class="subtitle-card"><h3>편집 연결 원칙</h3><p>10초 영상은 마지막 프레임을 0.5~1초 안정적으로 홀드하세요. 30초 영상은 1편의 마지막 동작과 2편의 첫 동작, 2편의 마지막 시선과 3편의 첫 시선을 맞추면 연결감이 좋아집니다.</p></article>`;
  subtitleEl.querySelector('.codeish').textContent = lines;
  $('copySubtitle').addEventListener('click', () => {
    copyText(lines);
    showToast('자막을 복사했습니다.');
  });
}

function renderChecklist(data) {
  checklistEl.innerHTML = `<article class="check-card"><h3>생성 전 체크</h3><ul class="check-list">
    <li><strong>기준 이미지:</strong> ${data.imageName ? `선택됨 · ${escapeHtml(data.imageName)}` : '아직 선택하지 않음'}</li>
    <li><strong>캐릭터 잠금:</strong> ${data.characterLock ? 'ON · 얼굴/의상/연령/인종 유지' : 'OFF'}</li>
    <li><strong>인물 설정:</strong> ${data.koreanCast ? '추가 인물은 한국인 우선' : '별도 제한 없음'}</li>
    <li><strong>한글 텍스트:</strong> 영상 안에 직접 생성하지 않기</li>
    <li><strong>30초 생성법:</strong> ${state.duration === 30 ? '1편·2편·3편을 각각 10초로 생성 후 편집 연결' : '해당 없음'}</li>
  </ul></article>
  <article class="check-card"><h3>결과가 흔들릴 때</h3><ul class="check-list">
    <li>캐릭터가 바뀌면 기준 이미지를 다시 첨부하고 한 편씩 생성합니다.</li>
    <li>장면이 너무 많이 생기면 프롬프트 밀도를 ‘짧고 안정적’으로 낮춥니다.</li>
    <li>앱 화면의 한글은 생성하지 말고 후편집 이미지나 실제 UI 캡처로 덮어씁니다.</li>
    <li>외국인이 등장하면 ‘한국인 캐릭터 우선’을 켜고 기준 이미지가 있다면 기준 이미지를 최우선으로 사용합니다.</li>
  </ul></article>`;
}

function sceneToText(scene) {
  return `${scene.time}\n${scene.title}\n화면: ${scene.visual}\n카메라/모션: ${scene.motion}\n자막: ${scene.subtitle}\n프롬프트: ${scene.prompt}`;
}

function projectToText() {
  if (!state.scenes.length || !state.lastData) return '';
  const data = state.lastData;
  const header = `MOTION AD STUDIO\n브랜드: ${data.brand}\n목적: ${data.purpose}\n길이: ${state.duration}초\n분위기: ${data.mood}\n핵심 메시지: ${data.message}`;
  const scenes = state.scenes.map((scene, i) => `\n\n[${i + 1}] ${sceneToText(scene)}`).join('');
  return `${header}${scenes}`;
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

function escapeHtml(text) {
  return String(text).replace(/[&<>'"]/g, (ch) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
}

function generate() {
  const data = getFormData();
  const scenes = state.duration === 30 ? build30s(data) : build10s(data);
  state.lastData = data;
  state.scenes = scenes;
  renderScenes(scenes);
  renderFlow(scenes);
  renderSubtitle(scenes);
  renderChecklist(data);
  $('outputTitle').textContent = data.brand;
  $('outputMeta').textContent = `${data.purpose} · ${state.duration}초 · ${scenes.length}개 장면`;
  $('copyAllBtn').disabled = false;
  $('downloadBtn').disabled = false;
  showToast('스토리보드와 프롬프트를 생성했습니다.');
}

function serializeProject() {
  return {
    duration: state.duration,
    form: getFormData(),
    savedAt: new Date().toISOString()
  };
}

function saveProject() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeProject()));
  showToast('이 브라우저에 프로젝트를 저장했습니다.');
}

function applyProject(project) {
  if (!project?.form) return;
  const data = project.form;
  ['purpose','brand','problem','solution','target','message','mood','promptDensity','subtitleMode'].forEach((id) => {
    if ($(id) && data[id] !== undefined) $(id).value = data[id];
  });
  $('characterLock').checked = data.characterLock !== false;
  $('koreanCast').checked = data.koreanCast !== false;
  state.duration = Number(project.duration) === 30 ? 30 : 10;
  document.querySelectorAll('.duration-btn').forEach((b) => b.classList.toggle('active', Number(b.dataset.duration) === state.duration));
  generate();
}

function loadProject() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    showToast('저장된 프로젝트가 없습니다.');
    return;
  }
  try {
    applyProject(JSON.parse(raw));
    showToast('저장된 프로젝트를 불러왔습니다.');
  } catch {
    showToast('저장본을 읽지 못했습니다.');
  }
}

function downloadText() {
  const text = projectToText();
  if (!text) return;
  const safeBrand = (state.lastData.brand || 'motion-ad').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'motion-ad';
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${safeBrand}-motion-ad-${state.duration}s.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast('TXT 파일을 만들었습니다.');
}

function clearReferenceImage() {
  $('referenceImage').value = '';
  state.imageDataUrl = null;
  $('imagePreview').removeAttribute('src');
  $('imageName').textContent = '';
  $('imagePreviewWrap').classList.add('hidden');
  $('uploadPlaceholder').classList.remove('hidden');
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

$('referenceImage').addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return clearReferenceImage();
  if (!file.type.startsWith('image/')) {
    showToast('이미지 파일만 선택해 주세요.');
    return clearReferenceImage();
  }
  const reader = new FileReader();
  reader.onload = () => {
    state.imageDataUrl = reader.result;
    $('imagePreview').src = reader.result;
    $('imageName').textContent = file.name;
    $('uploadPlaceholder').classList.add('hidden');
    $('imagePreviewWrap').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

$('removeImageBtn').addEventListener('click', clearReferenceImage);

$('presetBtn').addEventListener('click', () => {
  $('brand').value = 'Algo';
  $('problem').value = '필요한 정보와 사람을 찾기 어렵고, 좋은 기회를 놓치기 쉽다.';
  $('solution').value = '관심사와 목적에 맞는 정보와 사람을 빠르게 연결하고, 필요한 행동으로 이어지게 한다.';
  $('target').value = '새로운 기회와 연결이 필요한 사용자';
  $('message').value = '연결이 기회를 만든다';
  $('mood').value = '프리미엄 · 세련됨';
  $('promptDensity').value = 'short';
  $('koreanCast').checked = true;
  state.duration = 30;
  document.querySelectorAll('.duration-btn').forEach((b) => b.classList.toggle('active', b.dataset.duration === '30'));
  generate();
});

$('generateBtn').addEventListener('click', generate);
$('saveBtn').addEventListener('click', saveProject);
$('loadBtn').addEventListener('click', loadProject);
$('copyAllBtn').addEventListener('click', () => {
  copyText(projectToText());
  showToast('전체 결과를 복사했습니다.');
});
$('downloadBtn').addEventListener('click', downloadText);

emptyState();