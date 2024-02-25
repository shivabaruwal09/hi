const axios = require("axios");
const fs = require("fs");

function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

module.exports = {
  config: {
    name: "spotify",
    version: "1.0",
    author: "MILAN + OtinXSandip",
    countDown: 10,
    role: 0,
    shortDescription: "Search for tracks on Spotify.",
    longDescription: "Search for tracks on Spotify.",
    category: "media",
    guide: { 
en: "{pn} song name"
}
  },

  onStart: async function ({ api, event, args, message }) {
    const query = args.join(" ");
    const spotifyApi = `https://sandipbaruwal.onrender.com/spotify?query=${query}`;
    try {
      const response = await axios.get(spotifyApi);
      const tracks = response.data.slice(0, 6);
      if (tracks.length === 0) {
        return message.reply("No tracks found for the given query.");
      }
      const trackInfo = tracks
        .map((track, index) => `${index + 1}. ${track.name} - ${track.artist}`)
        .join("\n\n");
      const attachments = await Promise.all(
        tracks.map((track) =>
          global.utils.getStreamFromURL(track.image_url)
        )
      );
      const replyMessage = await message.reply({
        body: `${trackInfo}\n\nReply with the number of the track to get details.`,
        attachment: attachments,
      });
      const data = {
        commandName: this.config.name,
        messageID: replyMessage.messageID,
        tracks: tracks,
      };
      global.GoatBot.onReply.set(replyMessage.messageID, data);
    } catch (error) {
      console.error(error);
      api.sendMessage("Error: " + error, event.threadID);
    }
  },
  onReply: async function ({ api, event, args, message, Reply }) {
    const userInput = parseInt(args[0]);
    if (!isNaN(userInput) && userInput >= 1 && userInput <= Reply.tracks.length) {
      const selectedTrack = Reply.tracks[userInput - 1];
      try {
        const SpdlApiUrl = `https://sandipbaruwal.onrender.com/down?url=${encodeURIComponent(selectedTrack.link)}`;
        const apiResponse = await axios.get(SpdlApiUrl);

        if (apiResponse.data.link) {
          const audioLink = apiResponse.data.link;
          const audioResponse = await axios.get(audioLink, { responseType: 'arraybuffer' });
          fs.writeFileSync(__dirname + '/cache/spotifyAudio.mp3', Buffer.from(audioResponse.data));

          const fileSize = fs.statSync(__dirname + '/cache/spotifyAudio.mp3').size;
          const sizeFormatted = formatSize(fileSize);

          const attachment = fs.createReadStream(__dirname + '/cache/spotifyAudio.mp3');
          if (audioResponse) {
            message.reply(`Downloading track: ${selectedTrack.name}`);
           message.unsend(Reply.messageID);        

    const trackDetails = `
              🎶 Now playing:
              👤 Artists: ${selectedTrack.artist}
              🎵 Title: ${selectedTrack.name}
              📅 Release Date: ${selectedTrack.release_date}
              📦 Size: ${sizeFormatted}
            `;
            await message.reply({
              body: `${trackDetails}`,
              attachment: attachment
            });

           
          } else {
            console.error("Audio stream not available");
            message.reply("Sorry, the audio file could not be downloaded.");
          }
        } else {
          console.error("Audio link not available");
          message.reply("Sorry, the audio link could not be retrieved.");
        }
      } catch (error) {
        console.error(error);
        message.reply("Error downloading the audio file.");
      }
    }
  }
};