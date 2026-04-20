// ============================================================
// FocusForge — script.js
// ============================================================

let tasks = [];
let currentFilter = "All";
let currentSort   = "deadline";
let isLoading     = false;
let searchQuery   = "";

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = "toast"; }, 2800);
}

// ── Load Tasks ─────────────────────────────────────────────
function loadTasks() {
  if (isLoading) return;
  isLoading = true;

  // Show skeletons on first load
  const upcoming = document.getElementById("upcomingList");
  const upEmpty  = document.getElementById("upcomingEmpty");
  if (upcoming.children.length === 0 || upcoming.children[0]?.classList.contains("empty-state")) {
    upEmpty?.remove();
    [1,2,3].forEach(() => {
      const s = document.createElement("div");
      s.className = "skeleton skeleton-task";
      upcoming.appendChild(s);
    });
  }

  fetch("getTasks.php")
    .then(res => res.json())
    .then(data => {
      tasks = data.map(t => ({
        id:          Number(t.id),
        title:       t.title,
        desc:        t.description,
        deadline:    t.deadline,
        priority:    t.priority,
        tags:        t.tags,
        progress:    Number(t.progress),
        completed:   Number(t.completed),
        completedAt: t.completed_at,
        overdue:     t.deadline && !Number(t.completed)
                       ? new Date(t.deadline) < new Date()
                       : false
      }));
      renderTasks();
      updateDoneCounter();
      isLoading = false;
    })
    .catch(() => {
      isLoading = false;
      showToast("Failed to load tasks", "error");
    });
}

// ── Sort ───────────────────────────────────────────────────
function sortTasks(list) {
  if (currentSort === "priority") {
    const map = { High: 1, Medium: 2, Low: 3 };
    return [...list].sort((a, b) => map[a.priority] - map[b.priority]);
  }
  return [...list].sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0));
}

// ── Render ─────────────────────────────────────────────────
function renderTasks() {
  const overdueBox   = document.getElementById("overdueList");
  const upcomingBox  = document.getElementById("upcomingList");
  const completedBox = document.getElementById("completedList");

  overdueBox.innerHTML  = "";
  upcomingBox.innerHTML = "";
  completedBox.innerHTML = "";

  let filtered = tasks;

  // Apply filter
  if (currentFilter !== "All") {
    filtered = tasks.filter(t => {
      if (currentFilter === "High Priority") return t.priority === "High";
      if (currentFilter === "Medium")        return t.priority === "Medium";
      if (currentFilter === "Low")           return t.priority === "Low";
      if (currentFilter === "Overdue")       return t.overdue;
      if (currentFilter === "Today") {
        const today = new Date().toDateString();
        return t.deadline && new Date(t.deadline).toDateString() === today;
      }
      return true;
    });
  }

  // Apply search
  if (searchQuery) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(searchQuery) ||
      (t.desc && t.desc.toLowerCase().includes(searchQuery))
    );
  }

  filtered = sortTasks(filtered);

  let overdueCount  = 0;
  let upcomingCount = 0;
  let completedCount = 0;

  filtered.forEach(task => {
    const card = createTaskCard(task);
    if (task.completed) {
      completedBox.appendChild(card);
      completedCount++;
    } else if (task.overdue) {
      overdueBox.appendChild(card);
      overdueCount++;
    } else {
      upcomingBox.appendChild(card);
      upcomingCount++;
    }
  });

  // Empty states
  if (overdueCount === 0) {
    overdueBox.innerHTML = `<div class="empty-state"><span>🎉 No overdue tasks!</span></div>`;
  }
  if (upcomingCount === 0) {
    upcomingBox.innerHTML = `<div class="empty-state"><span>${searchQuery ? "No tasks match your search." : "✨ All clear! Add a task above."}</span></div>`;
  }
  if (completedCount === 0) {
    completedBox.innerHTML = `<div class="empty-state"><span>No completed tasks yet.</span></div>`;
  }

  // Update counts
  document.getElementById("overdueCount").textContent  = `${overdueCount} task${overdueCount !== 1 ? "s" : ""}`;
  document.getElementById("upcomingCount").textContent = `${upcomingCount} task${upcomingCount !== 1 ? "s" : ""}`;
  document.getElementById("completedCount").textContent = `${completedCount} task${completedCount !== 1 ? "s" : ""}`;
}

// ── Create Card ────────────────────────────────────────────
function createTaskCard(task) {
  const article = document.createElement("article");
  article.className = "task"
    + (task.overdue    ? " task-overdue"    : "")
    + (task.completed  ? " task-completed"  : "");

  const pillClass = task.priority === "High" ? "high"
                  : task.priority === "Low"  ? "low"
                  : "medium";

  const tagsHTML = task.tags
    ? task.tags.split(",").map(t => `<span class="tag">${t.trim()}</span>`).join("")
    : "";

  const dateLabel = task.overdue
    ? `<span class="date-chip overdue-date">⏰ Overdue: ${formatDate(task.deadline)}</span>`
    : task.deadline
    ? `<span class="date-chip">🗓 ${formatDate(task.deadline)}</span>`
    : "";

  article.innerHTML = `
    <div class="task-top">
      <div class="task-info">
        <h3 class="task-title">${escHtml(task.title)}</h3>
        ${task.desc ? `<p class="task-desc">${escHtml(task.desc)}</p>` : ""}
      </div>
      <div class="task-actions">
        <button class="icon-btn complete-btn" title="Mark complete" onclick="completeTask(${task.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <button class="icon-btn edit-btn" title="Edit task" onclick="openEditModal(${task.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="icon-btn delete-btn" title="Delete task" onclick="deleteTask(${task.id})">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>

    <div class="task-meta">
      <span class="pill ${pillClass}">${task.priority}</span>
      ${tagsHTML}
      ${dateLabel}
    </div>

    <div class="task-progress">
      <div class="progress-header">
        <span>Progress</span>
        <span id="pLabel-${task.id}">${task.progress}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="pFill-${task.id}" style="width:${task.progress}%"></div>
      </div>
      <input type="range" min="0" max="100" value="${task.progress}"
        aria-label="Task progress"
        oninput="updateProgress(${task.id}, this.value)" />
    </div>
  `;

  return article;
}

function escHtml(str) {
  if (!str) return "";
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function formatDate(dt) {
  if (!dt) return "No deadline";
  return new Date(dt).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}

// ── Add Task ───────────────────────────────────────────────
document.getElementById("addTaskBtn").addEventListener("click", function () {
  const title    = document.getElementById("taskTitle").value.trim();
  const deadline = document.getElementById("taskDeadline").value;
  const desc     = document.getElementById("taskDesc").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const tags     = document.getElementById("taskTags").value.trim();

  if (!title || title.length < 3) {
    showToast("Title must be at least 3 characters", "error");
    document.getElementById("taskTitle").focus();
    return;
  }
  if (deadline && new Date(deadline) < new Date()) {
    showToast("Deadline cannot be in the past", "error");
    return;
  }

  const btn = this;
  btn.disabled = true;
  btn.textContent = "Adding…";

  fetch("addTask.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&deadline=${encodeURIComponent(deadline)}&priority=${encodeURIComponent(priority)}&tags=${encodeURIComponent(tags)}`
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      clearForm();
      loadTasks();
      showToast("Task added ✓", "success");
    } else {
      showToast("Error adding task", "error");
    }
  })
  .catch(() => showToast("Network error", "error"))
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Task`;
  });
});

// ── Delete ─────────────────────────────────────────────────
function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  fetch("deleteTask.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}`
  })
  .then(() => { loadTasks(); showToast("Task deleted", "info"); })
  .catch(() => showToast("Error deleting task", "error"));
}

// ── Complete ───────────────────────────────────────────────
function completeTask(id) {
  fetch("completeTask.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}`
  })
  .then(() => { loadTasks(); showToast("Task completed 🎉", "success"); })
  .catch(() => showToast("Error updating task", "error"));
}

// ── Edit Modal ─────────────────────────────────────────────
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById("editTaskId").value  = id;
  document.getElementById("editTitle").value   = task.title || "";
  document.getElementById("editDesc").value    = task.desc  || "";
  document.getElementById("editDeadline").value = task.deadline
    ? task.deadline.replace(" ", "T").slice(0, 16)
    : "";
  document.getElementById("editPriority").value = task.priority || "Medium";
  document.getElementById("editTags").value    = task.tags  || "";

  document.getElementById("editModal").classList.add("open");
  document.getElementById("editModal").setAttribute("aria-hidden", "false");
  document.getElementById("editTitle").focus();
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("open");
  document.getElementById("editModal").setAttribute("aria-hidden", "true");
}

document.getElementById("modalCloseBtn").addEventListener("click",  closeEditModal);
document.getElementById("modalCancelBtn").addEventListener("click", closeEditModal);
document.getElementById("editModal").addEventListener("click", function(e) {
  if (e.target === this) closeEditModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeEditModal();
});

document.getElementById("modalSaveBtn").addEventListener("click", function () {
  const id       = Number(document.getElementById("editTaskId").value);
  const title    = document.getElementById("editTitle").value.trim();
  const desc     = document.getElementById("editDesc").value.trim();
  const deadline = document.getElementById("editDeadline").value;
  const priority = document.getElementById("editPriority").value;
  const tags     = document.getElementById("editTags").value.trim();

  if (!title || title.length < 3) {
    showToast("Title must be at least 3 characters", "error");
    return;
  }

  const btn = this;
  btn.disabled = true;
  btn.textContent = "Saving…";

  fetch("updateTask.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "id=" + id +
      "&title="    + encodeURIComponent(title) +
      "&desc="     + encodeURIComponent(desc) +
      "&deadline=" + encodeURIComponent(deadline) +
      "&priority=" + encodeURIComponent(priority) +
      "&tags="     + encodeURIComponent(tags)
  })
  .then(() => {
    closeEditModal();
    loadTasks();
    showToast("Task updated ✓", "success");
  })
  .catch(() => showToast("Error saving task", "error"))
  .finally(() => {
    btn.disabled = false;
    btn.textContent = "Save Changes";
  });
});

// ── Progress ───────────────────────────────────────────────
let progressTimeout;
function updateProgress(id, value) {
  const progress = parseInt(value);
  const label = document.getElementById("pLabel-" + id);
  const fill  = document.getElementById("pFill-" + id);
  if (label) label.textContent = progress + "%";
  if (fill)  fill.style.width  = progress + "%";

  clearTimeout(progressTimeout);
  progressTimeout = setTimeout(() => {
    fetch("updateProgress.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${id}&progress=${progress}`
    });
  }, 500);
}

// ── Clear Form ─────────────────────────────────────────────
document.getElementById("clearBtn").addEventListener("click", clearForm);
function clearForm() {
  document.getElementById("taskTitle").value    = "";
  document.getElementById("taskDeadline").value = "";
  document.getElementById("taskDesc").value     = "";
  document.getElementById("taskPriority").value = "Medium";
  document.getElementById("taskTags").value     = "";
  document.getElementById("taskTitle").focus();
}

// ── Form Collapse ──────────────────────────────────────────
const formToggle = document.getElementById("formToggle");
const formBody   = document.getElementById("taskFormBody");
formToggle.addEventListener("click", function () {
  const collapsed = formBody.classList.toggle("collapsed");
  this.classList.toggle("collapsed", collapsed);
  this.setAttribute("aria-expanded", String(!collapsed));
});

// ── Completed Section Collapse ─────────────────────────────
const completedToggle = document.getElementById("completedToggle");
const completedList   = document.getElementById("completedList");
completedToggle.addEventListener("click", function () {
  const expanded = this.getAttribute("aria-expanded") === "true";
  this.setAttribute("aria-expanded", String(!expanded));
  completedList.classList.toggle("collapsed", expanded);
});
completedToggle.addEventListener("keydown", e => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); completedToggle.click(); }
});

// ── Filter Chips ───────────────────────────────────────────
document.querySelectorAll(".chips-row .chip").forEach(chip => {
  chip.addEventListener("click", function () {
    document.querySelectorAll(".chips-row .chip").forEach(c => c.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.dataset.chip;
    renderTasks();
  });
});

// ── Nav Items ──────────────────────────────────────────────
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.dataset.filter || "All";
    renderTasks();
  });
});

// ── Search ─────────────────────────────────────────────────
document.getElementById("searchInput").addEventListener("input", function () {
  searchQuery = this.value.toLowerCase().trim();
  renderTasks();
});

// ── Sort ───────────────────────────────────────────────────
document.getElementById("sortOption").addEventListener("change", function () {
  currentSort = this.value;
  renderTasks();
});

// ── Theme Toggle ───────────────────────────────────────────
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", function () {
  const isLight = document.body.classList.toggle("light");
  const icon = document.getElementById("themeIcon");
  icon.innerHTML = isLight
    ? `<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>`
    : `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;
});

// ── Pomodoro ───────────────────────────────────────────────
const POMO_TOTAL = 25 * 60;
let pomodoroSeconds  = POMO_TOTAL;
let pomodoroInterval = null;
let pomoRunning      = false;

function updateTimerDisplay() {
  const mins = String(Math.floor(pomodoroSeconds / 60)).padStart(2, "0");
  const secs = String(pomodoroSeconds % 60).padStart(2, "0");
  const display = `${mins}:${secs}`;
  document.getElementById("timerText").textContent  = display;
  document.getElementById("timerBadge").textContent = display;
  document.getElementById("timerFill").style.width  = (pomodoroSeconds / POMO_TOTAL * 100) + "%";
}

document.getElementById("startBtn").addEventListener("click", function () {
  if (pomoRunning) return;
  pomoRunning = true;
  this.classList.add("active-pulse");

  pomodoroInterval = setInterval(() => {
    if (pomodoroSeconds <= 0) {
      clearInterval(pomodoroInterval);
      pomoRunning = false;
      document.getElementById("startBtn").classList.remove("active-pulse");
      showToast("⏱ Pomodoro done! Take a break 🎉", "success");
      pomodoroSeconds = POMO_TOTAL;
      updateTimerDisplay();
      return;
    }
    pomodoroSeconds--;
    updateTimerDisplay();
  }, 1000);
});

document.getElementById("pauseBtn").addEventListener("click", function () {
  clearInterval(pomodoroInterval);
  pomoRunning = false;
  document.getElementById("startBtn").classList.remove("active-pulse");
});

document.getElementById("resetBtn").addEventListener("click", function () {
  clearInterval(pomodoroInterval);
  pomoRunning = false;
  document.getElementById("startBtn").classList.remove("active-pulse");
  pomodoroSeconds = POMO_TOTAL;
  updateTimerDisplay();
});

// ── Focus Music ────────────────────────────────────────────
document.querySelectorAll(".music-chips .chip").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".music-chips .chip").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    document.getElementById("musicPlayer").src = this.dataset.src;
  });
});

// ── Done Counter ───────────────────────────────────────────
function updateDoneCounter() {
  const today = new Date().toDateString();
  const done  = tasks.filter(t =>
    t.completed && t.completedAt &&
    new Date(t.completedAt).toDateString() === today
  ).length;
  document.getElementById("doneCounter").textContent = String(done).padStart(2, "0");
}

// ── Init ───────────────────────────────────────────────────
loadTasks();
updateTimerDisplay();