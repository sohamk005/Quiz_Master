export default {
  template: `
  <div>
    <h2 class="my-2 text-center">Update Chapter Details</h2>
    <div class="row border" style="width:500px; margin: auto; height: 750px;">
      <div class="col p-3">
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div class="mb-3">
          <label class="form-label">Chapter Name:</label>
          <input type="text" class="form-control" v-model="chapData.name">
        </div>
        <div class="mb-3">
          <label class="form-label">Description:</label>
          <textarea class="form-control" rows="3" v-model="chapData.description"></textarea>
        </div>
        
        <div class="mb-3">
          <label class="form-label">Subject ID:</label>
          <input type="text" class="form-control" v-model="chapData.subject_id" disabled>
        </div>
        <div class="text-center">
          <button @click="updateChap" class="btn btn-primary">Update</button>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      chapData: { name: "", description: "", subject_id: null },
      errorMessage: ""
    }
  },
  mounted() {
    const chapterId = this.$route.params.id;
    fetch(`/api/chapter/get?id=${chapterId}`, {
      method: 'GET',
      headers: { 
        "Content-Type": "application/json", 
        "Authentication-Token": localStorage.getItem("auth_token") 
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        this.chapData = data[0];
      } else {
        this.errorMessage = "Chapter not found.";
      }
    })
    .catch(error => { this.errorMessage = error.message; });
  },
  methods: {
    updateChap() {
      const chapterId = this.$route.params.id;
      const payload = {
        name: this.chapData.name,
        description: this.chapData.description,
        subject_id: this.chapData.subject_id 
      };
      fetch(`/api/chapter/update/${chapterId}`, {
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
