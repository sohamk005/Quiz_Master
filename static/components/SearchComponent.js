export default {
    template: `
    <div>
      <h2 v-if="userData" class="my-2 text-center">Search</h2>
      <div class="row">
        <div class="col-6 offset-3">
          <input type="text" class="form-control" v-model="query" placeholder="Enter search term">
          <button @click="performSearch" class="btn btn-primary mt-2">Search</button>
          <div v-if="errorMessage" class="alert alert-danger mt-2">{{ errorMessage }}</div>
          <div v-if="results.length">
            <h4 class="mt-3">Results:</h4>
            <div v-for="result in results" :key="result.id" class="card mt-2">
              <div class="card-body">
                <h5>{{ result.name }}</h5>
                <p>{{ result.description }}</p>
              </div>
            </div>
          </div>
          <div v-else-if="!errorMessage && query">
            <p class="mt-3">No results found.</p>
          </div>
        </div>
      </div>
    </div>
    `,
    data() {
      return {
        query: "",
        results: [],
        errorMessage: ""
      }
    },
    methods: {
      performSearch() {
        fetch(`/api/search?q=${this.query}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": localStorage.getItem("auth_token")
          }
        })
        .then(response => response.json())
        .then(data => {
          this.results = data;
        })
        .catch(error => {
          this.errorMessage = error.message;
        });
      }
    }
  }
  