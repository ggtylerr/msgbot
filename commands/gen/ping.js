/**
 * msg bot Ping command
 *
 * Pong!
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
const strip = require('common-tags').stripIndents;

class PingCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['pong'],
      description: 'Pong! Checks my ping to the server.'
    });
  }

  async messageRun(message) {
    // Code mostly from here:
    // https://www.sapphirejs.com/docs/Guide/getting-started/creating-a-basic-command
    const msg = await message.channel.send('Ping?');

    const content = strip`Pong!
    Bot Latency ${Math.round(this.container.client.ws.ping)}ms. 
    API Latency ${msg.createdTimestamp - message.createdTimestamp}ms.`

    return msg.edit(content);
  }
}

module.exports = { PingCommand };