export default {
  template: `
  <div>
    <h2 class="my-2 text-center">Update Question Details</h2>
    <div class="row border" style="width:600px; margin: auto; height: 750px;">
      <div class="col p-3">
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div class="mb-3">
          <label class="form-label">Quiz ID:</label>
          <input type="number" class="form-control" v-model="quesData.quiz_id" disabled>
        </div>
        <div class="mb-3">
          <label class="form-label">Question Statement:</label>
          <textarea class="form-control" rows="3" v-model="quesData.question_statement"></textarea>
        </div>
        <div class="mb-3" v-for="(opt, index) in ['option1','option2','option3','option4']" :key="index">
          <label class="form-label">{{ opt }}:</label>
          <input type="text" class="form-control" v-model="quesData[opt]">
        </div>
        <div class="mb-3">
          <label class="form-label">Correct Option (e.g., option1):</label>
          <input type="text" class="form-control" v-model="quesData.correct_option">
        </div>
        <div class="text-center">
          <button @click="updateQues" class="btn btn-primary">Update</button>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      quesData: { quiz_id: null, question_statement: "", option1: "", option2: "", option3: "", option4: "", correct_option: "" },
      errorMessage: ""
    }
  },
  mounted() {
    const questionId = this.$route.params.id;
    fetch(`/api/question/get?id=${questionId}`, {
      method: 'GET',
      headers: { 
        "Content-Type": "application/json",
        "Authentication-Token": localStorage.getItem("auth_token")
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        this.quesData = data[0];
      } else {
        this.errorMessage = "Question not found.";
      }
    })
    .catch(error => { this.errorMessage = error.message; });
  },
  methods: {
    updateQues() {
      const questionId = this.$route.params.id;
      const payload = {
        quiz_id: this.quesData.quiz_id,
        question_statement: this.quesData.question_statement,
        option1: this.quesData.option1,
        option2: this.quesData.option2,
        option3: this.quesData.option3,
        option4: this.quesData.option4,
        correct_option: this.quesData.correct_option
      };
      fetch(`/api/question/update/${questionId}`, {
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
