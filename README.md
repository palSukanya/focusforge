# ⚡ FocusForge – Smart Productivity Task Manager

![Status](https://img.shields.io/badge/status-active-success)
![Tech](https://img.shields.io/badge/stack-PHP%20%7C%20MySQL%20%7C%20JS-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> ⚡ **FocusForge** is a modern full-stack productivity system that combines task management, real-time updates, and built-in focus tools like Pomodoro — all in one seamless experience.

> 💡 Built to simulate real-world SaaS applications with dynamic UI, secure backend architecture, and productivity-first design.

---

## 💎 Why FocusForge?

* 🚀 Combines **task management + productivity tools** in one app
* ⚡ Real-time UI updates without page reload (AJAX / Fetch API)
* 🔐 Secure backend using prepared statements
* 🧠 Designed like a **real SaaS product**, not just a CRUD app
* 🎯 Clean, modular, and scalable structure

---

## 🚀 Features

### 📋 Task Management

* Create, update, and delete tasks
* Mark tasks as completed
* Track task progress (0–100%)
* Deadline-based task organization
* Automatic overdue task detection

### 🎯 Smart Filtering & Search

* Filter by priority (High / Medium / Low)
* Views: Today, This Week, Overdue
* Real-time search (title + description)

### 📊 Productivity Tools

* ⏱️ Pomodoro Timer (25-minute focus sessions)
* 🎯 Focus Mode (distraction-free UI)
* 📈 Daily completed task counter

### 🎨 UI/UX

* Responsive modern design
* Dark / Light mode toggle
* Tag-based organization system

---

## 🔥 Key Highlights

* ✅ Built secure backend using **prepared statements** (SQL injection prevention)
* ✅ Implemented **real-time updates without frameworks**
* ✅ Modular frontend with dynamic DOM rendering
* ✅ Integrated productivity tools (Pomodoro + Focus Mode)

---

## 🛠 Tech Stack

| Layer    | Technology            |
| -------- | --------------------- |
| Frontend | HTML, CSS, JavaScript |
| Backend  | PHP                   |
| Database | MySQL                 |
| Styling  | Custom CSS            |

---

## 📂 Project Structure

```bash
FocusForge/
├── addTask.php
├── completeTask.php
├── deleteTask.php
├── updateTask.php
├── getTasks.php
├── db.php
├── index.html
├── script.js
├── style.css
├── database.sql
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/focusforge.git
cd focusforge
```

### 2️⃣ Setup Database

1. Open phpMyAdmin
2. Create a database named: `focusforge`
3. Import:

```
database.sql
```

### 3️⃣ Configure Database

```php
$conn = new mysqli("localhost", "root", "", "focusforge");
```

### 4️⃣ Run Project

* Place inside `htdocs` (XAMPP)
* Start Apache + MySQL
* Open:

```
http://localhost/focusforge/
```

---

## 🔌 API Endpoints

| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| POST   | addTask.php      | Add new task           |
| GET    | getTasks.php     | Fetch all tasks        |
| POST   | updateTask.php   | Update task            |
| POST   | deleteTask.php   | Delete task            |
| POST   | completeTask.php | Mark task as completed |

---

## 🔐 Security Features

* 🛡 SQL Injection protection using prepared statements
* 🧾 Input validation on frontend
* 🔄 Structured backend queries

---

## 📸 Screenshots

> 🚧 Add actual images here to boost impact

Example:

* 🏠 Dashboard View
* ➕ Task Creation
* ⏱️ Pomodoro Timer
* 🌙 Dark Mode

---

## 🌟 Future Improvements

* 👤 User Authentication (Login / Signup)
* ☁️ Cloud Deployment (Render / Netlify)
* 📊 Analytics Dashboard
* 📅 Calendar Integration
* 🤖 AI-based Task Prioritization
* 🧩 Drag & Drop Kanban Board

---

## 📈 Learning Outcomes

* Full-stack development using PHP + MySQL
* REST-style API design
* DOM manipulation & state management
* UI/UX design principles
* Secure coding practices

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub!
