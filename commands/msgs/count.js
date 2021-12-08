/**
 * msg bot Count command
 *
 * Counts how many messages sent by user.
 * Can be filtered by the admin from the config command.
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

class CountCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['msgcount','messagecount'],
      description: 'Counts the # of messages you sent',
      preconditions: [ 'GuildOnly' ]
    });
  }

  async messageRun(message, args) {
    if (message.author.bot)
      return message.channel.send(`Sorry ${message.author.username} but this is only for humans ;P`);
    const user = await args.pick("user").catch(() => message.author);
    if (user.bot)
      return message.channel.send("Sorry, but this is only for humans ;P");

    // Connect to DB
    MongoClient.connect(`mongodb://localhost:${global.ownerConfig.MongoPort.val}`, async (err,db) => {
      if (err) throw err;
      // Find their ID
      const dbo = db.db("msgs");
      dbo.collection(message.guildId).findOne({id: user.id},(err,res) => {
        if (err) throw err;
        if (res === undefined && user.id === message.author.id)
          return message.channel.send(`Looks like I haven't counted any of your messages yet. Wait a bit and/or send more messages, then try again.`);
        if (res === undefined)
          return message.channel.send(`Looks like they haven't sent any messages yet. If they have, wait a bit, then try again.`);
        const embed = new MessageEmbed()
          .setTitle(`Messages sent by ${user.username}`)
          .setDescription(`${res.count}`)

        return message.channel.send({ embeds: [embed] });
      });
    });
  }
}

module.exports = { CountCommand };