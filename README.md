# 🧠 AI Task Board

AI Task Board is a full-stack web application that transforms raw meeting discussions into structured, actionable task boards using rule-based Natural Language Processing (NLP).

---

## 🌐 Live Demo

* 🔗 **Frontend (Vercel):**
  https://ai-task-board-project-llda9cnc1-ananya-h689s-projects.vercel.app/

* 🔗 **Backend API (Render):**
  https://ai-task-board-backend.onrender.com

* 🗄️ **Database:** MongoDB Atlas (Cloud)

---

## 📄 Project Report

📥 Download full project documentation:
👉 [Download Report](./AI_Task_Board_Report.pdf)

---

## 📌 Overview

In real-world meetings, discussions are often unstructured, lengthy, and scattered across multiple topics. Extracting meaningful action items manually can be time-consuming and inefficient.

**AI Task Board** solves this problem by intelligently converting meeting transcripts into a structured task management system.

Instead of manually reviewing notes, users can simply paste a transcript, and the system will:

* Identify actionable sentences
* Automatically extract tasks
* Detect responsible persons (assignees)
* Classify task priority
* Organize everything into a clean, interactive dashboard

This significantly improves productivity, clarity, and accountability in team workflows.

---

## ✨ Features

* 🔐 User Registration & Login
* 🧠 Analyze raw meeting transcripts
* 📌 Automatic task extraction
* 👤 Assignee detection from meeting context
* ⚡ Priority classification (High / Medium / Low)
* 📋 Separate pending and completed tasks
* ✅ Manual task completion
* 🤖 Auto-detection of completed tasks (done, submitted, etc.)
* ✏️ Edit and delete tasks
* 🔍 Search tasks by keyword
* 🔄 Reset task board
* ☁️ Persistent backend storage using MongoDB Atlas

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **ODM:** Mongoose
* **Authentication:** bcrypt (password hashing)
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## 📁 Project Structure

```
AI_TASK_BOARD/
├── Frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── js/
│       ├── parser.js
│       └── ui.js
├── Backend/
│   ├── server.js
│   └── package.json
├── AI_Task_Board_Report.pdf
└── README.md
```

---

## ⚙️ How It Works

1. User logs in or registers
2. User enters their meeting identity (name)
3. User pastes a meeting transcript
4. The system processes the text using rule-based NLP
5. Action-oriented sentences are identified
6. Tasks are extracted from those sentences
7. Assignees are detected based on names in the transcript
8. Priority is classified using keyword-based logic
9. Completed tasks are auto-detected or manually marked
10. Data is stored in MongoDB
11. Dashboard displays:

* All Tasks
* My Tasks
* Completed Tasks

---

## 🧠 Task Logic

### 🔹 Action Detection

The system identifies tasks using action-based keywords such as:

* fix
* review
* update
* send
* prepare
* check
* test
* debug

---

### 🔹 Completion Detection

Tasks are marked as completed if they contain keywords like:

* done
* completed
* submitted
* finished

---

### 🔹 Intelligent Processing

The system also:

* Splits long sentences into multiple tasks
* Removes unnecessary filler phrases
* Assigns tasks based on detected names
* Deduplicates repeated or similar tasks
* Converts unstructured text into structured data

---

## 🔗 API Endpoints

### 🔐 Authentication

**POST /register**
Register a new user

**POST /login**
Login user

---

### 📊 Task State

**GET /state/:userId**
Fetch all tasks for a user

**POST /state/:userId**
Save or update tasks

---

### 🧠 NLP Processing

**POST /analyze**
Analyze transcript and extract tasks

---

### 🔄 Utility

**POST /reset/:userId**
Reset user task board

**GET /health**
Check backend status

---

## 🧪 Example Input

```
Priya fix the UI alignment and check navbar.
Arjun debug the backend APIs.
Neha prepare slides and send them to the team.
```

---

## ✅ Example Output

```json
[
  {
    "text": "fix the UI alignment",
    "assignee": "Priya",
    "priority": "high"
  },
  {
    "text": "prepare slides",
    "assignee": "Neha",
    "priority": "medium"
  }
]
```

---

## 📸 Screenshots

### 🔐 Login & Registration

![Login](<img width="1422" height="888" alt="login" src="https://github.com/user-attachments/assets/d1c05f87-6953-4b3f-91fa-c940530b0367" />
)

A clean authentication interface with secure password handling using bcrypt.

---

### 📊 Dashboard (Before Analysis)

![Empty Dashboard](<img width="1878" height="959" alt="dashboard-empty" src="https://github.com/user-attachments/assets/23555716-2d1d-4a1b-b7ef-718114875744" />
)

Users can paste transcripts and enter identity before generating tasks.

---

### 🧠 Dashboard (After Analysis)

![Filled Dashboard](<img width="1891" height="960" alt="dashboard-filled" src="https://github.com/user-attachments/assets/2463e205-6e1b-47fc-9974-c5f139d156f3" />
)

Automatically extracted tasks with priority and assignee classification.

---

### 📋 Task Management

![Tasks](<img width="1911" height="929" alt="tasks" src="https://github.com/user-attachments/assets/7adc6f2c-ff74-40db-9ed7-74a4d5672c89" />
)

Users can edit, delete, and manage tasks interactively.

---

### ✅ Completed Tasks

![Done](<img width="1811" height="842" alt="done" src="https://github.com/user-attachments/assets/4d888f39-a24e-4f7f-bf68-2ee4cb62ef4b" />
)

Completed tasks are clearly separated for better tracking.

---

### 🗄️ MongoDB Database

![MongoDB](<img width="1875" height="820" alt="mongo " src="https://github.com/user-attachments/assets/783e6b66-f404-4afe-bef9-9c98cff35260" />
)

All user data, tasks, and transcript history are stored in MongoDB Atlas.

---

## 🚧 Future Improvements

* 🤖 AI/LLM-based NLP instead of rule-based
* 🔐 JWT-based authentication
* 👥 Real-time collaboration
* ⏰ Task deadlines and reminders
* 📊 Team dashboards
* 📤 Export to PDF or CSV

---

## 📄 License

This project is developed for academic and learning purposes.

---

## 👩‍💻 Author

**Ananya H**
Full Stack Developer | AI Enthusiast
