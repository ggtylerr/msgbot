/**
 * msg bot Leaderboard command
 *
 * Makes a leaderboard based on message count
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

const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const { MongoClient } = require('mongodb');

class LeaderboardCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      description: 'Get the top messengers in the server',
      preconditions: [ 'GuildOnly' ]
    });
  }

  async messageRun(message) {
    // Connect to DB
    MongoClient.connect(`mongodb://localhost:${global.ownerConfig.MongoPort.val}`, async (err,db) => {
      if (err) throw err;
      // Sort
      const dbo = db.db("msgs");
      dbo.collection(message.guildId).find().sort({count: -1}).toArray(async (err,res) => {
        if (err) throw err;
        if (res === undefined) return message.channel.send("No messages sent in the server yet!");
        const list = res.filter(obj => obj.id !== "settings");

        let out = "";
        for (let i = 0; i < list.length && i < 10; i++) {
          const user = await client.users.fetch(list[i].id);
          out += `#${i+1} - ${user.username} \`(${list[i].count})\`\n`;
        }

        const embed = new MessageEmbed()
          .setTitle(`Leaderboard`)
          .setDescription(out)

        return message.channel.send({ embeds: [embed] });
      });
    });
  }
}

module.exports = { LeaderboardCommand };