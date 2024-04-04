const eslint = require('eslint');
const stylelint = require('stylelint');

global.danger = {
    git: {
      created_files: ['file1.js', 'file2.css', 'file3.scss', 'file4.js'],
      modified_files: ['file5.js', 'file6.css', 'file7.scss']
    },
    fail: jest.fn()
  };
  
  
  jest.mock('eslint', () => ({
    CLIEngine: jest.fn().mockImplementation(() => ({
      executeOnFiles: jest.fn().mockReturnValue({ errorCount: 0, results: [] }),
      getFormatter: jest.fn().mockReturnValue(() => 'ESLint formatter output')
    }))
  }));
  
  jest.mock('stylelint', () => ({
    lint: jest.fn().mockResolvedValue({ errored: false, output: 'Stylelint output' })
  }));

// Import the function to be tested
const { lintCode } = require('./index');

describe('lintCode', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should lint JavaScript files when options.js is true', async () => {
    const options = { js: true, css: false, scss: false };
    await lintCode(options);

    expect(eslint.CLIEngine).toHaveBeenCalledTimes(1);
    expect(eslint.CLIEngine).toHaveBeenCalledWith();

    expect(eslint.CLIEngine().executeOnFiles).toHaveBeenCalledTimes(2);
    expect(eslint.CLIEngine().executeOnFiles).toHaveBeenCalledWith(['file1.js']);
    expect(eslint.CLIEngine().executeOnFiles).toHaveBeenCalledWith(['file4.js']);

    expect(eslint.CLIEngine().getFormatter).toHaveBeenCalledTimes(2);
    expect(eslint.CLIEngine().getFormatter).toHaveBeenCalledWith();

    expect(fail).not.toHaveBeenCalled();
    expect(consoleLog).toHaveBeenCalledTimes(2);
    expect(consoleLog).toHaveBeenCalledWith('ESLint formatter output');
  });

  it('should lint CSS and SCSS files when options.css or options.scss is true', async () => {
    const options = { js: false, css: true, scss: true };
    await lintCode(options);

    expect(stylelint.lint).toHaveBeenCalledTimes(2);
    expect(stylelint.lint).toHaveBeenCalledWith({ files: 'file2.css' });
    expect(stylelint.lint).toHaveBeenCalledWith({ files: 'file3.scss' });

    expect(fail).not.toHaveBeenCalled();
    expect(consoleLog).toHaveBeenCalledTimes(2);
    expect(consoleLog).toHaveBeenCalledWith('Stylelint output');
  });

  it('should not lint any files when options.js, options.css, and options.scss are all false', async () => {
    const options = { js: false, css: false, scss: false };
    await lintCode(options);

    expect(eslint.CLIEngine).not.toHaveBeenCalled();
    expect(stylelint.lint).not.toHaveBeenCalled();

    expect(fail).not.toHaveBeenCalled();
    expect(consoleLog).not.toHaveBeenCalled();
  });
});