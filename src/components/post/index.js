import {useState, useEffect} from 'react';
import {useRouteMatch} from "react-router-dom";
import Markdown from 'markdown-to-jsx';
import {Sidebar} from "../sidebar";
import routes from '../../routes';

export const Post = () => {
  let match = useRouteMatch();
  let [post, setPost] = useState(null);

  useEffect(() => {
    let route = routes.filter(r => r.path === match.url).pop();
    setPost(atob(route.content));
  }, [match.url]);

  if(!post){ return (<div>loading ...</div>)}

  return (
    <div className={'container'}>
      <div className="row g-5">
        <div className="col-md-8">
          <Markdown
            children={post}
            options={{
              overrides: {},
            }}
          />
        </div>

        <div className="col-md-4">
          <Sidebar/>
        </div>
      </div>
    </div>

  )
}