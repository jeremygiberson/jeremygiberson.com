import {useEffect, useState} from "react";
import routes from '../../routes';
import {Link} from "react-router-dom";

export const RecentPosts = () => {
  let [recent, setRecent] = useState(null);
  useEffect(() => {
    setRecent(routes.sort((a, b) => {
      let a_date = new Date(a.date);
      let b_date = new Date(b.date);
      if(a_date.getTime() < b_date.getTime()) { return -1 }
      if(a_date.getTime() > b_date.getTime()) { return 1 }
      return 0
    }).reverse().slice(0, 5));
  }, []);

  if(!recent) { return (<div>loading ...</div>)}

  return (
    <>
      {recent.map((route, i) => (
          <li key={i}>
            <Link to={route.path}>{route.title}</Link>
          </li>
        )
      )}
    </>
  )
}