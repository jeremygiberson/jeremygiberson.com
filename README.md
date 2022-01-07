# jeremygiberson.com home page

* Built with [Create React App](https://github.com/facebook/create-react-app), hosted by [GitHub Pages](https://pages.github.com/) using [react-gh-pages](https://github.com/gitname/react-gh-pages) and influenced by [jekyll static site generate](https://jekyllrb.com/) and other important dependences. See `package.json` for the list.
* Open source because it can be (no sensitive info needed) and because I think it's a neat way to run a personal site

### Features
* React single page app
* Site content is just a collection of markdown files
* my "blogging" flow is: 
   1. `yarn run add-post "something i'm thinking about right now"` -> creates a file in `src/_pages` like `YYYY-MM-DD-something-im-thinking-about-right-now.md`
   2. I edit `src/_pages/YYYY-MM-DD-something-im-thinking-about-right-now.md` and write my thoughts down using Markdown.
   3. `git commit -m "added a new post"` and `git push origin master`
   4. GitHub Action will compile && publish the static site
      * parse _posts into a javascript file that is included by the react app
      * build react app
      * commit the changes to a target `gh-pages` branch
   5. GitHub pages renders the repositories `gh-pages` branch. The `jeremygiberson.com` cname points to the github pages url. 

This seems pretty close to my ideal workflow. 