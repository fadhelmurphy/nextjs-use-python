const fs = require('node:fs');
const path = require('node:path');
const fse = require('fs-extra');
const cp = require("child_process");

function copyCurrentDirectoryToDist(filePath: string) {

    fse.copySync(filePath, filePath + '.original');

    const content = fse.readFileSync(filePath, "utf8");
    const isServerActionFile = content.startsWith('\'use server\'');

    const splits = content.split(/'use python'/);
    
    let result = splits[0];
    for (let i = 1; i < splits.length; i++) {
        const endOfpythonCode = findClosingBrace(splits[i]);
        const pythonCode = splits[i].slice(0, endOfpythonCode);
        if (!isServerActionFile) {
            result += `"use server";\n`;
        }
        const pythonFilePath = 'temp.py';
        fs.writeFileSync(pythonFilePath, pythonCode);
        
        const transpilerCommand = `python "${pythonFilePath}"`;
        result += cp.execSync(transpilerCommand).toString().replace(/(.+)/g, '"$1"')
        result += splits[i].slice(endOfpythonCode, splits[i].length);
        fs.unlinkSync(pythonFilePath);
    }
    fse.writeFileSync(filePath, result, "utf8")
}

function findClosingBrace(string: String) {
    let codeBlocksCounter = 0;
    let characterCounter = 0;
    while (characterCounter < string.length) {
        const ch = string[characterCounter];
        if (ch === "{") codeBlocksCounter++;
        else if (ch === "}") codeBlocksCounter--;
        if (codeBlocksCounter == -1) return characterCounter;
        characterCounter++;
    }
    return null;
}

function resetToOriginalState(filePath: string) {
    const path = require('node:path');
    const fse = require('fs-extra');
    const finalFileName = filePath.replace('.original', '');
    fse.removeSync(finalFileName);
    fse.moveSync(filePath, finalFileName);
}

function build() {

    fromDir(path.join(__dirname, 'src'), '.js', copyCurrentDirectoryToDist);
    fromDir(path.join(__dirname, 'src'), '.tsx', copyCurrentDirectoryToDist);

    try {
        const output = cp.execSync('next build',{ encoding: 'utf-8' });
        console.log(output);
    } catch (e) {
        console.log(e);
    } finally {
        console.log('cleanup');
        fromDir(path.join(__dirname, 'src'), '.js.original', resetToOriginalState);
        fromDir(path.join(__dirname, 'src'), '.tsx.original', resetToOriginalState);
    }
}

function fromDir(startPath: any, filter: any, callback: any) {

    if (!fs.existsSync(startPath)) {
        console.log("no dir ", startPath);
        return;
    }

    var files = fs.readdirSync(startPath);
    for (var i = 0; i < files.length; i++) {
        var filename = path.join(startPath, files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory() && filename.startsWith('node_modules') === false && filename.startsWith('.next') === false) {
            fromDir(filename, filter, callback); //recurse
        } else if (filename.endsWith(filter)) {
            callback(filename);
        };
    };
};


build();

