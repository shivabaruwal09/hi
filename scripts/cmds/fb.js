const axios = require("axios");

module.exports = {
  config: {
    name: "fb",
aliases: ["vfb","videofb"],
    version: 1.0,
    author: "OtinXSandip",
    longDescription: "Download Facebook reel",
    role: 0,
    category: "media",
    guide: {
      en: "{p}{n} link",
    },
  },
  onStart: async function ({ message, usersData, event, api, args }) {
    try {
      const url = args.join(" ");
      if (!url) {
        return message.reply("Please provide a link.");
      }

      const downloadUrl = `https://sandipbaruwal.onrender.com/download?url=${url}`;
      const response = await axios.get(downloadUrl);
      const hdMedia = response.data.medias.find(media => media.quality === 'hd');

      if (!hdMedia) {
        return message.reply("No HD media found.");
      }

      const shortUrl = await require('tinyurl').shorten(hdMedia.url);
      const stream = await global.utils.getStreamFromURL(hdMedia.url);

      message.reply({ 
        body: shortUrl,
        attachment: stream
      });
    } catch (error) {
      console.error("Error:", error.message);
      message.reply({ body: "❌ An error occurred" });
    }
  }
};