export default {
  template: `
  <div>
    <h2 class="my-2 text-center">Update Quiz Details</h2>
    <div class="row border" style="width:500px; margin: auto; height: 750px;">
      <div class="col p-3">
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div class="mb-3">
          <label class="form-label">Chapter ID:</label>
          <input type="number" class="form-control" v-model="quizData.chapter_id" disabled>
        </div>
        <div class="mb-3">
          <label class="form-label">Date of Quiz (YYYY-MM-DD):</label>
          <input type="text" class="form-control" v-model="quizData.date_of_quiz">
        </div>
        <div class="mb-3">
          <label class="form-label">Time Duration:</label>
          <input type="text" class="form-control" v-model="quizData.time_duration">
        </div>
        <div class="mb-3">
          <label class="form-label">Remarks:</label>
          <input type="text" class="form-control" v-model="quizData.remarks">
        </div>
        <div class="text-center">
          <button @click="updateQuiz" class="btn btn-primary">Update</button>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      quizData: { chapter_id: null, date_of_quiz: "", time_duration: "", remarks: "" },
      errorMessage: ""
    }
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
      } else {
        this.errorMessage = "Quiz not found.";
      }
    })
    .catch(error => { this.errorMessage = error.message; });
  },
  methods: {
    updateQuiz() {
      const quizId = this.$route.params.id;
      const payload = {
        chapter_id: this.quizData.chapter_id,
        date_of_quiz: this.quizData.date_of_quiz,
        time_duration: this.quizData.time_duration,
        remarks: this.quizData.remarks
      };
      fetch(`/api/quiz/update/${quizId}`, {
        method: 'PUT',
        headers: { 
          "Content-Type": "application/json", 
          "Authentication-Token": localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        this.$router.push("/dashboard");
      })
      .catch(error => { this.errorMessage = error.message; });
    }
  }
}
