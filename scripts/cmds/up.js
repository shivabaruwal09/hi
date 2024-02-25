module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "1.0",
    author: "Sigma",
    role: 0,
    shortDescription: {
      en: "Uptime"
    },
    longDescription: {
      en: "Calculate Uptime"
    },
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, args }) {

    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const days = Math.floor(uptime / (60 * 60 * 24));

    const uptimeString = `${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`;

    api.sendMessage(`${uptimeString}.`, event.threadID, event.messageID);
  }
};