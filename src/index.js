/**
 * Lints the code based on the provided options.
 * @param {Object} options - The linting options.
 * @param {boolean} options.js - Whether to lint JavaScript files.
 * @param {boolean} options.css - Whether to lint CSS files.
 * @param {boolean} options.scss - Whether to lint SCSS files.
 */
const { danger, fail } = require('danger');
const eslint = require('eslint');
const stylelint = require('stylelint');

const codeLint = async (options) => {
  const linter = new eslint.CLIEngine();
  const files = danger.git.created_files.concat(danger.git.modified_files);

  if (options.js) {
    const jsFiles = files.filter(path => path.endsWith('.js'));
    for (const file of jsFiles) {
      const report = linter.executeOnFiles([file]);
      const formatter = linter.getFormatter();
      if (report.errorCount > 0) {
        fail(`ESLint failed for ${file}`);
        console.log(formatter(report.results));
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
    }
  }
};

(async () => {
  await codeLint({ js: true, css: true, scss: true });
})();

module.exports = { codeLint };