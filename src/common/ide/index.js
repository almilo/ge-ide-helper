const IDEA_API_FILE_BASE_URL = 'http://localhost:63342/api/file';

exports.getIdeOpenFileLink = function getIdeOpenFileLink(relativeProjectFilePath, maybeLineIndex) {
    const maybeLineIndexFragment = maybeLineIndex != null && maybeLineIndex !== -1 ? `:${maybeLineIndex + 1}` : ''; // line number is 1 based

    return `${IDEA_API_FILE_BASE_URL}/${relativeProjectFilePath}${maybeLineIndexFragment}`;
}
