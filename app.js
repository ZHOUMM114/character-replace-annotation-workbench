/* ============================================================
   角色替换 & 跟拍应用 · 质量标注工作台
   8 维度评分系统 + 高质量快筛
   ============================================================ */

// ---------- 数据模型：8 维度定义 ----------
const DIMENSIONS = [
  { id: 1, name: "角色替换", short: "角色替换", desc: "替换后人物与目标 ID 的一致性，包括五官、脸型、妆容、发型、衰老、饰品等", scoring: "category", groups: [
    { name: "五官不一致", options: ["眉毛轻微差异","眼睛轻微差异","鼻子轻微差异","嘴轻微差异","耳朵轻微差异","眉毛明显差异","眼睛明显差异","鼻子明显差异","嘴明显差异","耳朵明显差异","眉毛不像","眼睛不像","鼻子不像","嘴不像","耳朵不像"] },
    { name: "脸型不一致", options: ["脸型轻微变长","脸型轻微变宽","脸型整体形状轻微变动","脸型明显变长","脸型明显变宽","脸型整体形状明显变动"] },
    { name: "妆容不一致", options: ["妆容轻微变淡","妆容轻微变浓","妆容明显变淡","妆容明显变浓"] },
    { name: "发型不一致", options: ["颜色变化","风格变化","长短变化","与原始视频发型一致"] },
    { name: "衰老程度不一致", options: ["轻微年轻","轻微衰老","明显年轻","明显衰老"] },
    { name: "饰品不一致", options: ["项链变化","项链消失","耳饰变化","耳饰消失","眼镜变化","眼镜消失","手部饰品变化","手部饰品消失"] },
    { name: "ID替换失败", options: ["人物未变化","生成未知人物"] }
  ]},
  { id: 2, name: "肤色一致性", short: "肤色", desc: "替换后肤色与目标 ID 的一致性", scoring: "category", groups: [
    { name: "肤色一致性", options: ["肤色轻微偏白","肤色轻微偏黑","肤色轻微不均","肤色明显偏白","肤色明显偏黑","肤色明显不均","族裔变化","肤色严重不符"] }
  ]},
  { id: 3, name: "衣着一致性", short: "衣着", desc: "替换后服装与目标 ID / 输入视频的一致性（高质量要求只能为 5 分）", scoring: "category", groups: [
    { name: "衣着一致性", options: ["替换细节差异","服装替换短暂不稳定","服装替换明显混合","服装始终未完全替换","与 User ID 一致","与输入视频一致"] }
  ]},
  { id: 4, name: "背景保持", short: "背景", desc: "背景元素、画幅、空间结构的保持程度", scoring: "category", groups: [
    { name: "画幅不一致", options: ["画幅轻微变化","画幅明显变化","背景空间结构轻微变化","背景空间结构明显变化"] },
    { name: "背景元素轻微不一致", options: ["窗户轻微变化","颜色轻微变化","桌面物品轻微变化","墙面轻微变化","光线轻微变化","背景可见范围增加了一点","背景可见范围减少了一点"] },
    { name: "背景元素明显不一致", options: ["窗户明显变化","颜色明显变化","桌面物品明显变化","墙面明显变化","光线明显变化","背景可见范围明显增加","背景可见范围明显减少"] },
    { name: "背景元素完全改变", options: ["背景基本未保持","背景丢失","完全替换原视频背景"] }
  ]},
  { id: 5, name: "内容、动作保持", short: "动作", desc: "头部、五官、情绪、肢体动作等是否与原视频保持一致", scoring: "category", groups: [
    { name: "头部动作没保持", options: ["多余点头","多余转头","多余摇头","没有点头","没有转头","没有摇头","头朝向与原视频相反"] },
    { name: "五官动作没保持", options: ["眉毛轻微差异","眼睛轻微差异","鼻子轻微差异","口型轻微差异","眉毛明显差异","眼睛明显差异","鼻子明显差异","口型明显差异"] },
    { name: "情绪没保持", options: ["情绪轻微差异","情绪完全不同"] },
    { name: "整体动作没保持", options: ["反方向动作"] },
    { name: "手臂动作没保持", options: ["左手臂动作轻微差异","右手臂动作轻微差异","左手臂动作明显差异","右手臂动作明显差异"] },
    { name: "手部动作没保持", options: ["左手动作轻微差异","右手动作轻微差异","左手动作明显差异","右手动作明显差异"] },
    { name: "腿部动作没保持", options: ["左腿动作轻微差异","右腿动作轻微差异","左腿动作明显差异","右腿动作明显差异"] },
    { name: "人物说错话", options: ["主角说了配角的话","配角说了主角的话","主角没说话","说了其他内容"] },
    { name: "核心动作看不到", options: ["角色被遮挡","角色没动"] }
  ]},
  { id: 6, name: "台词保持", short: "台词", desc: "台词内容的准确性（1-5 分）", scoring: "score15", scoreLevels: {
    5: ["空（无问题）"],
    4: ["有轻微漏字","轻微发音模糊","尾音被吃掉"],
    3: ["口齿不清","明显发音模糊","尾音被吃掉","明显漏字","语气词变化，但语义基本一致"],
    2: ["口齿不清","乱讲台词","明显发音模糊","语气词明显变化"],
    1: ["旁白被人物讲出","台词内容严重变化","分不清谁在说话","语气大变"]
  }},
  { id: 7, name: "声音质量", short: "声音", desc: "AI 感、响度、节奏、音色、背景音等音频质量", scoring: "category", groups: [
    { name: "AI感", options: ["存在轻微AI感","存在明显AI感","AI感重"] },
    { name: "响度", options: ["整体响度大","整体响度小","少量轻重音","大量轻重音"] },
    { name: "节奏", options: ["轻微节奏不一致，不影响分辨音频内容","明显节奏不一致，无法分辨音频内容"] },
    { name: "人物说话的声音", options: ["音色轻微变化，但是听的出是AuxID","音色明显不像","轻微机械音","明显机械音","男女声不符","原声残留","炸麦","音频存在失真"] },
    { name: "背景音", options: ["轻微杂音，不影响分辨音频内容","明显杂音，难以分辨音频内容"] }
  ]},
  { id: 8, name: "口唇同步", short: "口唇", desc: "口型与台词的同步程度（1-5 分）", scoring: "score15", scoreLevels: {
    5: ["无问题"],
    4: ["口型动作轻微错误，但不影响后续的同步","开口时间轻微错位，只有1-2个单词提前/延后开口"],
    3: ["口型短时间内错误，但人物能在台词播放期间保持开口","一句话中有将近一半的内容提前/延后作出相应口型动作","口型动作不正确，有明显的音画不同步感"],
    2: ["口型长时间错误，与台词内容基本完全错位","部分台词播放期间人物没有开口"],
    1: ["音轨放错了"]
  }}
];

const EXCLUSIONS = [
  { id: "aspect", label: "画幅比与原片不一致（变宽/变窄/变长/变矮）" },
  { id: "loop", label: "视频内容循环重复" },
  { id: "clarity", label: "生成视频清晰度低 / 磨皮感重" },
  { id: "aiheavy", label: "整体 AI 感过重" },
  { id: "shake", label: "镜头抖动严重" },
  { id: "refid", label: "User ID 参考图质量问题（闭眼/角度大/色调暗/表情抽象）" },
  { id: "similarity", label: "生成人物与参考图相似度低" },
  { id: "distortion", label: "音频失真 / 机械音重" }
];

const QUICK_PASS_SCORES = [4, 5];

let state = { mode: "quick", currentTaskId: null, tasks: loadTasks(), quick: { exclusions: {}, dimScores: {}, notes: "" }, full: {} };

function loadTasks() { try { return JSON.parse(localStorage.getItem("anno_tasks") || "[]"); } catch { return []; } }
function saveTasks() { localStorage.setItem("anno_tasks", JSON.stringify(state.tasks)); }

document.addEventListener("DOMContentLoaded", () => { renderQuickMode(); renderFullMode(); renderTaskList(); updateStats(); bindEvents(); bindVideo(); });

function bindEvents() {
  document.getElementById("modeQuick").addEventListener("click", () => switchMode("quick"));
  document.getElementById("modeFull").addEventListener("click", () => switchMode("full"));
  document.getElementById("btnRef").addEventListener("click", openRef);
  document.getElementById("btnNewTask").addEventListener("click", newTask);
  document.getElementById("btnExportJSON").addEventListener("click", exportJSON);
  document.getElementById("btnExportCSV").addEventListener("click", exportCSV);
  document.getElementById("btnClearAll").addEventListener("click", clearAll);
  document.getElementById("btnQuickPass").addEventListener("click", () => quickSave("pass"));
  document.getElementById("btnQuickSkip").addEventListener("click", () => quickSave("skip"));
  document.getElementById("btnFullSave").addEventListener("click", fullSave);
  document.getElementById("btnFullReset").addEventListener("click", resetFull);
  document.getElementById("quickNotes").addEventListener("input", e => { state.quick.notes = e.target.value; });
  document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeRef));
}

function switchMode(m) {
  state.mode = m;
  document.getElementById("modeQuick").classList.toggle("active", m === "quick");
  document.getElementById("modeFull").classList.toggle("active", m === "full");
  document.getElementById("quickMode").classList.toggle("hidden", m !== "quick");
  document.getElementById("fullMode").classList.toggle("hidden", m !== "full");
}

function renderQuickMode() {
  const grid = document.getElementById("exclusionGrid");
  grid.innerHTML = EXCLUSIONS.map(e => `<label class="chk" data-id="${e.id}"><input type="checkbox"><span>${e.label}</span></label>`).join("");
  grid.querySelectorAll(".chk").forEach(el => {
    el.addEventListener("click", () => {
      const cb = el.querySelector("input"); cb.checked = !cb.checked;
      el.classList.toggle("checked", cb.checked);
      state.quick.exclusions[el.dataset.id] = cb.checked;
    });
  });
  const dimContainer = document.getElementById("dimQuick");
  dimContainer.innerHTML = DIMENSIONS.map(d => `<div class="dim-row" data-dim="${d.id}"><span class="dname">${d.id}. ${d.name}</span><div class="score-btns">${[1,2,3,4,5].map(s => `<button class="score-btn ${s<4?'low':''}" data-score="${s}">${s}</button>`).join("")}</div></div>`).join("");
  dimContainer.querySelectorAll(".dim-row").forEach(row => {
    const dimId = +row.dataset.dim;
    row.querySelectorAll(".score-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("low")) return;
        row.querySelectorAll(".score-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.quick.dimScores[dimId] = +btn.dataset.score;
      });
    });
  });
}

function quickSave(result) {
  const taskId = document.getElementById("taskId").value.trim() || ("task_" + Date.now());
  const hasExclusion = Object.values(state.quick.exclusions).some(Boolean);
  const allScored = DIMENSIONS.every(d => state.quick.dimScores[d.id] !== undefined);
  const allHigh = DIMENSIONS.every(d => QUICK_PASS_SCORES.includes(state.quick.dimScores[d.id]));
  if (result === "pass") {
    if (hasExclusion) { toast("存在排除项，不能判定为高质量", "error"); return; }
    if (!allScored) { toast("请为所有维度打分", "error"); return; }
    if (!allHigh) { toast("存在低于 4 分的维度，不能判定为高质量", "error"); return; }
  }
  const task = { id: taskId, result, mode: "quick", scores: { ...state.quick.dimScores }, exclusions: { ...state.quick.exclusions }, notes: state.quick.notes, createdAt: new Date().toISOString(), videoMeta: currentVideoMeta() };
  upsertTask(task);
  toast(result === "pass" ? "✅ 已保存为高质量" : "⏭ 已过滤", "success");
  resetQuick();
}

function resetQuick() {
  state.quick = { exclusions: {}, dimScores: {}, notes: "" };
  document.getElementById("quickNotes").value = "";
  document.querySelectorAll("#exclusionGrid .chk").forEach(el => { el.classList.remove("checked"); el.querySelector("input").checked = false; });
  document.querySelectorAll(".dim-row .score-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("taskId").value = "";
}

function renderFullMode() {
  const container = document.getElementById("fullDims");
  container.innerHTML = DIMENSIONS.map(d => {
    let body = "";
    if (d.scoring === "category") {
      body = d.groups.map(g => `<div class="sub-group"><h4>${g.name}</h4><div class="option-row">${g.options.map(o => `<span class="opt-chip" data-dim="${d.id}" data-group="${g.name}" data-opt="${o}">${o}</span>`).join("")}</div></div>`).join("");
    } else if (d.scoring === "score15") {
      body = `<div class="dim-score"><label>评分：</label><div class="score-btns">${[1,2,3,4,5].map(s => `<button class="score-btn" data-dim="${d.id}" data-score="${s}">${s}</button>`).join("")}</div></div>` +
        Object.entries(d.scoreLevels).map(([score, opts]) => `<div class="sub-group" style="margin-top:10px"><h4>${score} 分对应问题</h4><div class="option-row">${opts.map(o => `<span class="opt-chip" data-dim="${d.id}" data-score-level="${score}" data-opt="${o}">${o}</span>`).join("")}</div></div>`).join("");
    }
    return `<div class="dim-card" data-dim="${d.id}"><h3><span class="idx">${d.id}</span>${d.name}</h3><p class="desc">${d.desc}</p>${body}<div class="sub-note"><input type="text" placeholder="备注（具体变更说明）" data-dim-note="${d.id}"></div></div>`;
  }).join("");
  container.querySelectorAll(".opt-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("selected");
      const dimId = +chip.dataset.dim;
      ensureFullState(dimId);
      const key = chip.dataset.opt;
      if (chip.classList.contains("selected")) state.full[dimId].options[key] = true; else delete state.full[dimId].options[key];
    });
  });
  container.querySelectorAll(".dim-score .score-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const dimId = +btn.dataset.dim;
      btn.parentElement.querySelectorAll(".score-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      ensureFullState(dimId);
      state.full[dimId].score = +btn.dataset.score;
    });
  });
  container.querySelectorAll("[data-dim-note]").forEach(inp => {
    inp.addEventListener("input", e => { const dimId = +e.target.dataset.dimNote; ensureFullState(dimId); state.full[dimId].note = e.target.value; });
  });
}

function ensureFullState(dimId) { if (!state.full[dimId]) state.full[dimId] = { options: {}, score: null, note: "" }; }

function fullSave() {
  const taskId = document.getElementById("taskId").value.trim() || ("task_" + Date.now());
  const dims = {};
  for (const d of DIMENSIONS) {
    const fd = state.full[d.id];
    if (fd) dims[d.id] = { name: d.name, score: fd.score, options: Object.keys(fd.options), note: fd.note };
  }
  const task = { id: taskId, result: "annotated", mode: "full", dimensions: dims, notes: document.getElementById("quickNotes").value, createdAt: new Date().toISOString(), videoMeta: currentVideoMeta() };
  upsertTask(task);
  toast("💾 标注已保存", "success");
}

function resetFull() {
  state.full = {};
  document.querySelectorAll(".opt-chip").forEach(c => c.classList.remove("selected"));
  document.querySelectorAll(".dim-score .score-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll("[data-dim-note]").forEach(i => i.value = "");
}

function upsertTask(task) {
  const idx = state.tasks.findIndex(t => t.id === task.id);
  if (idx >= 0) state.tasks[idx] = task; else state.tasks.push(task);
  state.currentTaskId = task.id;
  saveTasks(); renderTaskList(); updateStats();
}

function renderTaskList() {
  const list = document.getElementById("taskList");
  if (state.tasks.length === 0) { list.innerHTML = '<div style="text-align:center;color:var(--text-dim);font-size:12px;padding:16px">暂无标注任务</div>'; return; }
  list.innerHTML = state.tasks.slice().reverse().map(t => {
    const badge = t.result === "pass" ? '<span class="badge pass">高质量</span>' : t.result === "skip" ? '<span class="badge skip">已过滤</span>' : '<span class="badge draft">已标注</span>';
    return `<div class="task-item ${t.id === state.currentTaskId ? 'active' : ''}" data-id="${t.id}">${badge}<span class="tname" title="${t.id}">${t.id}</span><span class="del" data-del="${t.id}">✕</span></div>`;
  }).join("");
  list.querySelectorAll(".task-item").forEach(el => {
    el.addEventListener("click", e => { if (e.target.dataset.del) { deleteTask(e.target.dataset.del); return; } loadTask(el.dataset.id); });
  });
}

function loadTask(id) { const t = state.tasks.find(x => x.id === id); if (!t) return; state.currentTaskId = id; document.getElementById("taskId").value = id; renderTaskList(); toast(`已加载任务：${id}`, "success"); }
function deleteTask(id) { state.tasks = state.tasks.filter(t => t.id !== id); saveTasks(); renderTaskList(); updateStats(); }
function newTask() { state.currentTaskId = null; document.getElementById("taskId").value = ""; if (state.mode === "quick") resetQuick(); else resetFull(); renderTaskList(); toast("已新建标注", "success"); }
function updateStats() {
  document.getElementById("statTotal").textContent = state.tasks.length;
  document.getElementById("statDone").textContent = state.tasks.filter(t => t.result !== "draft").length;
  document.getElementById("statPass").textContent = state.tasks.filter(t => t.result === "pass").length;
  document.getElementById("statSkip").textContent = state.tasks.filter(t => t.result === "skip").length;
}
function clearAll() { if (!confirm("确定清空所有标注数据？此操作不可恢复。")) return; state.tasks = []; saveTasks(); renderTaskList(); updateStats(); toast("已清空", "success"); }

function exportJSON() { if (state.tasks.length === 0) { toast("暂无数据可导出", "error"); return; } download("annotations_" + Date.now() + ".json", "application/json", JSON.stringify(state.tasks, null, 2)); toast("JSON 已导出", "success"); }

function exportCSV() {
  if (state.tasks.length === 0) { toast("暂无数据可导出", "error"); return; }
  const headers = ["任务ID","模式","结果","创建时间","视频信息","维度分数","排除项","备注"];
  const rows = state.tasks.map(t => {
    const scores = t.scores ? Object.entries(t.scores).map(([k,v]) => `D${k}:${v}`).join(";") : (t.dimensions ? Object.entries(t.dimensions).map(([k,v]) => `D${k}:${v.score||'-'}`).join(";") : "");
    const excl = t.exclusions ? Object.entries(t.exclusions).filter(([,v])=>v).map(([k])=>k).join("|") : "";
    return [t.id, t.mode, t.result, t.createdAt, JSON.stringify(t.videoMeta||{}), scores, excl, (t.notes||"").replace(/"/g,'""')];
  });
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  download("annotations_" + Date.now() + ".csv", "text/csv;charset=utf-8", "\uFEFF" + csv);
  toast("CSV 已导出", "success");
}

function download(name, type, content) { const blob = new Blob([content], { type }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); }

function bindVideo() {
  const fileInput = document.getElementById("fileInput");
  const video = document.getElementById("videoPlayer");
  const ph = document.getElementById("videoPlaceholder");
  fileInput.addEventListener("change", e => {
    const f = e.target.files[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    video.src = url; video.classList.add("show"); ph.classList.add("hidden");
    document.getElementById("taskId").value = f.name.replace(/\.[^.]+$/, "");
    video.addEventListener("loadedmetadata", () => { document.getElementById("videoMeta").textContent = `${video.videoWidth}×${video.videoHeight} · ${formatTime(video.duration)}`; }, { once: true });
  });
  document.getElementById("btnLoadUrl").addEventListener("click", () => {
    const url = document.getElementById("videoUrl").value.trim(); if (!url) return;
    video.src = url; video.classList.add("show"); ph.classList.add("hidden");
    video.addEventListener("loadedmetadata", () => { document.getElementById("videoMeta").textContent = `${video.videoWidth}×${video.videoHeight} · ${formatTime(video.duration)}`; }, { once: true });
  });
  const area = document.getElementById("videoArea");
  area.addEventListener("dragover", e => { e.preventDefault(); area.style.borderColor = "var(--primary)"; });
  area.addEventListener("dragleave", () => { area.style.borderColor = ""; });
  area.addEventListener("drop", e => { e.preventDefault(); area.style.borderColor = ""; const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("video/")) { fileInput.files = e.dataTransfer.files; fileInput.dispatchEvent(new Event("change")); } });
}

function currentVideoMeta() { const v = document.getElementById("videoPlayer"); if (!v.src) return null; return { width: v.videoWidth, height: v.videoHeight, duration: v.duration }; }
function formatTime(s) { if (!s || isNaN(s)) return ""; const m = Math.floor(s / 60), sec = Math.floor(s % 60); return `${m}:${sec.toString().padStart(2, "0")}`; }

function openRef() { document.getElementById("refModal").classList.remove("hidden"); document.getElementById("refBody").innerHTML = buildRefContent(); }
function closeRef() { document.getElementById("refModal").classList.add("hidden"); }

function buildRefContent() {
  return `<h3>整体流程</h3>
    <p><strong>高质量快筛：</strong>8 个维度均须为 4 分或 5 分；命中任一排除项直接过滤。</p>
    <p><strong>全维度评分：</strong>对 8 个维度逐项打分并勾选具体问题，用于 Reward Model 训练。</p>
    <h3>Q&A 标注标准</h3>
    <div class="qa"><div class="q">口型属于声音质量还是台词保持？</div><p>口型问题归入「口唇同步」维度，按 1–5 分评分。</p></div>
    <div class="qa"><div class="q">语言清晰度 vs 发音模糊？</div><p>语言清晰度属于「声音质量」（音频本身是否清晰）；发音模糊、口齿不清属于「台词保持」（内容能否分辨）。</p></div>
    <div class="qa"><div class="q">台词模糊和语言清晰度的区别？</div><p>声音质量好但内容无法分辨 → 只扣台词保持；声音质量差（炸麦/杂音）且听不清 → 两个维度都扣分。</p></div>
    <div class="qa"><div class="q">语言清晰度和音效质量的区别？</div><p>语言清晰度评价人声；音效质量评价背景音及人物与环境交互的声音（杯碰撞、物体落地等）。</p></div>
    <div class="qa"><div class="q">环境交互声音算扣分吗？</div><p>正常剧情交互声不扣分；仅当输出视频出现原视频没有的奇怪杂音时才扣背景音。</p></div>
    <div class="qa"><div class="q">什么样的数据属于失真？</div><p>声音存在明显 AI 感或不自然感，如机械感重、语音语调不像真人自然说话。</p></div>
    <h3>8 维度速查</h3>
    <ul>${DIMENSIONS.map(d => `<li><strong>${d.id}. ${d.name}</strong>：${d.desc}</li>`).join("")}</ul>`;
}

let toastTimer;
function toast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg; t.className = "toast show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
