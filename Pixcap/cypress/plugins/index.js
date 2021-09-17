/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin');
const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');

module.exports = (on, config) => {
    addMatchImageSnapshotPlugin(on, config);
    on('before:run', async (details) => {
        console.log('override before:run');
        await beforeRunHook(details);
    });

    on('after:run', async () => {
        console.log('override after:run');
        await afterRunHook();
    });
};