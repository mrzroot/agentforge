#!/usr/bin/env node

const { createCli } = require('../dist/cli/index');

const program = createCli();
program.parse(process.argv);
