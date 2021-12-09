/**
 * msg bot Config command
 *
 * Configuration command for servers
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

const { Command, UserPermissionsPrecondition } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const strip = require('common-tags').stripIndents;
const { MongoClient } = require('mongodb');

const defaultSettings = {
  before: {
    val: "",
    type: "timestamp"
  },
  after: {
    val: "",
    type: "timestamp"
  }
}

class ConfigCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['configuration'],
      description: 'Displays server configuration for admins',
      preconditions: [
        'GuildOnly',
        new UserPermissionsPrecondition('ADMINISTRATOR')
      ]
    });
  }

  async messageRun(message, args) {
    if (message.author.bot)
      return message.channel.send(`Sorry ${message.author.username} but this is only for humans ;P`);

    const key = await args.pick('string').catch(() => null);
    const val = await args.pick('string').catch(() => null);

    // Display config options
    if (key === null) {
      const embed = new MessageEmbed()
        .setTitle("Configuration Options")
        .setDescription(
          strip`Before date: 
          \`before (UNIX timestamp)\`
          Looks for messages before that timestamp.
          [Generate the timestamp here](https://www.unixtimestamp.com/)
          
          After date: 
          \`after (UNIX timestamp)\`
          Looks for messages after that timestamp.
          [Generate the timestamp here](https://www.unixtimestamp.com/)`
        )

      return message.channel.send({embeds: [embed]});
    }

    // Connect to DB
    MongoClient.connect(`mongodb://localhost:${global.ownerConfig.MongoPort.val}`, async (err,db) => {
      if (err) throw err;
      // Get/Create Collection
      const dbo = db.db("msgs");
      const col = dbo.collection(message.guildId);
      // Get settings
      col.findOne({id: "settings"}, async (err, res) => {
        if (err) throw err;
        // Generate default settings if no settings found
        if (res === null) {
          await col.insertOne({id: "settings", settings: defaultSettings});
          res = { id: "settings", settings: defaultSettings };
        }
        // Check if key exists
        if (defaultSettings[key] === undefined) {
          message.channel.send("That setting does not exist. Did you make a typo?");
          await db.close();
          return;
        }
        // Add setting if it isn't added
        if (res.settings[key] === undefined) {
          res.settings[key] = defaultSettings[key];
        }
        // Display value if none specified
        if (val === null) {
          let value = res.settings[key].val;
          if (value === undefined || value === null || value === "") value = "`N/A (Nothing)`"
          message.channel.send(`That setting is currently set as ${value}`);
          await db.close();
          return;
        }
        // Check type
        if (defaultSettings[key].type === "timestamp" && !(new Date(parseInt(val))).getTime() > 0) {
          message.channel.send("The value specified is not a timestamp.");
          await db.close();
          return;
        }
        // Update settings
        let updated = { $set: {settings: res.settings} };
        updated.$set.settings[key].val = val;
        col.updateOne({id: "settings"}, updated, (err) => {
          if (err) throw err;
          message.channel.send(`The setting ${key} has successfully been updated to ${val}! Make sure to re-fetch messages by running \`fetch\``);
          db.close();
        });
      });
    });
  }
}

module.exports = { ConfigCommand };