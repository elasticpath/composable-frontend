#!/usr/bin/env node
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

/**
 * This file is useful for not having to load bootstrap-local in various javascript.
 * Simply use package.json to have npm scripts that use this script as well, or use
 * this script directly.
 */


const yargsParser = require('yargs-parser');
const path = require('path');

const args = yargsParser(process.argv.slice(2), {
  boolean: ['verbose']
});
const scriptName = args._.shift();
const scriptPath = path.join('../scripts', scriptName);

const cwd = process.cwd();
process.chdir(path.join(__dirname, '..'));


// This might get awkward, so we fallback to console if there was an error.
let logger = null;
try {
  logger = new (require('@angular-devkit/core').logging.IndentLogger)('root');
  const colors = require('ansi-colors').create();
  const filter = require('rxjs/operators').filter;

  logger
    .pipe(filter(entry => (entry.level !== 'debug' || args.verbose)))
    .subscribe(entry => {
      let color = colors.gray;
      let output = process.stdout;
      switch (entry.level) {
        case 'info': color = colors.white; break;
        case 'warn': color = colors.yellow; break;
        case 'error': color = colors.red; output = process.stderr; break;
        case 'fatal': color = x => colors.bold.red(x); output = process.stderr; break;
      }

      output.write(color(entry.message) + '\n');
    });
} catch (e) {
  console.error(`Reverting to manual console logging.\nReason: ${e.message}.`);
  logger = {
    debug: console.log.bind(console),
    info: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    fatal: x => { console.error(x); process.exit(100); },
    createChild: () => logger,
  };
}


try {
  Promise.resolve()
    .then(() => require(scriptPath).default(args, logger, cwd))
    .then(exitCode => process.exit(exitCode || 0))
    .catch(err => {
      logger.fatal(err && err.stack);
      process.exit(99);
    });
} catch (err) {
  logger.fatal(err.stack);
  process.exit(99);
}
