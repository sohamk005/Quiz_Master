export default {
    template: `
    <div>
      <h2 class="my-2 text-center">Update Subject Details</h2>
      <div class="row border" style="width:500px; margin: auto; height: 750px;">
        <div class="col p-3">
          <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
          <div class="mb-3">
            <label class="form-label">Subject Name:</label>
            <input type="text" class="form-control" v-model="subData.name">
          </div>
          <div class="mb-3">
            <label class="form-label">Description:</label>
            <textarea class="form-control" rows="3" v-model="subData.description"></textarea>
          </div>
          <div class="text-center">
            <button @click="updateSub" class="btn btn-primary">Update</button>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
      return {
        subData: { name: "", description: "" },
        errorMessage: ""
      }
    },
    mounted() {
      const subjectId = this.$route.params.id;
      fetch(`/api/subject/get?id=${subjectId}`, {
        method: 'GET',
        headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth_token") }
      })
      .then(response => response.json())
      .then(data => { this.subData = data[0]; })
      .catch(error => { this.errorMessage = error.message; });
    },
    methods: {
      updateSub() {
        const subjectId = this.$route.params.id;
        fetch(`/api/subject/update/${subjectId}`, {
          method: 'PUT',
          headers: { "Content-Type": "application/json", "Authentication-Token": localStorage.getItem("auth_token") },
          body: JSON.stringify(this.subData)
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
  