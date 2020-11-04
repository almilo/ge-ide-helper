const {find} = require('shelljs');

const SOURCE_FILE_EXTENSIONS = ['.java', '.groovy'];

const projectRootDirectory = process.argv[2] || process.cwd();
const isSourceFile = filePath => SOURCE_FILE_EXTENSIONS.find(sourceFileExtension => filePath.endsWith(sourceFileExtension));
const allProjectSourceFilePaths = find(projectRootDirectory).filter(isSourceFile);

exports.projectRootDirectory = projectRootDirectory;

exports.getAllProjectFilePaths = function getAllProjectFilePaths() {
    return allProjectSourceFilePaths;
}

exports.getRelativeProjectFilePath = function getRelativeProjectFilePath(projectFilePath) {
    return projectFilePath.slice(projectRootDirectory.length + 1); // remove trailing slash
}
