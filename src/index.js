const { ESLint } = require('eslint');
const stylelint = require('stylelint');

const stylelintConfig = {
    rules: {
      "at-rule-no-unknown": null,
      "scss/at-rule-no-unknown": true,
      "block-no-empty": null,
      "unit-whitelist": ["em", "rem", "s", "px", "deg", "%", "vh", "vw"]
    }
  };

const fixLintingErrors = async () => {
  // Implement the code to fix linting errors and commit changes to the PR
  const eslint = new ESLint();
  const files = danger.git.created_files.concat(danger.git.modified_files);

  // Fix JavaScript linting errors
  const jsFiles = files.filter(path => path.endsWith('.js'));
  for (const file of jsFiles) {
    const results = await eslint.lintFiles(file);
    const fixableResults = results.filter(result => result.fixable);
    if (fixableResults.length > 0) {
      await ESLint.outputFixes(fixableResults);
    }
  }

  // Fix CSS/SCSS linting errors
  const cssFiles = files.filter(path => path.endsWith('.css') || path.endsWith('.scss'));
  for (const file of cssFiles) {
    const result = await stylelint.lint({ files: file, fix: true });
    if (!result.errored) {
      // Write fixed content back to file
      await danger.github.utils.createOrUpdateFile(file, result.output);
    }
  }

  // Commit changes to the PR
  await danger.git.exec("git", ["add", ...jsFiles, ...cssFiles]);
  await danger.git.exec("git", ["commit", "-m", "Fix linting errors"]);
};

const codeLint = async (options) => {
  const eslint = new ESLint();
  const files = danger.git.created_files.concat(danger.git.modified_files);
  let lintErrors = false;

  if (options.js) {
    const jsFiles = files.filter(path => path.endsWith('.js'));
    for (const file of jsFiles) {
      const results = await eslint.lintFiles(file);
      const formatter = await eslint.loadFormatter('stylish');
      const resultText = formatter.format(results);
      if (results.some(result => result.errorCount > 0)) {
        fail(`ESLint failed for ${file}`);
        console.log(resultText);
        lintErrors = true;
      }
      else {
        message(`ESLint passed for ${file}`);
      }
    }
  }

  if (options.css || options.scss) {
    const cssFiles = files.filter(path => path.endsWith('.css') || path.endsWith('.scss'));
    for (const file of cssFiles) {
      const result = await stylelint.lint({
        files: file,
        config: stylelintConfig
      });
      if (result.errored) {
        fail(`Stylelint failed for ${file}`);
        console.log(result.output);
        lintErrors = true;
      }
      else {
        message(`Stylelint passed for ${file}`);
      }
    }
  }

  if (lintErrors) {
    const fixButtonMarkdown = `
  <button style="background-color: #007bff; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;" onclick="fixLintingErrors()">Fix Linting Errors</button>
  <script>
    async function fixLintingErrors() {
      await fixLintingErrors();
      // Provide feedback to the user
      message("Linting errors fixed and committed successfully!");
    }
  </script>
`;
markdown(fixButtonMarkdown);
  }
};

(async () => {
  await codeLint({ js: true, css: true, scss: true });
})();

module.exports = { codeLint };
