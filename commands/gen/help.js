/**
 * msg bot Help command
 *
 * Basic command displays information about the bot.
 * TODO: Make an actual help command and display cmds from Sapphire automatically
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
const strip = require('common-tags').stripIndents;

class HelpCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      aliases: ['help pls','commands','cmds'],
      description: 'Displays information about me'
    });
  }

  async messageRun(message) {
    // TODO: Write up info
    const embed = new MessageEmbed()
      .setTitle("Test")
      .setDescription("hellooooo")
      .addFields(
        {
          name: "Commands",
          value: "help, ping, count, config (admin)"
        }
      )
      .setFooter("Made by ggtylerr and co.","https://cdn.discordapp.com/avatars/143117463788191746/c6aecb5c22d932775d55fb1dfe34413c.png");

    return message.channel.send({ embeds: [embed] });
  }
}

module.exports = { HelpCommand };