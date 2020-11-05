#!/usr/bin/env node
const express = require('express');
const cors = require('cors');
const {projectRootDirectory, getAllProjectFilePaths} = require('./src/common/project');
const javaBasedTests = require('./src/plugins/java-based-tests');

const PORT = 16666;

[
    expressApp => expressApp.use(cors()),
    expressApp => expressApp.use(express.static(`${__dirname}/public`)),
    expressApp => expressApp.use(express.json()),
    javaBasedTests
]
    .reduce((express, applyMiddleWare) => applyMiddleWare(express), express())
    .listen(PORT, error => {
        if (error) {
            console.log(error);
        } else {
            const projectFilesCount = getAllProjectFilePaths().length;

            console.log(`${projectFilesCount} source files found under project root directory: '${projectRootDirectory}'.`);
            console.log(`Gradle Enterprise IDE helper started @ http://localhost:${PORT}`);
        }
    });
