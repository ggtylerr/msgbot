/**
 * msg bot Fetch command
 *
 * Fetches messages based on filters and adds the count to a DB
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
const { MessageEmbed, Collection} = require('discord.js');
const strip = require('common-tags').stripIndents;
const { MongoClient } = require('mongodb');

class FetchCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['fetchmsg','fetchmsgs','fetchmessage','fetchmessages','get','getmsg','getmsgs','getmessage','getmessages'],
      description: 'Get messages based on filters provided in config',
      preconditions: [
        'GuildOnly',
        new UserPermissionsPrecondition('ADMINISTRATOR')
      ]
    });
  }

  async messageRun(message) {
    const msg = await message.channel.send("This might take a long time depending on the amount of messages and channels in the server, so hang tight!");
    // Connect to DB
    MongoClient.connect(`mongodb://localhost:${global.ownerConfig.MongoPort.val}`, async (err,db) => {
      if (err) throw err;
      // Get/Create Collection
      const dbo = db.db("msgs");
      const col = dbo.collection(message.guildId);
      // Get before date
      const s = await col.findOne({id:"settings"});
      let before = message.guild.joinedTimestamp;
      if (s !== null) {
        before = s.settings.after.val;
      }
      // Fetch messages
      let msgs = [];
      let size = 0;
      // thank you so much iWillBanU
      // ive been stuck on this one too and im finally done with it ahhhhhhhhhHhhhHh
      for (let channel of Array.from(message.guild.channels.cache.values())) {
        if (channel.type === "GUILD_TEXT" || channel.type === "GUILD_NEWS" || channel.type === "GUILD_NEWS_THREAD" || channel.type === "GUILD_PUBLIC_THREAD" || channel.type === "GUILD_PRIVATE_THREAD") {
          const messages = await fetchMore(channel, 99999999999);
          // Filter through messages and add them
          const filtered = messages.filter((msg) => {
            return !msg.author.bot &&
              msg.createdTimestamp > before;
          })
          size += filtered.size;
          filtered.each(message => {
            const f = msgs.find(x => x.id === message.author.id);
            if (f !== undefined)
              f.count += 1;
            else
              msgs.push({id: message.author.id, count: 1});
          });
        }
      }
      // Delete pre-existing collection, then add everything in
      await col.drop();
      msgs.unshift(s);
      const col2 = dbo.collection(message.guildId);
      col2.insertMany(msgs, (err) => {
        if (err) throw err;
        msg.edit(`Successfully counted ${size} messages!`);
        db.close();
      });
    });
  }
}

// thank you so much Zsolt Meszaros from StackOverflow
// i was about to blow my brains out over this code
// https://stackoverflow.com/questions/66281939/discordjs-fetching-more-then-100-messages/66281983#66281983

async function fetchMore(channel, limit = 250) {
  if (!channel) {
    throw new Error(`Expected channel, got ${typeof channel}.`);
  }
  if (limit <= 100) {
    return channel.messages.fetch({ limit });
  }

  let collection = new Collection();
  let lastId = null;
  let options = {};
  let remaining = limit;

  while (remaining > 0) {
    options.limit = remaining > 100 ? 100 : remaining;
    remaining = remaining > 100 ? remaining - 100 : 0;

    if (lastId) {
      options.before = lastId;
    }

    let messages = await channel.messages.fetch(options);

    if (!messages.last()) {
      break;
    }

    collection = collection.concat(messages);
    lastId = messages.last().id;
  }

  return collection;
}

module.exports = { FetchCommand };