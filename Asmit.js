module.exports = {
 config: {
	 name: "Asmit",
	 version: "1.0",
	 author: "AceGun",
	 countDown: 5,
	 role: 0,
	 shortDescription: "no prefix",
	 longDescription: "no prefix",
	 category: "no prefix",
 },

 onStart: async function(){}, 
 onChat: async function({ event, message, getLang }) {
 if (event.body && event.body.toLowerCase() === "asmit") {
 return message.reply({
 body: "Hey my boss is busy mention Later",
 attachment: await global.utils.getStreamFromURL("https://i.imgur.com/tzc8JDY.mp4")
 });
 }
 }
}
