const { ESLint } = require('eslint');
const stylelint = require('stylelint');
const fs = require('fs');

let lintErrors = false;
const stylelintConfig = {
    rules: {
      "at-rule-no-unknown": null,
      "scss/at-rule-no-unknown": true,
      "block-no-empty": null,
      "unit-whitelist": ["em", "rem", "s", "px", "deg", "%", "vh", "vw"]
    }
  };

  const checkLintingScript = () => {
    console.log('checkLintingScript')
    try {
      // Read the package.json file
      const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
      // Check if "lint" script is present
      if (packageJSON && packageJSON.scripts && packageJSON.scripts.lint) {
        markdown('## Linting Script Found');
        markdown('You can run the linting script using `npm run lint`');
      }
    } catch (error) {
      console.error('Error reading package.json:', error);
    }
  };

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
        console.log(result.report);
        lintErrors = true;
      }
      else {
        message(`Stylelint passed for ${file}`);
      }
    }
  }
  // if there are errors, show a markdown message explaining how to fix them
if (lintErrors) {
    markdown('## Linting Errors Found');
    markdown('Please fix the linting errors and push the changes again.');
    checkLintingScript();
  }
};



(async () => {
  await codeLint({ js: true, css: true, scss: true });
})();

module.exports = { codeLint };
