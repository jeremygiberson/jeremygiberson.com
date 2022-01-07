const fs = require('fs');
const constants = require('./constants');
const assert = require('assert');
const path = require('path');
const formatDate = require('format-date');

(async () => {
  let title = process.argv[2];
  assert(title, 'page title must be specified');
  let title_no_spaces = title.replace(/\s/g, '-');
  let safe_title = title_no_spaces.replace(/[^A-Z-a-z0-9-]/g, '');

  let date = formatDate('{year}-{month}-{day}', new Date());
  let file_name = `${date}-${safe_title}.md`;
  let file_path = path.resolve(constants.post_dir, file_name);
  fs.writeFileSync(file_path, `# ${title}\nWrite some stuff about it...`);

  console.log('created post at', file_path);
})();