const axios = require("axios");

module.exports = {
  config: {
    name: "clips",
    aliases: ["clip"],
    version: "1.0",
    author: "MILAN",
    countDown: 5,
    role: 0,
    shortDescription: "Search movie clips.",
    longDescription: {
      en: "Search movie clips with their dialogue."
    },
    category: "media",
    guide: {
      en: "{pn} [name]"
    }
  },
  langs: {
    en: {}
  },

  onStart: async function ({ args, event, api }) {
    try {
      const query = args.join(' ');
      if (!query) {
        return api.sendMessage(`Search a name baka!!`, event.threadID, event.messageID);
      }
      const response = await axios.get(`https://milanbhandari.onrender.com/clips?query=${query}`);
      const results = response.data.results.slice(0, 6);
      if (!results || results.length === 0) {
        return api.sendMessage(`No search results match the keyword ${query}`, event.threadID, event.messageID);
      }
      let msg = '';
      for (let i = 0; i < results.length; i++) {
        const clip = results[i];
        msg += `${i + 1}. 📺 Title: ${clip.movie}\n⏰ Time: ${clip.time}\n🗒 Dialogue: ${clip.quote}\n\n`;
      }
      msg += 'Reply with the number of the titles to get the clips:\n\n';
      api.sendMessage(msg, event.threadID, (err, info) => {
        const id = info.messageID;
        global.GoatBot.onReply.set(id, {
          commandName: this.config.name,
          messageID: id,
          author: event.senderID,
          results: results,
          query: query,
        });
      });
    } catch (error) {
      console.error(error);
      api.sendMessage(`Error: ${error}`, event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply, usersData, args, message}) {
    const reply = parseInt(args[0]);
    const { author, messageID, results, query } = Reply;
    if (event.senderID !== author) return;
    try {
      if (results && results.length > 0 && reply >= 1 && reply <= results.length) {
        const clip = results[reply - 1];
        message.reply({ body: ` 🎥 Clip with dialogue closest to "${query}"\n📺 From: ${clip.movie}\n⏰ Time: ${clip.time}\n🗒 Dialogue: ${clip.quote}`, attachment: await global.utils.getStreamFromURL(clip.video) });
      } else {
        return message.reply("Invalid number. Please reply with a number between 1 and " + (results ? results.length : 0));
      }
    } catch (error) {
      console.error(error);
      api.sendMessage(`Error: ${error}`, event.threadID);
    }
    if (results && results.length > 0 && reply >= 1 && reply <= results.length) {
      await message.unsend(Reply.messageID);
    }
  },
};