# msg bot
Quick bot made in less than a day. Made to track messages on a server based on filters.

# Installation
1. [Setup a MongoDB server](https://www.prisma.io/dataguide/mongodb/setting-up-a-local-mongodb-database#setting-up-mongodb-on-windows)
2. [Download node.js](https://nodejs.org/en/) (at least v16)
3. Download this repo and extract it somewhere
4. Open up command prompt / terminal and `cd` to that folder
5. Run `npm install`
6. Run `node index.js` and go through configuration
7. You're all done! Run `node index.js` whenever you want to start it up.

# Usage
1. Add the bot to your server ([Go here](https://discord.com/developers/applications/), then select your app, OAuth2, URL Generator, check 'bot' then 'Administrator' and open the URL.)
2. Configure `@<bot\> config`
3. Fetch messages `@<bot\> fetch`
4. Count `@<bot\> count (user)`
5. Leaderboard `@<bot\> leaderboard`

# License
Licensed under GPL 3.0.