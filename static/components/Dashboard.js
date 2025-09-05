export default {
  template: 
  `<div>
    <h2 class="my-2">Welcome, {{ userData.username }} (Admin)!</h2>
    
    <div class="row border">
      <div class="text-end my-2">
        <button @click="csvExport" class="btn btn-secondary"> Download Quiz CSV Report </button>
      </div>
    </div>
    
    <div class="row">
      <!--  Subjects  -->
      <div class="col-8 border" style="height: 750px; overflow-y: scroll">
        <h2>Subjects</h2>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-for="subject in subjects" :key="subject.id" class="card mt-2">
          <div class="card-body subject-card">
            <h5 class="card-title">
              {{ subject.name }}
              <router-link :to="{ name: 'updateSub', params: { id: subject.id } }" class="btn btn-warning btn-sm ml-2">Update</router-link>
              <button @click="deleteSubject(subject.id)" class="btn btn-danger btn-sm ml-2">Delete</button>
            </h5>
            <p class="card-text">{{ subject.description }}</p>
            <!-- Chapters -->
            <div class="ml-3 chapter-card">
              <h6>Chapters:</h6>
              <div v-if="subject.chapters && subject.chapters.length">
                <div v-for="chapter in subject.chapters" :key="chapter.id" class="card mt-1">
                  <div class="card-body">
                    <h6 class="card-title">
                      {{ chapter.name }}
                      <router-link :to="{ name: 'updateChap', params: { id: chapter.id } }" class="btn btn-warning btn-sm ml-2">Update</router-link>
                      <button @click="deleteChapter(chapter.id)" class="btn btn-danger btn-sm ml-2">Delete</button>
                    </h6>
                    <p class="card-text">{{ chapter.description }}</p>
                    <!--quizzes -->
                    <div class="ml-3 quiz-card">
                      <h6>Quizzes:</h6>
                      <div v-if="chapter.quizzes && chapter.quizzes.length">
                        <div v-for="quiz in chapter.quizzes" :key="quiz.id" class="card mt-1">
                          <div class="card-body">
                            <h6 class="card-title">
                              Quiz on {{ quiz.date_of_quiz }}
                              <router-link :to="{ name: 'updateQuiz', params: { id: quiz.id } }" class="btn btn-warning btn-sm ml-2">Update</router-link>
                              <button @click="deleteQuiz(quiz.id)" class="btn btn-danger btn-sm ml-2">Delete</button>
                            </h6>
                            <p class="card-text">
                              Duration: {{ quiz.time_duration }}, Remarks: {{ quiz.remarks }}
                            </p>
                            <!-- questions -->
                            <div class="ml-3 question-card">
                              <h6>Questions:</h6>
                              <div v-if="quiz.questions && quiz.questions.length">
                                <div v-for="q in quiz.questions" :key="q.id" class="card mt-1">
                                  <div class="card-body">
                                    <p class="card-text">
                                      {{ q.question_statement }}<br>
                                      A: {{ q.option1 }} | B: {{ q.option2 }} | C: {{ q.option3 }} | D: {{ q.option4 }}<br>
                                      Correct: {{ q.correct_option }}
                                      <router-link :to="{ name: 'updateQues', params: { id: q.id } }" class="btn btn-warning btn-sm mt-1">Update</router-link>
                                      <button @click="deleteQuestion(q.id)" class="btn btn-danger btn-sm mt-1">Delete</button>
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div v-else>
                                <p>No questions found.</p>
                              </div>
                              <!--adding question -->
                              <button @click="openAddQuestionModal(quiz.id)" class="btn btn-primary btn-sm mt-1">Add Question</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <p>No quizzes found.</p>
                      </div>
                      <!-- add quiz-->
                      <button @click="openAddQuizModal(chapter.id)" class="btn btn-primary btn-sm mt-1">Add Quiz</button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <p>No chapters found.</p>
              </div>
              <!--adding chapter-->
              <button @click="openAddChapterModal(subject.id)" class="btn btn-primary btn-sm mt-1">Add Chapter</button>
            </div>
          </div>
        </div>
      </div>
  
      <!--adding New Subject -->
      <div class="col-4 border" style="height: 750px;">
        <h2>Add New Subject</h2>
        <div v-if="errorMessageNew" class="alert alert-danger">{{ errorMessageNew }}</div>
        <div class="mb-3">
          <label class="form-label">Subject Name:</label>
          <input type="text" class="form-control" v-model="newSubject.name">
        </div>
        <div class="mb-3">
          <label class="form-label">Description:</label>
          <textarea class="form-control" rows="3" v-model="newSubject.description"></textarea>
        </div>
        <div class="mb-3 text-center">
          <button @click="createSubject" class="btn btn-primary">Create Subject</button>
        </div>
      </div>
    </div>
  
    <!--Modals-->
    <div v-if="showChapterModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Add Chapter</h4>
        <div class="mb-3">
          <label>Chapter Name:</label>
          <input type="text" class="form-control" v-model="newChapter.name">
        </div>
        <div class="mb-3">
          <label>Description:</label>
          <textarea class="form-control" rows="3" v-model="newChapter.description"></textarea>
        </div>
        <button @click="createChapter" class="btn btn-success">Create Chapter</button>
        <button @click="showChapterModal = false" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  
    <div v-if="showQuizModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Add Quiz</h4>
        <div class="mb-3">
          <label>Time Duration (HH:MM):</label>
          <input type="text" class="form-control" v-model="newQuiz.time_duration">
        </div>
        <div class="mb-3">
          <label>Remarks:</label>
          <input type="text" class="form-control" v-model="newQuiz.remarks">
        </div>
        <button @click="createQuiz" class="btn btn-success">Create Quiz</button>
        <button @click="showQuizModal = false" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  
    <div v-if="showQuestionModal" class="modal-overlay">
      <div class="modal-content">
        <h4>Add Question</h4>
        <div class="mb-3">
          <label>Question Statement:</label>
          <textarea class="form-control" rows="3" v-model="newQuestion.question_statement"></textarea>
        </div>
        <div class="mb-3" v-for="(opt, index) in ['option1','option2','option3','option4']" :key="index">
          <label>{{ opt }}:</label>
          <input type="text" class="form-control" v-model="newQuestion[opt]">
        </div>
        <div class="mb-3">
          <label>Correct Option (e.g., option1):</label>
          <input type="text" class="form-control" v-model="newQuestion.correct_option">
        </div>
        <button @click="createQuestion" class="btn btn-success">Create Question</button>
        <button @click="showQuestionModal = false" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  </div>`,
  data() {
    return {
      userData: {},
      subjects: [],
      newSubject: { name: "", description: "" },
      errorMessage: "",
      errorMessageNew: "",
      showChapterModal: false,
      showQuizModal: false,
      showQuestionModal: false,
      currentSubjectId: null,
      currentChapterId: null,
      currentQuizId: null,
      newChapter: { name: "", description: "" },
      newQuiz: { time_duration: "", remarks: "" },
      newQuestion: { question_statement: "", option1: "", option2: "", option3: "", option4: "", correct_option: "" }
    }
  },
  mounted() {
    this.loadUser();
    this.loadSubjects();
  },
  methods: {
    // for subject
    createSubject() {
      fetch('/api/subject/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(this.newSubject)
      })
      .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.message) });
        return response.json();
      })
      .then(() => {
        this.loadSubjects();
        this.newSubject = { name: "", description: "" };
      })
      .catch(error => { this.errorMessageNew = error.message });
    },
    loadSubjects() {
      fetch('/api/subject/get', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .then(data => {
        Promise.all(data.map(subject => {
          return this.loadChapters(subject).then(chapters => {
            subject.chapters = chapters;
            return subject;
          });
        })).then(subjectsWithChapters => {
          this.subjects = subjectsWithChapters;
        });
      })
      .catch(error => { this.errorMessage = error.message });
    },
    deleteSubject(id) {
      fetch(`/api/subject/delete/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      }).then(() => this.loadSubjects());
    },
  
    // for Chapter
    openAddChapterModal(subjectId) {
      this.currentSubjectId = subjectId;
      this.newChapter = { name: "", description: "" };
      this.showChapterModal = true;
    },
    createChapter() {
      const payload = { ...this.newChapter, subject_id: this.currentSubjectId };
      fetch('/api/chapter/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.message) });
        return response.json();
      })
      .then(() => {
        this.showChapterModal = false;
        this.loadSubjects();
      })
      .catch(error => { console.error("Error creating chapter:", error.message) });
    },
    deleteChapter(chapterId) {
      fetch(`/api/chapter/delete/${chapterId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      }).then(() => this.loadSubjects());
    },
    loadChapters(subject) {
      return fetch(`/api/chapter/get?subject_id=${subject.id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .then(chapters => {
        return Promise.all(chapters.map(chapter => {
          return this.loadQuizzes(chapter).then(quizzes => {
            chapter.quizzes = quizzes;
            return chapter;
          });
        }));
      })
      .catch(error => { console.error("Error loading chapters:", error.message); return [] });
    },
  
    // for Quizz
    openAddQuizModal(chapterId) {
      this.currentChapterId = chapterId;
      this.newQuiz = { time_duration: "", remarks: "" };
      this.showQuizModal = true;
    },
    createQuiz() {
      const payload = { ...this.newQuiz, chapter_id: this.currentChapterId };
      fetch('/api/quiz/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.message) });
        return response.json();
      })
      .then(() => {
        this.showQuizModal = false;
        this.loadSubjects();
      })
      .catch(error => { console.error("Error creating quiz:", error.message) });
    },
    deleteQuiz(quizId) {
      fetch(`/api/quiz/delete/${quizId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      }).then(() => this.loadSubjects());
    },
    loadQuizzes(chapter) {
      return fetch(`/api/quiz/get?chapter_id=${chapter.id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .then(quizzes => {
        return Promise.all(quizzes.map(quiz => {
          return this.loadQuestions(quiz).then(questions => {
            quiz.questions = questions;
            return quiz;
          });
        }));
      })
      .catch(error => { console.error("Error loading quizzes:", error.message); return [] });
    },
  
    // for questions
    openAddQuestionModal(quizId) {
      this.currentQuizId = quizId;
      this.newQuestion = { question_statement: "", option1: "", option2: "", option3: "", option4: "", correct_option: "" };
      this.showQuestionModal = true;
    },
    createQuestion() {
      const payload = { ...this.newQuestion, quiz_id: this.currentQuizId };
      fetch('/api/question/create', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) return response.json().then(err => { throw new Error(err.message) });
        return response.json();
      })
      .then(() => {
        this.showQuestionModal = false;
        this.loadSubjects();
      })
      .catch(error => { console.error("Error creating question:", error.message) });
    },
    deleteQuestion(questionId) {
      fetch(`/api/question/delete/${questionId}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      }).then(() => this.loadSubjects());
    },
    loadQuestions(quiz) {
      return fetch(`/api/question/get?quiz_id=${quiz.id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .catch(error => { console.error("Error loading questions:", error.message); return [] });
    },
  
    // data 
    loadUser() {
      fetch('/api/home', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .then(data => { this.userData = data; })
      .catch(error => { console.error("Error loading user data:", error.message); });
    },
    csvExport(){
      fetch('/api/export')
      .then(response => response.json())
      .then(data => {
        window.location.href = `/api/csv_result/${data.id}`
      })
    }
  }
}
