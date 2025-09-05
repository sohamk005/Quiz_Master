export default {
  template:
  `
  <div>
    <h2 class="my-2">Welcome, {{ userData.username }} (User)!</h2>
    <div class="row">
      <!-- Left side: Available Subjects, Chapters, and Quizzes -->
      <div class="col-8 border" style="height: 750px; overflow-y: scroll">
        <h2>Available Subjects</h2>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-for="subject in subjects" :key="subject.id" class="card mt-2">
          <div class="card-body">
            <h5 class="card-title">{{ subject.name }}</h5>
            <p class="card-text">{{ subject.description }}</p>
            <div class="ml-3">
              <h6>Chapters:</h6>
              <div v-if="subject.chapters && subject.chapters.length">
                <div v-for="chapter in subject.chapters" :key="chapter.id" class="card mt-1">
                  <div class="card-body">
                    <h6 class="card-title">{{ chapter.name }}</h6>
                    <p class="card-text">{{ chapter.description }}</p>
                    <div class="ml-3">
                      <h6>Quizzes:</h6>
                      <div v-if="chapter.quizzes && chapter.quizzes.length">
                        <div v-for="quiz in chapter.quizzes" :key="quiz.id" class="card mt-1">
                          <div class="card-body">

                            <h6 class="card-title">
                              Quiz on {{ quiz.date_of_quiz }}
                              <button v-if="!isCompleted(quiz.id,quiz.time_stamp_of_attempt)" @click="startQuiz(quiz.id)" class="btn btn-success btn-sm ml-2">
                                Start Quiz
                              </button>
                              <span v-if="isCompleted(quiz.id,quiz.time_stamp_of_attempt)" class="badge bg-secondary ml-2">Completed</span>
                            </h6>



                            <p class="card-text">
                              Quiz ID: {{ quiz.id }}, Duration: {{ quiz.time_duration }}, Remarks: {{ quiz.remarks }}
                            </p>
                            <div class="ml-3">
                              <h6>Questions:</h6>
                              <div v-if="quiz.questions && quiz.questions.length">
                                <div v-for="q in quiz.questions" :key="q.id" class="card mt-1">
                                  <div class="card-body">
                                    <p class="card-text">{{ q.question_statement }}</p>
                                  </div>
                                </div>
                              </div>
                              <div v-else>
                                <p>No questions available.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <p>No quizzes available.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <p>No chapters available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Right side: Quiz History (Completed Quiz Attempts) -->
<div class="col-4 border" style="height: 750px; overflow-y: scroll">
  <h2>Quiz History</h2>
  
  <!-- If there are scores, show them -->
  <div v-if="scoreData.scores.length">
    <div v-for="score in scoreData.scores" :key="score.quiz_id" class="card mt-2">
      <div class="card-body">
        <h6 class="card-title">Quiz ID: {{ score.quiz_id }}</h6>
        <p class="card-text">Score: {{ score.score }}</p>
        <p class="card-text">Attempted on: {{ new Date(score.date).toLocaleString() }}</p>
      </div>
    </div>
  </div>

  <!-- If no scores, show message -->
  <div v-else>
    <p>No quiz attempts found.</p>
  </div>
</div>

      
        
  </div>`,

  data() {
    return {
      userData: {},
      subjects: [],
      errorMessage: "",
      completedQuizzes: [],
      scoreData: {}
    };
  },
  mounted() {
    this.loadUser().then(() => {
      if (this.userData && this.userData.id) {
        this.loadCompletedQuizzes();
      }
    });
    this.loadSubjects();
    this.loadscoreData();
  },
  watch: {
    '$route'(to, from) {
      if (this.userData && this.userData.id) {
        this.loadCompletedQuizzes();
      }
    }
  },
  methods: {
    loadUser() {
      return fetch('/api/home', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .then(data => { 
        this.userData = data; 
        if (this.userData && this.userData.id) {
          this.loadCompletedQuizzes();
        }
      })
      .catch(error => { 
        console.error("Error loading user data:", error.message);
        this.errorMessage = error.message;
      });
    },
    loadscoreData() {
      return fetch('/api/scores', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .then(data => { 
        this.scoreData = data; 
        console.log(this.scoreData);
      })
      .catch(error => { 
        console.error("Error loading user data:", error.message);
        this.errorMessage = error.message;
      });
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
      .catch(error => { this.errorMessage = error.message; });
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
    loadCompletedQuizzes() {
      if (!this.userData || !this.userData.id) {
        console.error("User data not loaded; cannot load completed quizzes.");
        return;
      }
      fetch(`/api/score/${this.userData.id}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .then(data => { 
        console.log("Completed Quizzes:", data);
        this.completedQuizzes = data;
      })
      .catch(error => { 
        console.error("Error loading completed quizzes:", error.message);
      });
    },   
    isCompleted(quizId, quizDate) {
      const today = new Date();
      const quizAttemptDate = new Date(quizDate); 
      const attempted = this.scoreData.scores.some(score => Number(score.quiz_id) === Number(quizId));
      const isPastDue = today > quizAttemptDate.setDate(quizAttemptDate.getDate() + 1);
      return attempted || isPastDue;
    },    
    startQuiz(quizId) {
      if (this.isCompleted(quizId)) {
        alert("You have already completed this quiz.");
        return;
      }
      this.$router.push({ path: '/quizAttempt/' + quizId });
    }
  }
}
