const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const sourceDirectory = "\\lib\\";
const testDirectory = "\\tests\\lib\\";

function activate(context) {
    console.log('Congratulations, your extension "test-file-toggler" is now active!');

    let disposable = vscode.commands.registerCommand('extension.sayHello', function () {
        const currentWorkingFile = vscode.window.activeTextEditor.document.fileName;

        if (!currentWorkingFile) {
            vscode.window.showInformationMessage("No current working file detected. Please close and reload current file, then try again.");
            return;
        }

        const rootPath = vscode.workspace.rootPath;
        const currentWorkingFileName = currentWorkingFile.replace(rootPath, "").trim();
        const isSourceFile = currentWorkingFileName.startsWith(sourceDirectory);
        const isTestFile = currentWorkingFileName.startsWith(testDirectory);

        if (!isSourceFile && !isTestFile) {
            vscode.window.showInformationMessage("File is not detected as either source or test file. Please check settings.");
            return;
        }

        if (isSourceFile) {
            const testFileName = currentWorkingFileName.replace(sourceDirectory, testDirectory);

            const filePath = rootPath + testFileName;

            vscode.workspace.openTextDocument(vscode.Uri.file(filePath))
                .then(
                    document => vscode.window.showTextDocument(document),
                    // In case of error, we assume file does not exist and create it.
                    () => createNewTestFile(filePath)
                )
        }
        else {
            const sourceFileName = currentWorkingFileName.replace(testDirectory, sourceDirectory);
            vscode.workspace.openTextDocument(vscode.Uri.file(rootPath + sourceFileName))
                .then(
                    document => vscode.window.showTextDocument(document),
                    // Ignore errors
                    () => {}
                )
        }

        return;
    });

    context.subscriptions.push(disposable);
}

exports.activate = activate;

function deactivate() {}

exports.deactivate = deactivate;

function createNewTestFile(filePath) {
    ensureDirectoryExistence(filePath)
    const createStream = fs.createWriteStream(filePath);
    createStream.end();

    vscode.workspace.openTextDocument(vscode.Uri.file(filePath))
        .then(document => vscode.window.showTextDocument(document))
}

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  }