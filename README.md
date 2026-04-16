# 🧠 AI Task Board

AI Task Board is a full-stack meeting transcript analysis web application that converts raw meeting discussions into structured, actionable tasks using rule-based NLP logic.

---

## 📌 Overview

This project is designed to simplify meeting follow-ups. Instead of manually reviewing notes and creating to-do lists, users can paste a meeting transcript and automatically generate a structured task board.

The system extracts action items, identifies assignees from names mentioned in the conversation, classifies task priority, and organizes tasks into a manageable workflow.

---

## ✨ Features

* User login and registration
* Analyze raw meeting transcripts
* Automatic task extraction
* Assignee detection from meeting context
* Priority classification (High / Medium / Low)
* Separate pending and completed tasks
* Manual task completion
* Auto-detection of completed tasks (done, submitted, etc.)
* Edit and delete tasks
* Search tasks by keyword
* Reset task board
* Backend storage using MongoDB

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Node.js, Express
* **Database:** MongoDB
* **ODM:** Mongoose
* **Authentication:** Basic username/password system (hashed passwords)

---

## 📁 Project Structure

```bash
AI_TASK_BOARD/
├── Frontend/
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   └── js/
│       ├── parser.js
│       └── ui.js
├── backend/
│   ├── server.js
│   └── package.json
└── README.md
```

---

## ⚙️ How It Works

1. User logs in or registers
2. User enters their meeting identity
3. User pastes a meeting transcript
4. System analyzes text using rule-based NLP
5. Action-oriented sentences are extracted as tasks
6. Names in transcript are used to assign tasks
7. Priority is classified using keywords
8. Completed tasks are detected automatically or marked manually
9. Data is stored in MongoDB
10. Dashboard displays All Tasks, My Tasks, and Done

---

## 🧠 Task Logic

The system detects tasks using action keywords such as:

* fix
* review
* update
* send
* prepare
* check
* test
* debug

Completion detection uses keywords like:

* done
* completed
* submitted
* finished

The system also:

* Splits long sentences into multiple tasks
* Ignores filler phrases where possible
* Converts unstructured text into structured actions

---

## 🔗 API Endpoints

### POST /login

Login user

```json
{
  "username": "Neha"
}
```

---

### POST /tasks

Save extracted tasks

```json
{
  "username": "Neha",
  "taskList": ["prepare slides", "send report"]
}
```

---

### GET /tasks/:username

Fetch user tasks

---

### POST /done

Mark task as completed

```json
{
  "username": "Neha",
  "task": "send report"
}
```

---

### GET /done/:username

Fetch completed tasks

---

### POST /saveMeeting

Save transcript + tasks

```json
{
  "username": "Neha",
  "transcript": "Neha send report",
  "tasks": ["send report"]
}
```

---

### GET /meetings

Fetch all stored meetings

---

## 🧪 Example Input

```text
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

### 🔹 Login Page

<img width="436" height="531" alt="Screenshot 2026-04-16 202550" src="https://github.com/user-attachments/assets/f3b74c5f-9557-4da1-a41e-d325f75615c8" />


### 🔹 Task Board

<img width="1905" height="921" alt="Screenshot 2026-04-16 211250" src="https://github.com/user-attachments/assets/750fcccf-0064-4633-8c5d-1dc1af496397" />

### 🔹 Extracted Tasks

<img width="1895" height="896" alt="Screenshot 2026-04-16 211356" src="https://github.com/user-attachments/assets/5aaf7ff6-c2cf-4633-af17-e58e4028c96d" />


### 🔹 Done Section

<img width="1862" height="855" alt="Screenshot 2026-04-16 195956" src="https://github.com/user-attachments/assets/b83e4029-8212-46b3-bf1d-5552c430c47d" />

### 🔹 Mongodb Section
 <img width="1916" height="1076" alt="Screenshot 2026-04-16 200305" src="https://github.com/user-attachments/assets/bcaced68-f9f1-4331-a4f6-074afafe3348" />


---

## 🚧 Future Improvements

* Advanced NLP / AI-based extraction
* Improved assignee detection
* Secure authentication (JWT)
* Real-time collaboration
* Task deadlines and reminders
* Team dashboards
* Export to PDF or CSV

---

## 📄 License

This project is developed for academic and learning purposes.

## 📄 Project Report

You can view the full project report here:

[📥 Download Report](./AI_Task_Board_Report.pdf)
