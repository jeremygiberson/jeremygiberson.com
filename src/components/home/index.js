import {BsPersonCircle} from 'react-icons/bs';
import {RecentPosts} from "../recentPosts";
import {Link} from 'react-router-dom';
import {Elsewhere} from "../elsewhere";

export const Home = () => {
  return (
    <div className="col-lg-8 mx-auto p-3 py-md-5">
      <header className="d-flex align-items-center pb-3 mb-5 border-bottom">
        <BsPersonCircle className="fs-4" style={{marginRight: '0.5rem'}}/>
        <a href="/" className="text-dark text-decoration-none">
          <span className="fs-4">Jeremy Giberson's Home Page</span>
        </a>
      </header>

      <main>
        <h1>Hey, thanks for visiting!</h1>
        <p className="fs-5 col-md-8">I've been in software development for almost two decades now, wearing all the hats from jr. dev to cloud architect, responsible for building out both infrastructure and software architecture for SaaS products. You're probably more interested in my resume or linkedin profile than some of the random things I've posted here. Otherwise, on rare occasion this page is updated with random tidbits.</p>

        <div className="mb-5">
          <Link to={"/pages/resume"} className="btn btn-primary btn-lg px-4">View Resume</Link>{' '}
          <a target={'_blank'} rel="noreferrer" href="https://www.linkedin.com/in/jeremy-giberson-a10ab832/" className="btn btn-secondary btn-lg px-4">View LinkedIn Profile</a>
        </div>

        <hr className="col-3 col-md-2 mb-5"/>

          <div className="row g-5">
            <div className="col-md-6">
              <h2>Links</h2>
              <p>other things jeremy-verse</p>
              <Elsewhere bullets={true}/>
            </div>

            <div className="col-md-6">
              <h2>Posts</h2>
              <p>Here's a list of some of the things I'm thinking about or working on</p>
              <ul className="icon-list">
                <RecentPosts/>
              </ul>
              <Link to={"/posts"}>Older articles</Link>
            </div>
          </div>
      </main>
      <footer className="pt-5 my-5 text-muted border-top text-center">
        Powered by a bunch of cool open source projects, wired together by me &middot; &lt;3<br/>
        <span className={'d-flex align-items-center justify-content-between'}>
          <a target={"_blank"} rel="noreferrer" href={"https://getbootstrap.com/"}>get bootstrap</a>
          <a target={"_blank"} rel="noreferrer" href={"https://create-react-app.dev/"}>create-react-app</a>
          <a target={"_blank"} rel="noreferrer" href={"https://github.com/gitname/react-gh-pages"}>react-gh-pages</a>
          <a target={"_blank"} rel="noreferrer" href={"https://jekyllrb.com/"}>jekyll</a>
        </span>
      </footer>
    </div>
  )
};