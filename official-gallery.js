'use strict';

const $ = selector => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hoverDevice = matchMedia('(hover: hover) and (pointer: fine)');
const storageKey = 'hf-atelier-official-favorites';
const categories = ['转场', '字幕', '镜头运动', '局部强调', '素材展示', '节奏与情绪', '信息提示', '画面质感'];
let effects = [], category = '全部', origin = 'all', query = '', savedOnly = false, selected = null;
let sourceEffects = new Map(), redirects = {};
let favorites = new Set(), hoverEnabled = !reducedMotion.matches;
let active = null, hoverTimer, toastTimer;
const dialog = $('#previewDialog');

const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400);
}
function setStatus(surface, message) { surface.querySelector('.preview-status').textContent = message; }
function setControls(enabled) {
  document.querySelectorAll('.controls button,.controls input,.controls select').forEach(el => { el.disabled = !enabled; });
}
function releasePreview() {
  clearTimeout(hoverTimer);
  hoverTimer = null;
  if (!active) return;
  const previous = active;
  active = null;
  clearTimeout(previous.timeout);
  clearTimeout(previous.loadingHint);
  if (previous.player) {
    previous.player.pause();
    previous.player.removeAttribute('src');
    previous.player.load();
    previous.player.remove();
  }
  previous.surface.classList.remove('is-playing', 'is-loading');
  setStatus(previous.surface, '');
}
function updateControls(player) {
  if (!selected || active?.player !== player) return;
  const duration = Number(player.duration) || selected.duration || 0;
  const current = Number(player.currentTime) || 0;
  $('#scrub').value = duration ? current / duration * 1000 : 0;
  $('#timeLabel').textContent = `${current.toFixed(1)} / ${duration.toFixed(1)}s`;
  $('#detailPlay').textContent = player.paused ? '▶' : 'Ⅱ';
  $('#detailPlay').setAttribute('aria-label', player.paused ? '播放' : '暂停');
}
function mountPreview(effect, surface, mode) {
  releasePreview();
  if (document.hidden) return;
  const player = document.createElement('video');
  const state = {effect, surface, mode, player, timeout: null, loadingHint: null};
  active = state;
  surface.classList.add('is-loading');
  // Keep the poster visible until a decoded frame is ready. Normal local starts
  // should not flash a loading label; slow transfers still get honest feedback.
  state.loadingHint = setTimeout(() => {
    if (active === state) setStatus(surface, '正在缓冲预览…');
  }, 900);
  if (mode === 'detail') { setControls(false); $('#retryPreview').hidden = true; }
  function fail(message) {
    if (active !== state) return;
    releasePreview();
    setStatus(surface, message);
    if (mode === 'detail') { setControls(false); $('#timeLabel').textContent = '未加载'; $('#retryPreview').hidden = false; }
  }
  state.timeout = setTimeout(() => fail('预览加载超时，请重试或查看来源页'), 12000);
  function showFrame() {
    if (active !== state) return;
    clearTimeout(state.timeout);
    clearTimeout(state.loadingHint);
    surface.classList.remove('is-loading');
    surface.classList.add('is-playing');
    setStatus(surface, '');
    if (mode === 'detail') { setControls(true); updateControls(player); }
  }
  player.muted = true;
  player.loop = true;
  player.playsInline = true;
  player.preload = 'auto';
  player.src = effect.videoPreview;
  player.setAttribute('aria-label', `${effect.title}效果预览`);
  function startPlayback() {
    if (active !== state) return;
    if (player.requestVideoFrameCallback) player.requestVideoFrameCallback(showFrame);
    else player.addEventListener('playing', showFrame, {once: true});
    player.play().catch(error => {
      if (active !== state || error.name === 'AbortError') return;
      fail('预览无法播放，请重试或打开来源页');
    });
  }
  player.addEventListener('loadedmetadata', () => {
    if (active !== state) return;
    if (mode === 'hover' && effect.hoverStart) {
      player.addEventListener('seeked', startPlayback, {once: true});
      player.currentTime = Math.min(effect.hoverStart, player.duration);
    } else startPlayback();
  }, {once: true});
  player.addEventListener('loadeddata', () => {
    if (active === state && mode === 'detail') { setControls(true); updateControls(player); }
  });
  player.addEventListener('error', () => fail('预览读取失败，请重试或打开来源页'));
  ['timeupdate', 'play', 'pause', 'seeked'].forEach(event => player.addEventListener(event, () => updateControls(player)));
  surface.querySelector('.preview-mount').replaceChildren(player);
}
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (!entry.isIntersecting && active?.surface === entry.target && active.mode === 'hover') releasePreview();
  }
});
function bindPreview(surface) {
  observer.observe(surface);
  const hoverArea = surface.closest('.card-visual') || surface;
  hoverArea.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !hoverDevice.matches || !hoverEnabled || dialog.open) return;
    // Page load, layout changes and dialog dismissal can put a card under a
    // stationary pointer. Only actual movement should begin a new preview.
    if (active?.surface === surface || hoverTimer) return;
    hoverTimer = setTimeout(() => {
      hoverTimer = null;
      if (!surface.isConnected || dialog.open || !hoverEnabled) return;
      const effect = effects.find(item => item.id === surface.dataset.preview);
      if (effect) mountPreview(effect, surface, 'hover');
    }, 60);
  });
  hoverArea.addEventListener('pointerleave', () => {
    clearTimeout(hoverTimer);
    hoverTimer = null;
    if (active?.surface === surface && active.mode === 'hover') releasePreview();
  });
  surface.addEventListener('click', () => openEffect(surface.dataset.preview));
}
function buildFilters() {
  const visibleCategories = ['全部', ...categories.filter(name => effects.some(effect => effect.category === name))];
  const pool = effects.filter(effect => origin === 'all' || effect.origin === origin);
  $('#filters').innerHTML = visibleCategories.map(name => `<button class="filter${category === name ? ' active' : ''}" aria-pressed="${category === name}" data-category="${escapeHTML(name)}">${escapeHTML(name)}<span class="number">${name === '全部' ? pool.length : pool.filter(effect => effect.category === name).length}</span></button>`).join('');
  $('#filters').querySelectorAll('button').forEach(button => button.onclick = () => { category = button.dataset.category; buildFilters(); renderCards(); });
}
function renderCards() {
  if (active?.mode === 'hover') releasePreview();
  $('#grid').querySelectorAll('[data-preview]').forEach(surface => observer.unobserve(surface));
  const matches = effects.filter(effect => (category === '全部' || effect.category === category)
    && (origin === 'all' || effect.origin === origin)
    && (!savedOnly || favorites.has(effect.id))
    && `${effect.title} ${effect.en} ${effect.id} ${effect.category} ${effect.tags} ${effect.use} ${effect.sourceLabel} ${effect.searchAliases || ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  $('#grid').innerHTML = matches.map(effect => `<article class="card">
    <div class="card-visual"><button class="open-card" data-preview="${effect.id}" aria-label="预览${escapeHTML(effect.title)}">
      <img class="poster" src="${effect.poster}" alt="${escapeHTML(effect.title)}预览封面" width="1920" height="1080" loading="lazy" decoding="async">
      <span class="preview-mount"></span><span class="preview-status" aria-live="polite"></span>
    </button><button class="card-save${favorites.has(effect.id) ? ' saved' : ''}" data-save="${effect.id}" aria-label="${favorites.has(effect.id) ? '取消收藏' : '收藏'}${escapeHTML(effect.title)}" aria-pressed="${favorites.has(effect.id)}">${favorites.has(effect.id) ? '★' : '☆'}</button>
    <div class="card-bottom"><span>↗ 点击放大</span><span>${effect.duration.toFixed(1)}s · ${escapeHTML(effect.previewLabel || (effect.origin === 'official' ? '官方示例' : '作者示例'))}</span></div></div>
    <div class="card-meta"><h3 class="card-title">${escapeHTML(effect.title)}</h3><span class="card-tag">${escapeHTML(effect.category)}</span></div>
    <p class="card-subtitle">${escapeHTML(effect.en)}</p><p class="card-origin${effect.origin !== 'official' ? ' community' : ''}">${escapeHTML(effect.sourceLabel)}<span>${escapeHTML(effect.usageStatus || (effect.origin === 'official' ? '原生模板' : '待适配'))}</span></p></article>`).join('');
  $('#grid').querySelectorAll('[data-preview]').forEach(bindPreview);
  $('#grid').querySelectorAll('[data-save]').forEach(button => button.onclick = () => toggleSave(button.dataset.save));
  $('#grid').querySelectorAll('img').forEach(img => img.addEventListener('error', () => setStatus(img.closest('[data-preview]'), '封面未加载，点击查看效果')));
  $('#resultCount').textContent = `${matches.length} 个效果`;
  $('#empty').hidden = !!matches.length;
  $('#emptyCopy').textContent = savedOnly ? '点击卡片上的星标，把喜欢的效果留在这里。' : '换个关键词，或试试其他分类。';
  updateSaved();
}
function updateSaved() {
  $('#savedCount').textContent = favorites.size;
  if (selected) $('#saveDetail').textContent = favorites.has(redirects[selected.id] || selected.id) ? '★ 已收藏' : '☆ 收藏效果';
}
function toggleSave(id) {
  id = redirects[id] || id;
  favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); }
  catch { toast('浏览器未允许存储，收藏仅在本次打开期间保留'); }
  if (savedOnly) renderCards();
  else {
    const button = $(`[data-save="${id}"]`), saved = favorites.has(id);
    if (button) {
      button.classList.toggle('saved', saved);
      button.textContent = saved ? '★' : '☆';
      button.setAttribute('aria-pressed', saved);
      button.setAttribute('aria-label', `${saved ? '取消收藏' : '收藏'}${effects.find(effect => effect.id === id).title}`);
    }
    updateSaved();
  }
}
function view(saved) {
  savedOnly = saved;
  $('#exploreNav').classList.toggle('active', !saved);
  $('#savedNav').classList.toggle('active', saved);
  $('#libraryTitle').textContent = saved ? '留住喜欢的灵感' : '挑一个，让画面动起来';
  renderCards();
  $('#library').scrollIntoView({behavior: reducedMotion.matches ? 'instant' : 'smooth'});
}
function openEffect(id) {
  const effect = sourceEffects.get(id);
  if (!effect) return;
  releasePreview();
  selected = effect;
  $('#detailTitle').textContent = effect.title;
  $('#detailEnglish').textContent = effect.en;
  $('#detailCategory').textContent = `${effect.category} / ${effect.sourceLabel} / ${effect.compatibility}`;
  $('#detailDesc').textContent = effect.desc;
  $('#detailUse').textContent = effect.use;
  $('#officialLink').href = effect.page;
  $('#officialLink').textContent = effect.origin === 'atelier' ? '模板使用说明 ↗' : effect.origin === 'official' ? '官方效果页 ↗' : '作者效果页 ↗';
  $('#sourceLink').textContent = effect.origin === 'atelier' ? '下载模板包 ↗' : '模板源码 ↗';
  $('#sourceLink').href = effect.source;
  let permalink = $('#effectPermalink');
  if (!permalink) { permalink = document.createElement('a'); permalink.id = 'effectPermalink'; $('#sourceLink').after(permalink); }
  permalink.href = `/effects/${encodeURIComponent(redirects[effect.id] || effect.id)}/`;
  permalink.textContent = '独立说明页 ↗';
  $('#sourceNote').textContent = effect.previewNote;
  const canonical = sourceEffects.get(redirects[id] || id);
  let variants = $('#sourceVariants');
  if (!variants) { variants = document.createElement('details'); variants.id = 'sourceVariants'; $('#sourceNote').after(variants); }
  variants.open = false;
  variants.hidden = !canonical.alternatives?.length;
  variants.innerHTML = canonical.alternatives?.length ? `<summary>同组来源与变体 · ${canonical.alternatives.length + 1}</summary><p>${escapeHTML(canonical.dedupReason)}</p>${[canonical, ...canonical.alternatives].map(item => `<div class="source-variant"><span>${escapeHTML(item.title)}<small>${escapeHTML(item.sourceLabel)}${item.id === canonical.id ? ' · 优先版本' : ''}</small></span><button class="quiet-button" data-variant="${item.id}" ${item.id === id ? 'disabled' : ''}>${item.id === id ? '正在查看' : '查看此版'}</button><a href="${escapeHTML(item.source)}" target="_blank" rel="noopener noreferrer">源码 ↗</a></div>`).join('')}` : '';
  variants.querySelectorAll('[data-variant]').forEach(button => button.onclick = () => openEffect(button.dataset.variant));
  $('#detailStage .poster').src = effect.poster;
  $('#detailStage .poster').alt = `${effect.title}预览封面`;
  $('#speed').value = '1'; $('#scrub').value = '0'; $('#timeLabel').textContent = '加载中';
  updateSaved();
  if (!dialog.open) dialog.showModal(); document.body.classList.add('modal-open');
  mountPreview(effect, $('#detailStage'), 'detail');
}
$('#closeDialog').onclick = () => dialog.close();
dialog.addEventListener('close', () => { releasePreview(); selected = null; document.body.classList.remove('modal-open'); });
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
$('#detailPlay').onclick = () => { const player = active?.player; if (player?.readyState >= 2) { player.paused ? player.play().catch(() => toast('播放失败，请重试')) : player.pause(); updateControls(player); } };
$('#scrub').oninput = event => { const player = active?.player; if (player?.readyState >= 2) { const targetTime = Number(event.target.value) / 1000 * player.duration; player.pause(); player.currentTime = targetTime; updateControls(player); } };
$('#speed').onchange = event => { if (active?.player) active.player.playbackRate = Number(event.target.value); };
$('#replay').onclick = () => { const player = active?.player; if (player?.readyState >= 2) { player.currentTime = 0; player.play().catch(() => toast('播放失败，请重试')); } };
$('#retryPreview').onclick = () => { if (selected) mountPreview(selected, $('#detailStage'), 'detail'); };
$('#saveDetail').onclick = () => { if (selected) toggleSave(selected.id); };
function buildUsageBrief(effect) {
  const source = effect.origin === 'atelier'
    ? `请使用 Atelier 自制 HyperFrames 模板「${effect.title}」。\n${effect.install}\n模板源码：${effect.source}\n说明：${effect.page}\n版本：${effect.provenance.version}\n当前状态：${effect.compatibility}。\n使用 npx hyperframes render <模板目录> --variables-file <参数文件>，不要执行 hyperframes add。示例内容须替换为已确认材料。\n效果：${effect.desc}`
    : effect.origin === 'official'
    ? `请使用 HyperFrames 官方模板「${effect.title}」（${effect.id}）。\n安装：${effect.install}\n官方效果页：${effect.page}\n源码版本：${effect.provenance.commit}\n效果：${effect.desc}`
    : effect.origin === 'glsl'
      ? `请使用 GL Transitions 的「${effect.title}」（${effect.en}）。\n${effect.install}\n源码：${effect.source}\n版本：${effect.provenance.commit}\n许可证：${effect.provenance.license}\n当前状态：${effect.compatibility}。\n预览使用原始 shader 和默认参数。先检查当前项目是否已有 GL Transitions 宿主；若没有，需要接入 WebGL 渲染与可定位的时间控制，再核对效果。不要直接执行 hyperframes add，也不要用 CSS 近似效果冒充原 shader。`
      : effect.origin === 'web'
        ? `请使用 ${effect.sourceLabel} 的「${effect.title}」（${effect.en}）。\n${effect.install}\n源码：${effect.source}\n版本：${effect.provenance.commit}\n许可证：${effect.provenance.license}\n当前状态：${effect.compatibility}。\n这是浏览器 SVG 标注库。接入 HyperFrames 需要定位目标元素并将原生笔画动画绑定到可拖动的时间轴；不要执行 hyperframes add，也不要把它当作 Remotion 组件。`
        : `请使用 ${effect.sourceLabel} 的「${effect.title}」（${effect.en}）。\n${effect.install}\n源码：${effect.source}\n版本：${effect.provenance.commit}\n当前状态：${effect.compatibility}。\n在 Remotion 项目中读取原始组件后接入。若当前项目是 HyperFrames，需要先转换组件和时间控制并核对画面；不要直接执行 hyperframes add。`;
  const usage = {
    '字幕': '请把这个效果应用到当前项目的字幕上，沿用已确认的字幕或旁白原文，优先复用现有字幕时间轴并对齐语音。把模板中的演示文字换成实际字幕，保留原文含义与措辞，不替换视频素材。按原文语言调整分词、换行、字号与安全边距，并预览检查可读性和同步情况。若缺少字幕文本或时间信息，先检查项目已有的字幕、旁白和音频；仍无法确定时，再询问缺失的信息。',
    '转场': '请在当前视频指定的两个相邻镜头之间应用此转场，沿用原镜头素材，按指定时长接入并预览检查衔接。若尚未确定转场位置，请先确认连接哪两个镜头。',
    '镜头运动': '请把这个镜头运动应用到当前项目指定的画面或素材容器，沿用原素材和剪辑时间。根据主体位置设置运动起点、终点、幅度与时长，保持主体在安全区域内，避免露出空边。优先沿用现有分镜意图；若运动目标或时间范围无法从项目确定，再确认缺失的信息。不要因为模板用文字或卡片示范，就把原素材改成标题画面。预览检查运动与时间轴拖动。',
    '局部强调': '请在当前视频要讲解的目标区域上应用此强调效果，沿用原画面，根据目标设置标注位置、尺寸与出现时间。优先跟随旁白提到目标的时刻，不遮住主体和字幕；需要标签时沿用已确认文字。若目标区域不明确，再确认要强调哪里。预览检查目标定位和阅读效果。',
    '素材展示': '请把项目中指定的图片、视频或截图放入此模板的素材槽，保留素材内容与正确宽高比，按已有分镜安排展示顺序和时长。对比效果必须明确前后素材的对应关系；不要将演示占位内容当成用户素材。缺少素材或对应关系时再询问。预览检查裁切、可读性及布局。',
    '节奏与情绪': '请把此效果放在当前项目明确的动作、情绪或节拍节点，使用已有素材，控制强度与持续时间，不改动旁白原文或无关剪辑。若节点尚未确定，结合现有分镜提出具体位置再确认。按模板所需准备主体、静帧或运动容器，并检查效果前后衔接及拖动、导出的一致性。',
    '信息提示': '请用当前项目已确认的数字、步骤或状态填充此提示组件，按讲解顺序控制出现时间。数字的起止值、单位及进度含义必须来自项目资料，不要保留模板的演示数据或编造指标。缺少必要数据时再询问。预览检查数值准确、阅读时间充分且不遮挡字幕。',
    '画面质感': '请将此质感效果用于当前项目指定的画面范围，沿用原素材，按模板能力设置强度、透明度或混合方式，并保持主体与字幕清晰。背景型模板不能直接当透明叠加层使用；先核对其类型。优先沿用项目已有风格与使用范围，无法确定时再确认。预览对比处理前后，检查高光、暗部和导出效果。',
  }[effect.category];
  const cameraNote = effect.id === 'caption-camera-follow'
    ? '\n此模板是整句文字在空间中展开、字幕镜头持续拉远的效果。需要按实际字幕重建文字布局和出现时刻，并同步调整字幕镜头路径与总时长；中文按语义分词。镜头跟随仅作用于字幕层，不改变原视频镜头。'
    : '';
  return `${source}\n${usage}${cameraNote}${effect.usageCaveat ? `\n接入注意：${effect.usageCaveat}` : ''}`;
}
$('#copyBrief').onclick = async () => {
  if (!selected) return;
  const text = buildUsageBrief(selected);
  try { await navigator.clipboard.writeText(text); toast('使用指令已复制'); }
  catch { toast('复制不可用，可打开来源页查看用法'); }
};
$('#exploreNav').onclick = () => view(false);
$('#savedNav').onclick = () => view(true);
$('#search').oninput = event => { query = event.target.value; renderCards(); };
function setOrigin(value) {
  origin = value;
  $('#sourceFilters').querySelectorAll('button').forEach(button => {
    button.classList.toggle('selected', button.dataset.origin === origin);
    button.setAttribute('aria-pressed', button.dataset.origin === origin);
  });
  buildFilters(); renderCards();
}
$('#sourceFilters').querySelectorAll('button').forEach(button => button.onclick = () => setOrigin(button.dataset.origin));
$('#resetFilters').onclick = () => { query = ''; category = '全部'; $('#search').value = ''; setOrigin('all'); view(false); };
function updateHoverToggle() {
  $('#globalPlay').setAttribute('aria-pressed', hoverEnabled);
  $('#globalPlay .label').textContent = hoverEnabled ? '悬停预览' : '仅点击播放';
  $('#globalPlay .play-symbol').textContent = hoverEnabled ? '▶' : 'Ⅱ';
}
$('#globalPlay').onclick = () => { hoverEnabled = !hoverEnabled; if (active?.mode === 'hover') releasePreview(); updateHoverToggle(); };
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  releasePreview();
  if (selected) { setControls(false); setStatus($('#detailStage'), '预览已暂停'); $('#retryPreview').hidden = false; }
});
window.addEventListener('pagehide', releasePreview);
document.addEventListener('keydown', event => {
  if (event.key === '/' && !dialog.open && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); }
});
async function init() {
  updateHoverToggle();
  try {
    const response = await fetch('data/gallery-effects.json');
    if (!response.ok) throw new Error('目录读取失败');
    const data = await response.json();
    if (!Array.isArray(data.effects)) throw new Error('目录格式无效');
    effects = data.effects; redirects = data.redirects || {};
    sourceEffects = new Map(effects.flatMap(effect => [effect, ...(effect.alternatives || [])]).map(effect => [effect.id, effect]));
    if (!effects.length || effects.some(effect => !effect.videoPreview || !effect.poster || !categories.includes(effect.category))) throw new Error('目录不完整');
    try { const saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(saved)) { favorites = new Set(saved.map(id => redirects[id] || id).filter(id => effects.some(effect => effect.id === id))); localStorage.setItem(storageKey, JSON.stringify([...favorites])); } } catch {}
    buildFilters(); renderCards(); bindPreview($('#heroOpen'));
    $('#collectionCount').textContent = `${effects.length} 个效果 · 已合并 ${data.mergedCount || 0} 个同组条目`;
    const requested = new URLSearchParams(location.search).get('effect');
    if (requested && sourceEffects.has(requested)) openEffect(requested);
  } catch {
    $('#resultCount').textContent = '目录暂未加载';
    $('#grid').innerHTML = '<p class="catalog-loading">效果目录加载失败，请刷新页面重试。</p>';
  } finally { $('#grid').setAttribute('aria-busy', 'false'); }
}
init();
