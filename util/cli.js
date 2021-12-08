/**
 * msg bot CLI
 *
 * Util script for CLI commands
 *
 * Copyright (C) 2021 Tyler Flowers (ggtylerr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * ~~~developed by ggtylerr and co.~~~
 */

const config = require("./configDialog.js");

exports.setup = async () => {
  const argv = await require('yargs/yargs')(process.argv.slice(2))
    .command('firsttime', "Run first time dialog", async () => {
      await config.start();
      process.exit(0);
    })
    .alias('firsttime','first')
    .command('env', "Configure .env file (where your API keys are stored)", async () => {
      await config.env();
      process.exit(0);
    })
    .command('config', "Go through normal configuration (doesn't include .env)", async () => {
      await config.config();
      process.exit(0);
    })
    .command('genenv', "Generate .env file", async () => {
      await config.genEnv();
      process.exit(0);
    })
    .help()
    .alias('help','h')
    .argv;
}