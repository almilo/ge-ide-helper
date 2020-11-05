const fs = require('fs');
const {parse, stringify} = require('querystring');
const express = require('express');
const {getAllProjectFilePaths, getRelativeProjectFilePath} = require('../../common/project');
const {getIdeOpenFileLink} = require('../../common/ide');

const BASE_PATH_FRAGMENT = 'java-based-test';
const GET_LINKS_PATH_FRAGMENT = `${BASE_PATH_FRAGMENT}/get-ide-links`;
const OPEN_PATH_FRAGMENT = `${BASE_PATH_FRAGMENT}/open`;
const CLASSNAME_QUERY_PARAMETER = 'classname';
const METHOD_NAME_QUERY_PARAMETER = 'method-name';
const GE_TESTS_DASHBOARD_PATH = '/scans/tests';
const GE_TESTS_SECTION_FRAGMENT = 'tests';
const GE_TESTS_CONTAINER_SEARCH_PARAMETER = 'tests.container';

module.exports = expressApp => {
    expressApp
        .use(express.static(__dirname))
        .post(`/${GET_LINKS_PATH_FRAGMENT}`, processGetLinksRequest)
        .get(`/${OPEN_PATH_FRAGMENT}`, processOpenFileRequest);

    return expressApp;
}

function processGetLinksRequest({body: {url, testItems}}, response) {
    const testItemIdeLinks = testItems.map(testItem => getIdeLink(url, testItem));

    response.send(testItemIdeLinks);

    function getIdeLink(url, testItem) {
        const [classname, methodName] = getClassnameAndMethodName(url, testItem);
        const searchParameters = {[CLASSNAME_QUERY_PARAMETER]: classname, [METHOD_NAME_QUERY_PARAMETER]: methodName};

        return `${OPEN_PATH_FRAGMENT}?${stringify(searchParameters)}`;
    }

    function getClassnameAndMethodName(url, testItem) {
        const [, location, , search, , hash] = url.match(/([^?#]+)(\?([^#]+))?(#(.*))?/)
        const isTestsDashboard = location.endsWith(GE_TESTS_DASHBOARD_PATH);
        const isTestsSection = location.includes(`/${GE_TESTS_SECTION_FRAGMENT}/`);

        if (isTestsDashboard) {
            const {[GE_TESTS_CONTAINER_SEARCH_PARAMETER]: maybeTestContainer} = parse(search);
            const classname = maybeTestContainer || testItem;
            const methodName = maybeTestContainer ? testItem : undefined;

            return [classname, methodName];
        }
        if (isTestsSection) {
            const locationFragments = location.split('/').map(locationFragment => decodeURIComponent(locationFragment));
            const testContainerIndex = locationFragments.indexOf(GE_TESTS_SECTION_FRAGMENT) + 2; // skip the project name
            const [classname, methodName] = locationFragments.slice(testContainerIndex, testContainerIndex + 2);

            return [classname, methodName];
        }
    }
}

function processOpenFileRequest({query: {[CLASSNAME_QUERY_PARAMETER]: classname, [METHOD_NAME_QUERY_PARAMETER]: methodName}}, response) {
    const isMatchingJavaBasedFilePath = createIsMatchingJavaBasedFilePathFilter(classname);
    const [absoluteMatchingProjectFilePath] = getAllProjectFilePaths().filter(isMatchingJavaBasedFilePath);

    if (absoluteMatchingProjectFilePath) {
        const relativeMatchingPorjectFilePath = getRelativeProjectFilePath(absoluteMatchingProjectFilePath);
        const maybeLineIndex = methodName != null ? findFirstLineNumber(absoluteMatchingProjectFilePath, methodName) : undefined;
        const ideOpenFileLink = getIdeOpenFileLink(relativeMatchingPorjectFilePath, maybeLineIndex);

        response.redirect(ideOpenFileLink);
    } else {
        response.send(`Source file for test class: '${classname}' not found.`);
    }

    function createIsMatchingJavaBasedFilePathFilter(className) {
        const filePathFragment = className.replace(/\./g, '/');
        const javaBasedFilePathRegexp = new RegExp(`${filePathFragment}\.(groovy|java)`);

        return filePath => filePath.match(javaBasedFilePathRegexp);
    }
}

function findFirstLineNumber(filePath, lineContent) {
    const fileLines = fs.readFileSync(filePath, 'UTF-8').split('\n');

    return fileLines.findIndex(fileLine => fileLine.includes(lineContent));
}
