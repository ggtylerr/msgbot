/**
 * msg bot
 *
 * Quick bot made for MC Events
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

// Requirements
const fs = require('fs');
const { SapphireClient, LogLevel } = require("@sapphire/framework");
const hjson = require('hjson');
const colors = require('colors/safe');
const strip = require('common-tags').stripIndents;
const { MongoClient } = require('mongodb');

const configDialog = require('./util/configDialog.js');
const flags = require('./util/cli.js');

// Wrapping around everything in async so
// the configuration dialog works properly

async function main() {
  // Configuration
  let firstTime = false;
  try {
    fs.accessSync("./.notfirsttime");
  } catch (e) {
    firstTime = true;
  }

  if (firstTime) {
    await configDialog.start();
  }

  // CLI flags
  await flags.setup();

  require('dotenv').config();
  global.ownerConfig = hjson.parse(fs.readFileSync("./config.hjson",'utf8'));

  // Connect to DB
  // (Also stay connected, as its easier on performance this way)
  MongoClient.connect(`mongodb://localhost:${ownerConfig.MongoPort.val}`, (err,db) => {
    if (err) throw err;
    const dbo = db.db("msgs");

    // Make client
    let level = LogLevel.None;
    switch (ownerConfig.LogLevel.val) {
      case "Trace": level = LogLevel.Trace; break;
      case "Debug": level = LogLevel.Debug; break;
      case "Info":  level = LogLevel.Info;  break;
      case "Warn":  level = LogLevel.Warn;  break;
      case "Error": level = LogLevel.Error; break;
      case "Fatal": level = LogLevel.Fatal; break;
    }

    global.client = new SapphireClient({
      intents: ['GUILDS', 'GUILD_MESSAGES'],
      defaultPrefix: ownerConfig.DefaultPrefix.val,
      logger: { level: level }
    });

    // Message event (add message to count)
    client.on('messageCreate', message => {
      // Return if bot or DM
      if (message.author.bot || message.guild === undefined || message.guild === null) return;
      // Update count
      const col = dbo.collection(message.guild.id);
      col.findOne({id: message.author.id}, (err, res) => {
        if (err) throw err;
        let out = {};
        if (res === undefined) out = {$set: {id: message.author.id, count: 1}};
        else out = {$set: {id: message.author.id, count: res.count += 1}};
        col.updateOne({id: message.author.id}, out);
      });
    })

    // Login
    client.login(process.env.discord)
      .then(() =>
        // TODO: sexy ascii
        client.logger.info(
          strip`========================================
          
          msg bot v0.0.1
          
          ========================================
          
          This is a bot whipped together in less
          than a day. Expect bugs, and thank you
          for testing / developing!
          
          ========================================
          
          Logged in as ${client.user.tag}!
          
          ========================================`
        )
      )
      .catch(() =>
        console.log(`${colors.red.bold(`${colors.underline("ERROR:")} Couldn't login!`)} Is your Discord token correct?`)
      );
  });
}

// Call main function
main();