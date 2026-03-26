// DATA  (tasks stored as an array of objects)

let tasks = [];
let currentFilter = "All";
let isLoading = false;

function loadTasks() {
  if (isLoading) return;
  isLoading = true;

  fetch("getTasks.php")
    .then(res => res.json())
    .then(data => {
      tasks = data.map(t => ({
        id: Number(t.id),
        title: t.title,
        desc: t.description,
        deadline: t.deadline,
        priority: t.priority,
        tags: t.tags,
        progress: t.progress,
        completed: Number(t.completed),
        completedAt: t.completed_at,
        overdue: t.deadline ? new Date(t.deadline) < new Date() : false
      }));

      renderTasks();
      updateDoneCounter();
      isLoading = false;
    });
}

// RENDER TASKS
function renderTasks() {
  const overdueBox  = document.getElementById("overdueList");
  const upcomingBox = document.getElementById("upcomingList");
  const completedBox = document.getElementById("completedList");

  overdueBox.innerHTML  = "";
  upcomingBox.innerHTML = "";
  if (completedBox) completedBox.innerHTML = "";

  let filtered = tasks;
  if (currentFilter !== "All") {
    filtered = tasks.filter(t => {
      if (currentFilter === "High Priority") return t.priority === "High";
      if (currentFilter === "Medium")        return t.priority === "Medium";
      if (currentFilter === "Low")           return t.priority === "Low";
      if (currentFilter === "Overdue")       return t.overdue;
      if (currentFilter === "Today") {
        const today = new Date().toDateString();
        return new Date(t.deadline).toDateString() === today;
      }
      return true;
    });
  }

  filtered.forEach(task => {
    const card = createTaskCard(task);
    if (task.completed) {
      completedBox.appendChild(card);
    } else if (task.overdue) {
      overdueBox.appendChild(card);
    } else {
      upcomingBox.appendChild(card);
    }
  });
}

function createTaskCard(task) {
  const article = document.createElement("article");
  article.className = "task" + (task.overdue ? " task-overdue" : "");

  const pillClass = task.priority === "High" ? "high"
                  : task.priority === "Low"  ? "low"
                  : "medium";

  const tagsHTML = task.tags
    ? task.tags.split(",").map(t => `<span class="tag">${t.trim()}</span>`).join("")
    : "";

  const dateLabel = task.overdue
    ? `<span class="date danger">⏰ Overdue</span>`
    : `<span class="date">🗓️ ${formatDate(task.deadline)}</span>`;

  article.innerHTML = `
    <div class="task-top">
      <div>
        <h3>${task.title}</h3>
        <p class="muted">${task.desc}</p>
      </div>
      <div class="task-actions">
        <button class="icon-btn" onclick="completeTask(${task.id})">✔️</button>
        <button class="icon-btn" onclick="editTask(${task.id})">✏️</button>
        <button class="icon-btn danger" onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    </div>

    <div class="task-meta">
      <span class="pill ${pillClass}">${task.priority}</span>
      ${tagsHTML}
      ${dateLabel}
    </div>

    <div class="progress">
      <div class="progress-label">
        <span>Progress</span>
        <span id="pLabel-${task.id}">${task.progress}%</span>
      </div>
      <div class="progress-bar">
        <div class="bar" style="width:${task.progress}%"></div>
      </div>
      <input type="range" min="0" max="100" value="${task.progress}"
        style="width:100%;margin-top:8px;accent-color:var(--primary)"
        oninput="updateProgress(${task.id}, this.value)" />
    </div>
  `;

  return article;
}


function formatDate(dt) {
  if (!dt) return "No deadline";
  const d = new Date(dt);
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

// ADD TASK
document.getElementById("addTaskBtn").addEventListener("click", function () {
  const title    = document.getElementById("taskTitle").value.trim();
  const deadline = document.getElementById("taskDeadline").value;
  const desc     = document.getElementById("taskDesc").value.trim();
  const priority = document.getElementById("taskPriority").value;
  const tags     = document.getElementById("taskTags").value.trim();

  if (!title || title.length < 3) {
    alert("Title must be at least 3 characters!");
    return;
  }

  if (deadline && new Date(deadline) < new Date()) {
    alert("Deadline cannot be in the past!");
    return;
  }

  const now = new Date();
  const isOverdue = deadline ? new Date(deadline) < now : false;

  fetch("addTask.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `title=${title}&desc=${desc}&deadline=${deadline}&priority=${priority}&tags=${tags}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            loadTasks();
            clearForm();
        } else {
            alert("Error adding task");
        }
    });
});

// DELETE TASK

function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  fetch("deleteTask.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}`
  })
  .then(() => loadTasks());
}
function completeTask(id) {
  fetch("completeTask.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `id=${id}`
  })
  .then(() => loadTasks());
}

// EDIT TASK
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const newTitle = prompt("Edit title:", task.title);
  const newDesc = prompt("Edit description:", task.desc || "");
  const newDeadline = prompt("Edit deadline:", task.deadline || "");
  const newPriority = prompt("Edit priority (High/Medium/Low):", task.priority || "Medium");
  const newTags = prompt("Edit tags:", task.tags || "");

  fetch("updateTask.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "id=" + id +
      "&title=" + encodeURIComponent(newTitle !== null ? newTitle : task.title) +
      "&desc=" + encodeURIComponent(newDesc !== null ? newDesc : task.desc) +
      "&deadline=" + encodeURIComponent(newDeadline !== null ? newDeadline : task.deadline) +
      "&priority=" + encodeURIComponent(newPriority !== null ? newPriority : task.priority) +
      "&tags=" + encodeURIComponent(newTags !== null ? newTags : task.tags)
  })
  .then(() => loadTasks());
}

// PROGRESS UPDATE
function updateProgress(id, value) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.progress = parseInt(value);
    const label = document.getElementById("pLabel-" + id);
    if (label) label.textContent = value + "%";

    const bars = document.querySelectorAll(`.bar`);
    renderTasks(); 
  }
}

// CLEAR FORM
document.getElementById("clearBtn").addEventListener("click", clearForm);

function clearForm() {
  document.getElementById("taskTitle").value    = "";
  document.getElementById("taskDeadline").value = "";
  document.getElementById("taskDesc").value     = "";
  document.getElementById("taskPriority").value = "Medium";
  document.getElementById("taskTags").value     = "";
}

//FILTER CHIPS
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", function () {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
    this.classList.add("active");
    currentFilter = this.textContent.trim();
    renderTasks();
  });
});
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
    this.classList.add("active");

    const text = this.textContent.trim();

    if (text.includes("Dashboard")) currentFilter = "All";
    else if (text.includes("Overdue")) currentFilter = "Overdue";
    else if (text.includes("Today")) currentFilter = "Today";
    else if (text.includes("This Week")) currentFilter = "This Week";

    renderTasks();
  });
});

document.getElementById("searchInput").addEventListener("input", function () {
  const query = this.value.toLowerCase();

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(query) ||
    (t.desc && t.desc.toLowerCase().includes(query))
  );

  renderFilteredTasks(filtered);
});

function renderFilteredTasks(list) {
  const upcomingBox = document.getElementById("upcomingList");
  upcomingBox.innerHTML = "";

  list.forEach(task => {
    upcomingBox.appendChild(createTaskCard(task));
  });
}

//DARK / LIGHT THEME TOGGLE
document.getElementById("themeToggle").addEventListener("click", function () {
  document.body.classList.toggle("light");
  this.textContent = document.body.classList.contains("light")
    ? "🌙 Dark Mode"
    : "☀️ Light Mode";
});

// FOCUS MODE (hide sidebar)
document.getElementById("focusMode").addEventListener("click", function () {
  const sidebar = document.querySelector(".sidebar");
  const isHidden = sidebar.style.display === "none";
  sidebar.style.display = isHidden ? "block" : "none";
  this.textContent = isHidden ? "Enter Focus Mode" : "Exit Focus Mode";
});

//POMODORO TIMER
let pomodoroSeconds = 25 * 60; 
let pomodoroInterval = null;
let isRunning = false;

function updateTimerDisplay() {
  const mins = String(Math.floor(pomodoroSeconds / 60)).padStart(2, "0");
  const secs = String(pomodoroSeconds % 60).padStart(2, "0");
  const display = `${mins}:${secs}`;
  document.getElementById("timerText").textContent  = display;
  document.getElementById("timerBadge").textContent = display;
}

document.getElementById("startBtn").addEventListener("click", function () {
  if (isRunning) return;
  isRunning = true;

  pomodoroInterval = setInterval(function () {
    if (pomodoroSeconds <= 0) {
      clearInterval(pomodoroInterval);
      isRunning = false;
      alert("⏱️ Pomodoro done! Take a 5-minute break.");
      pomodoroSeconds = 25 * 60;
      updateTimerDisplay();
      return;
    }
    pomodoroSeconds--;
    updateTimerDisplay();
  }, 1000);
});

document.getElementById("pauseBtn").addEventListener("click", function () {
  clearInterval(pomodoroInterval);
  isRunning = false;
});

document.getElementById("resetBtn").addEventListener("click", function () {
  clearInterval(pomodoroInterval);
  isRunning = false;
  pomodoroSeconds = 25 * 60;
  updateTimerDisplay();
});

//DONE COUNTER
function updateDoneCounter() {
  const today = new Date().toDateString();

  const done = tasks.filter(t =>
    t.completed &&
    new Date(t.completedAt).toDateString() === today
  ).length;

  document.getElementById("doneCounter").textContent =
    String(done).padStart(2, "0");
}
//Music
const musicLinks = {
  "Lo-fi": "https://www.youtube.com/embed/jfKfPfyJRdk",
  "Chill Hop": "https://www.youtube.com/embed/5yx6BWlEVcY",
  "White Noise": "https://www.youtube.com/embed/nMfPqeZjc2c",
  "Concentration": "https://www.youtube.com/embed/WPni755-Krg"
};

document.querySelectorAll(".music-grid .chip").forEach(btn => {
  btn.addEventListener("click", function () {
    const type = this.textContent.trim();
    document.getElementById("musicPlayer").src = musicLinks[type];
  });
});

// INIT — run on page load
loadTasks();
updateTimerDisplay();
updateDoneCounter();