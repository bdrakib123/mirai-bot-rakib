const fonts = "/cache/Play-Bold.ttf"
const downfonts = "https://drive.google.com/u/0/uc?id=1uni8AiYk7prdrC7hgAmezaGTMH5R8gW8&export=download" 
module.exports.config = {
  name: "cardinfo7",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "create card info",
  commandCategory: "info",
  cooldowns: 2,
  dependencies: {
    canvas: "",
    "fs-extra": "",
    axios: "",
  },
};

module.exports.circle = async (image) => {
  const jimp = global.nodemodule["jimp"];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ api, event, args }) {
  let { senderID, threadID, messageID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  
  let pathImg = __dirname + `/cache/cardinfo_${senderID}.png`;

  //------------- USER DATA ----------------//
  let userData = {
    name: "Rakib",
    gender: "Male",
    birthday: "10 Jul 2000",
    relationship: "Single",
    follow: "0",
    location: "Mymensingh",
    facebook: "https://www.facebook.com/profile.php?id=61581351693349"
  }

  //------------- BACKGROUND IMAGE ----------------//
  let bg = (await axios.get("https://i.imgur.com/rqbC4ES.jpg", { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathImg, Buffer.from(bg, "utf-8"));

  //------------- LOAD CANVAS ----------------//
  const baseImage = await loadImage(pathImg);
  const canvas = createCanvas(baseImage.width, baseImage.height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  //------------- REGISTER FONT ----------------//
  const Canvas = global.nodemodule["canvas"];
  if(!fs.existsSync(__dirname+`${fonts}`)) { 
    let getfont = (await axios.get(`${downfonts}`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(__dirname+`${fonts}`, Buffer.from(getfont, "utf-8"));
  }
  Canvas.registerFont(__dirname+`${fonts}`, { family: "Play-Bold" });

  //------------- WRITE TEXT ----------------//
  ctx.font = `35px Play-Bold`;
  ctx.fillStyle = "#00FFFF";
  ctx.textAlign = "start";

  ctx.fillText(`Name: ${userData.name}`, 340, 560);
  ctx.fillText(`Sex: ${userData.gender}`, 1245, 448);
  ctx.fillText(`Follow: ${userData.follow}`, 1245, 505);
  ctx.fillText(`Relationship: ${userData.relationship}`, 1245, 559);
  ctx.fillText(`Birthday: ${userData.birthday}`, 1245, 616);
  ctx.fillText(`Location: ${userData.location}`, 1245, 668);
  ctx.fillText(`Facebook: ${userData.facebook}`, 32, 727);

  //------------- SAVE IMAGE ----------------//
  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);

  return api.sendMessage(
    { attachment: fs.createReadStream(pathImg) },
    threadID,
    () => fs.unlinkSync(pathImg),
    messageID
  );
};
