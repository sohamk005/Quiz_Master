# Quiz Master V2

## 📌 Description
Online learning platforms require efficient quiz management for students and instructors.  
**Quiz Master V2** provides an interactive interface to create, manage, and analyze quizzes with structured subjects, chapters, and questions.  
The platform is designed for both students and administrators, offering secure authentication, role-based access, and performance tracking with automated reports.

## 🛠️ Technologies Used
- **Python** – Backend programming language  
- **Flask** – Micro web framework for routing, APIs, and authentication  
- **Vue.js** – Frontend framework for interactive UI  
- **Bootstrap** – Responsive styling and UI components  
- **SQLite** – Relational database for persistent storage  
- **Celery** – Background task scheduling (e.g., email reports)  
- **Flask-Security** – User authentication, roles, and session management  

## ✨ Features
- **User Authentication** – Secure login/registration with role-based access (Admin, User)  
- **Admin Panel** – Create, update, and delete subjects, chapters, quizzes, and questions  
- **Quiz System** – Timed multiple-choice quizzes with auto-evaluation and instant scoring  
- **User Dashboard** – Organized view of subjects, chapters, quizzes, and scores  
- **Performance Tracking** – Users can view past quiz attempts and history  
- **Automated Email Reports** – Monthly quiz performance reports sent via email  
- **Modern Frontend** – Vue.js for interactivity, Bootstrap for responsiveness  

## 🔗 API Endpoints
### **Subject API**
- `GET` `/api/subject/get`  
- `POST` `/api/subject/create`  
- `PUT` `/api/subject/update/<int:subject_id>`  
- `DELETE` `/api/subject/delete/<int:subject_id>`  

### **Chapter API**
- `GET` `/api/chapter/get`  
- `POST` `/api/chapter/create`  
- `PUT` `/api/chapter/update/<int:chapter_id>`  
- `DELETE` `/api/chapter/delete/<int:chapter_id>`  

### **Quiz API**
- `GET` `/api/quiz/get`  
- `POST` `/api/quiz/create`  
- `PUT` `/api/quiz/update/<int:quiz_id>`  
- `DELETE` `/api/quiz/delete/<int:quiz_id>`  

### **Question API**
- `GET` `/api/question/get`  
- `POST` `/api/question/create`  
- `PUT` `/api/question/update/<int:question_id>`  
- `DELETE` `/api/question/delete/<int:question_id>`  

### **Score API**
- `GET` `/api/score/<int:user_id>`  
- `POST` `/api/score`  

### **Search API**
- `GET` `/api/search`  