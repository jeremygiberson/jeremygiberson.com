import {Link} from "react-router-dom";
import {toRoutePath} from "../../util";
import routes from '../../routes';
import {Elsewhere} from '../elsewhere';

let months_with_posts = new Set();
routes.forEach(r => {
  months_with_posts.add(JSON.stringify({year: r.year}))
});

let sorted_months_with_posts = Array.from(months_with_posts).map(a => JSON.parse(a)).sort((a, b) => {
  if(a.year < b.year) { return -1}
  if(a.year > b.year) { return 1}
  return 0;
}).reverse()

export const Sidebar = () => {
  return (
    <div className="position-sticky" style={{"top": "2rem"}}>
      <div className="p-4 mb-3 bg-light rounded">
        <h4 className="fst-italic">About</h4>
        <p className="mb-0">My blog. It's pretty light. I'll be honest, most of my teaching moments happen naturally through the course of the day interacting with co-workers or writing documentation. It's not very often I sit down and write something for my site. But it almost seems obligatory that I have <i>something</i> here.</p>
      </div>

      <div className="p-4">
        <h4 className="fst-italic">Archives</h4>
        <ol className="list-unstyled mb-0">
          {sorted_months_with_posts.map((mwp,i) => (
            <li key={i}><Link to={toRoutePath(mwp.year, mwp.month)}>{mwp.month} {mwp.year}</Link></li>
          ))}
          <li><Link to={toRoutePath()}>All posts</Link></li>
        </ol>

      </div>

      <div className="p-4">
        <h4 className="fst-italic">Elsewhere</h4>
        <Elsewhere/>
      </div>
    </div>
  )
}