import {Home} from "./components/home";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import {Post} from "./components/post";
import {Posts} from "./components/posts";
import {BsCodeSquare} from "react-icons/bs";
import {Pages} from "./components/pages";

function App() {
  return (
    <Router>
      <div>

        <header className="d-flex align-items-center p-1 mb-3 border-bottom">
          <BsCodeSquare className="" style={{margin: '0 0.5rem'}}/>
          <Link to="/" className="text-dark">
            jeremygiberson.com
          </Link>
        </header>


        <Switch>
          <Route path={"/"} exact={true} component={Home}/>
          <Route path={"/posts"} exact={true} component={Posts}/>
          <Route path={"/posts/:year"} exact={true} component={Posts}/>
          <Route path={"/posts/:year/:month"} exact={true} component={Posts}/>
          <Route path={"/posts/:year/:month/:day"} exact={true} component={Posts}/>
          <Route path={"/posts/:year/:month/:day/:title"} exact={true} component={Post}/>

          <Route path={"/pages/:title"} exact={true} component={Pages}/>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
