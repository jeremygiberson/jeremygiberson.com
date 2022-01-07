# creating a jekyll inspired react powered static site for my homepage
So it's that time again, where I'm shopping around for my next career opportunity and realize that through the years of gainful employment I've neglected my personal site.

### aside
I think the main reason I neglect blogging, is that the workflow for blogging has never quite met my satisfaction. Going to a site, logging in, "Managing" content by drafting and publishing posts. 
It just doesn't match my day-to-day developer workflow. On a branch, make some changes, commit some changes. Also, I really like the idea of
using markdown as my text markup language. 

Jekyllrb was the first static site generator that I ran into a few years ago that seemed to come pretty close. I liked how content was managed as a series of markdown files and the content
was managed by reflecting on the filename to determine date and title information. Even better, because it compiled to a static site, it was ideal for being hosted by the new GitHub Pages feature.

I did experiment with using it for my site earlier, but didn't end up using it. I think the last piece of the mechanism, is that I wanted my site to be run on something I built -- even if it wasn't apparent.
Just felt like using an existing blog platform on my site didn't really represent my developer nature.

### back on topic
It felt necessary to refresh my site and potentially add some new content. 

I decided to try find or create a workflow that check all my wishlist boxes.
- [ ] a thing I made
- [ ] content is simple text w/ markdown flavoring
- [ ] a workflow I enjoyed

I knew that I wanted my workflow to resemble `make changes -> git commit -> git push`, and had an inkling that I'd like to use GitHub pages to render the site.
But I also wanted react to be involved, because its fun. So I started researching using react w/ github pages.
Rather quickly, I stumbled across a project that specifically handled the workflow of building your react app, and publishing the build artifacts to a branch that GitHub pages rendered.

But the next bit, was that I still wanted to make creating new pages to be a simple as authoring markdown files.

Neatly, the solution to the above will serve two checkmarks. Content is text w/ markdown flavoring and solving it is enough to qualify being "a thing I made".

### Solution overview
Borrowing from how Jekyllrb worked, I'll create a script that will iterate a directory collecting `.md` files. Each file will use a naming convention of
`YYYY-MM-DD-Title.md`. The script will compile a javascript file that exports an object representation of the posts. From there, using `react-router` I'll provide routes for rendering lists of posts, and the post content. 
The post content will be rendered by a component that takes markdown text and renders as HTML dom. 

Because remembering conventions is hard, I'll add a simple npm script `add-post` that I can run to generate a new markdown file for me w/ the correct naming convention and in the correct folder.

Then using GitHub actions and the react-gh-pages tool, on merges to master, the site will be compiled and published for GitHub pages rendering.

For details, see the [source of this site]()

### Features 
So, the features of my new website are essentially:

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