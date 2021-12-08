/**
 * msg bot configuration dialog
 *
 * User-friendly dialog to setup the bot.
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

const colors = require('colors/safe');
const strip = require('common-tags').stripIndents;
const inquirer = require('inquirer');
const hjson = require('hjson');
const fs = require('fs');
const path = require('path');
const wrap = require('./strings.js').wrap;

colors.setTheme({
  boldGreen: ['green','bold'],
  boldCyan: ['cyan','bold'],
  boldRed: ['red','bold'],
  warning: ['red','bold','underline'],
  link: ['blue','bold','underline'],
});

exports.start = async () => {
  // Use ZWNJ characters to separate lines. (common-tags stripIndents strip empty lines for some reason)
  // You can copy this character below this line.
  // ‌
  // It's also viewable in Jetbrains IDEs, like IntelliJ IDEA or WebStorm.

  console.log(strip
    `Welcome to ${colors.bgBlue("gg bot")}!
    ‌
    This dialog is for ${colors.bold("first-time use")} and will walk you through configuration.
    If you want to see this dialog again, you can remove the file named '${colors.inverse(".notfirsttime")}',
    or you can use the CLI command '${colors.inverse("firsttime")}'
    ‌
    There are also other commands that can go through different parts of this dialog instead.
    To see all of them, do '${colors.inverse("help")}'
    ‌`);

  await inquirer
    .prompt([
      {
        type: 'list',
        name: 'a',
        message: 'How do you want to go through config?',
        choices: [
          {
            name: `(1) ${colors.boldGreen("Continue")}`,
            value: 1
          },
          {
            name: `(2) ${colors.boldCyan("Only configure .env, skip normal configuration")}`,
            value: 2
          },
          {
            name: `(3) ${colors.boldRed("Only configure normal configuration, skip .env")}`,
            value: 3
          },
          {
            name: `(4) ${colors.boldRed("Skip configuration entirely")}`,
            value: 4
          },
          new inquirer.Separator(colors.warning("(If you choose 3 or 4 and you don't have .env set up already, your bot will be unusable!)"))
        ]
      }
    ])
    .then(async (answer) => {
      // .env
      if (answer.a === 1 || answer.a === 2) {
        await exports.env();
      }
      // regular config
      if (answer.a === 1 || answer.a === 3) {
        await exports.config();
      }
      await fs.writeFileSync(path.resolve(__dirname,"../.notfirsttime"),
        strip
          `This file indicates that this is not the first time you're using this program.
          If you want to see the first time dialog again, 
          delete this file or use the CLI command 'firsttime'`
      );
    })
}

exports.genEnv = async () => {
  try {
    fs.writeFileSync(path.resolve(__dirname, "../.env"),
      "discord=token"
    );
  } catch (e) {
    console.error(e);
    console.error(`${colors.warning("Couldn't generate file.")} Did you give this program file access? (either through sudo or running as admin)`)
    process.exit(1);
  }
  console.log(colors.boldCyan("Generated .env successfully."));
}

exports.env = async () => {
  console.log(
    strip
      `‌
      ${colors.warning("WARNING:")} If you're using a hosting service, it's recommended you
      go through this step on your own PC first, as they may save your console logs, 
      and thus ${colors.warning("making your token and API key easily viewable.")}
      ‌`);

  await inquirer
    .prompt([
      // Discord Token
      {
        type: 'input',
        name: 'discord',
        message:
          strip`Input your discord bot token.
          If you don't have one, make a new application here: ${colors.link('https://discord.com/developers/applications')}
          Then, open the app, go to the Bot settings, and add a bot. You can copy the token from there.
          ‌
          Input here:`,
      }
    ])
    .then((answers) => {
      let out = `discord=${answers.discord}`;
      fs.writeFileSync(path.resolve(__dirname, "../.env"), out);
    })
}

exports.config = async () => {
  // Go through each setting to auto generate questions
  let questions = [];
  let configHJSON = fs.readFileSync(path.resolve(__dirname, "../config.hjson"),'utf8');
  const config = hjson.rt.parse(configHJSON);
  const keys = Object.keys(config);

  keys.forEach((key) => {
    // Determine type and question
    let type = "input";
    let prompt = "What do you want to set this as?";
    let choices = undefined;

    if (config[key].type === "Number") {
      type = "number";
    }

    if (config[key].type === "Boolean") {
      type = "confirm";
      prompt = "Do you want to toggle this on?";
    }

    if (config[key].type === "List") {
      type = "list";
      choices = [];
      for (let i = 0; i < config[key].list.length; i++) {
        choices.push({
          name: `(${i}) ${config[key].list[i]}`,
          value: config[key].list[i]
        });
      }
    }

    // Make and push question
    questions.push({
      type: type,
      name: key,
      message:
        strip`${config[key].title}
      ‌
      ${wrap(config[key].desc,90)}
      ‌
      ${prompt}`,
      default: config[key].def,
      choices: choices
    });
  });

  // Ask questions...
  await inquirer.prompt(questions)
    .then((answers) => {
      // ...and receive answers.
      keys.forEach((key) => {
        config[key].val = answers[key];
      });
      // Oh, and save them, too.
      fs.writeFileSync(path.resolve(__dirname,"../config.hjson"),hjson.rt.stringify(config));
    });
}