import Root from "./Root/Root";
import Login from "./components/Login"
import Register from "./components/Register"
import CardTask from "./components/CardTask"
import TaskForm from "./components/TaskForm";
import PrincipalMain from "./pages/PrincipalMain";
import PageTask from "./pages/PageTask";

customElements.define('task-form', TaskForm);
customElements.define('root-element', Root);
customElements.define('login-form', Login);
customElements.define('register-form', Register);
customElements.define('card-task', CardTask);
customElements.define('task-page', PageTask);
customElements.define('main-page', PrincipalMain);