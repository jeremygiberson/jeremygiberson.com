import {useRouteMatch} from "react-router-dom";
import Markdown from "markdown-to-jsx";
import pages from '../../pages.js';

export const Pages = () => {
  let match = useRouteMatch();
  console.log({pages, url: match.url})
  let page = pages.filter(p => p.path === match.url).pop();

  return (
    <div className={'container'}>
      <Markdown
        children={atob(page.content)}
        options={{
          overrides: {},
        }}
      />
    </div>
  )
}