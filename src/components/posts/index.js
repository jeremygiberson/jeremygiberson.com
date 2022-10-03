import {useState} from "react";
import {useParams} from "react-router-dom";
import {toRoutePath} from "../../util";
import routes from '../../routes';
import {useEffect} from "react";
import {Link} from 'react-router-dom';
import {Sidebar} from "../sidebar";


// given route match for year, month, day, paginate available posts
export const Posts = () => {
  const {year, month, day} = useParams();
  const [posts, setPosts] = useState(null);
  let base_path = toRoutePath(year, month, day);
  console.log({year, month, day, base_path})

  useEffect(() => {
    setPosts(
      routes.filter(r => r.path.indexOf(base_path) === 0)
        .sort((a,b) =>{
          if(new Date(a.date).getTime() < new Date(b.date).getTime()) { return - 1}
          if(new Date(a.date).getTime() > new Date(b.date).getTime()) { return 1}
          return 0;
        }).reverse()
    )
  }, [base_path])

  if(posts === null) { return (<div>loading ...</div>)}

  return (
    <div className={'container'}>
      <div className="row g-5">
        <div className="col-md-8">
          <h1>Posts</h1>
          <ol>
            {posts.map((post,i) => (
              <li key={i}><Link to={post.path}>{post.title.replaceAll('-', ' ')}</Link></li>
            ))}
          </ol>
        </div>

        <div className="col-md-4">
          <Sidebar/>
        </div>
      </div>
    </div>
  )
}
