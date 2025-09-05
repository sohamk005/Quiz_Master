export default {
  template:
  `
  <div>
    <h2 class="my-2">Quiz Attempt: {{ quizData.id }}</h2>
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
    <div v-if="quizData && questions.length">
      <div v-for="(question, index) in questions" :key="question.id" class="card my-2">
        <div class="card-body">
          <h5>Question {{ index + 1 }}:</h5>
          <p>{{ question.question_statement }}</p>
          <div v-for="opt in options(question)" :key="question.id + '-' + opt">
            <input type="radio" :id="question.id + opt" :value="opt" v-model="userAnswers[question.id]">
            <label :for="question.id + opt">{{ opt }}: {{ question[opt] }}</label>
          </div>
        </div>
      </div>
      <div class="text-center">
        <p>Time Remaining: {{ timerDisplay }}</p>
        <button @click="submitQuiz" class="btn btn-success">Submit Quiz</button>
      </div>
    </div>
    <div v-else>
      <p>Loading quiz...</p>
    </div>
  </div>`,
  data() {
    return {
      quizData: {},
      questions: [],
      userAnswers: {},
      timer: 0,
      timerDisplay: "",
      errorMessage: ""
    };
  },
  mounted() {
    const quizId = this.$route.params.id;
    fetch(`/api/quiz/get?id=${quizId}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authentication-Token": localStorage.getItem("auth_token")
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        this.quizData = data[0];
        this.loadQuestions();
        this.startTimer();
      } else {
        this.errorMessage = "Quiz not found.";
      }
    })
    .catch(error => { this.errorMessage = error.message; });
  },
  methods: {
    options(question) {
      return ["option1", "option2", "option3", "option4"];
    },
    loadQuestions() {
      const quizId = this.quizData.id;
      fetch(`/api/question/get?quiz_id=${quizId}`, {
        method: 'GET',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        }
      })
      .then(response => response.json())
      .then(data => {
        this.questions = data;
      })
      .catch(error => { this.errorMessage = error.message; });
    },
    startTimer() {
      const [hours, minutes] = this.quizData.time_duration.split(':').map(Number);
      this.timer = (hours * 3600) + (minutes * 60);
      this.updateTimerDisplay();
      const interval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
          this.updateTimerDisplay();
        } else {
          clearInterval(interval);
          this.submitQuiz();
        }
      }, 1000);
    },
    updateTimerDisplay() {
      const h = Math.floor(this.timer / 3600);
      const m = Math.floor((this.timer % 3600) / 60);
      const s = this.timer % 60;
      this.timerDisplay = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    },
    submitQuiz() {
      if (!this.quizData || !this.quizData.id) {
        this.errorMessage = "Quiz data is not loaded. Please try again.";
        return;
      }
      let userId = localStorage.getItem("id");
      if (!userId) {
        this.errorMessage = "User not logged in!";
        return;
      }
      userId = parseInt(userId);

      let score = 0;
      this.questions.forEach(q => {
        if (this.userAnswers[q.id] === q.correct_option) {
          score++;
        }
      });

      const payload = {
        quiz_id: this.quizData.id,
        user_id: userId,
        total_scored: score
      };

      fetch('/api/score', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        alert(`Quiz submitted! Your score: ${score}`);
        fetch(`/api/quiz/update/${this.quizData.id}`, {
          method: 'PUT',
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          },
          body: JSON.stringify({
            status: 0,
            chapter_id: this.quizData.chapter_id,
            time_duration: this.quizData.time_duration,
            remarks: this.quizData.remarks,
            date_of_quiz: this.quizData.date_of_quiz
          })
        })
        .then(res => res.json())
        .then(updateData => {
          this.$router.push("/userDash");
        })
        .catch(err => {
          console.error("Error updating quiz status:", err.message);
          this.errorMessage = err.message;
        });
      })
      .catch(error => { 
        this.errorMessage = error.message; 
      });
    }
  }
}
