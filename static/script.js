import Home from './components/Home.js'
import Login from './components/Login.js'
import Register from './components/Register.js'
import Navbar from './components/Navbar.js'
import Footer from './components/Footer.js'
import Dashboard from './components/Dashboard.js'
import UpdateSub from './components/UpdateSub.js'
import UserDash from './components/UserDash.js'
import UpdateChap from './components/UpdateChap.js'
import UpdateQuiz from './components/UpdateQuiz.js'
import UpdateQues from './components/UpdateQues.js'
import QuizAttempt from './components/QuizAttempt.js'
import SearchComponent from './components/SearchComponent.js'
import SearchPage from './components/SearchPage.js'




const routes = [
    {path: "/", component: Home},
    {path: "/login", component: Login},
    {path: "/register", component: Register},
    {path: "/dashboard", component: Dashboard},
    {path: "/updateSub/:id",name: "updateSub", component: UpdateSub},
    {path: "/userDash", component: UserDash},
    {path: "/updateChap/:id", name: "updateChap", component: UpdateChap},
    {path: "/updateQuiz/:id", name: "updateQuiz", component: UpdateQuiz},
    {path: "/updateQues/:id", name: "updateQues", component: UpdateQues},
    {path: "/quizAttempt/:id", name: "quizAttempt", component: QuizAttempt},
    {path: "/search", name: "search", component: SearchComponent},
    {path: "/search", component: SearchPage},
]

const router = new VueRouter({
    routes
})

const app = new Vue({
    el: "#app",
    router,
    template: 
    `<div class="container">
        <nav-bar :loggedIn = 'loggedIn' @logout="handleLogout"></nav-bar>
        <router-view :loggedIn = 'loggedIn' @login="handleLogin"></router-view>
        <foot></foot>
    </div>
    `,
    data: {
        loggedIn: false
    },
    components: {
        "nav-bar": Navbar,
        "foot": Footer
    },
    methods:{
        handleLogout(){
            this.loggedIn = false
        },
        handleLogin(){
            this.loggedIn = true
        }
    }
})