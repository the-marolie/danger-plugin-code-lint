const { ESLint } = require('eslint');
const stylelint = require('stylelint');

const codeLint = async (options) => {
  const eslint = new ESLint();
  const files = danger.git.created_files.concat(danger.git.modified_files);

  if (options.js) {
    const jsFiles = files.filter(path => path.endsWith('.js'));
    for (const file of jsFiles) {
      const results = await eslint.lintFiles(file);
      const formatter = await eslint.loadFormatter('stylish');
      const resultText = formatter.format(results);
      if (results.some(result => result.errorCount > 0)) {
        fail(`ESLint failed for ${file}`);
        console.log(resultText);
      }
      else {
        message(`ESLint passed for ${file}`);
      }
    }
  }

  if (options.css || options.scss) {
    const cssFiles = files.filter(path => path.endsWith('.css') || path.endsWith('.scss'));
    for (const file of cssFiles) {
      const result = await stylelint.lint({ files: file });
      if (result.errored) {
        fail(`Stylelint failed for ${file}`);
        console.log(result.output);
      }

      else {
        message(`Stylelint passed for ${file}`);
      }
    }
  }
};

(async () => {
  await codeLint({ js: true, css: true, scss: true });
})();

module.exports = { codeLint };
