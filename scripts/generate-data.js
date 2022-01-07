const fs = require('fs');
const constants = require('./constants');
const path = require('path');

const routes = [];
const pages = [];
(async () => {
    const post_files = await fs.promises.readdir( constants.post_dir );

    // Loop them all with the new for...of
    for( const file of post_files ) {
      // Get the full paths
      console.log('processing', file);
      let file_path = path.resolve(constants.post_dir, file);
      let [year, month, day, ...rest] = file.replace(/\.md/g, '').split('-');
      let title = rest.join('-');
      routes.push({
        title,
        day, month, year,
        date: `${year}-${month}-${day}`,
        path: `/posts/${year}/${month}/${day}/${title}`,
        content: fs.readFileSync(file_path).toString('base64')
      })
      // const fromPath = path.join(moveFrom, file);
      // const toPath = path.join(moveTo, file);
    }
    let routes_path = path.resolve(constants.routesjs_dir, 'routes.js');
    let content = `module.exports = ${JSON.stringify(routes, null, 2)}`;
    fs.writeFileSync(routes_path, content);

    console.log('wrote routes to', routes_path);



  const page_files = await fs.promises.readdir( constants.pages_dir );

  // Loop them all with the new for...of
  for( const file of page_files ) {
    // Get the full paths
    console.log('processing', file);
    let file_path = path.resolve(constants.pages_dir, file);
    let title = file.replace(/\.md/g, '').split('-');

    pages.push({
      title: title.join(' '),
      path: `/pages/${title.join('-')}`,
      content: fs.readFileSync(file_path).toString('base64')
    })
  }
  let pages_path = path.resolve(constants.pagesjs_dir, 'pages.js');
  let pages_content = `module.exports = ${JSON.stringify(pages, null, 2)}`;
  fs.writeFileSync(pages_path, pages_content);

  console.log('wrote pages to', pages_path);
})();