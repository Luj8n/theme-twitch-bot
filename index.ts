import tmi from "tmi.js"; // some documentation here: https://github.com/tmijs/docs/tree/gh-pages/_posts/v1.4.2
import type { ChatUserstate } from "tmi.js";
import fs from "fs";
import chalk from "chalk";
import {
  SETTINGS_PATH,
  THEME_REWARD_ID,
  FONT_REWARD_ID,
  IDENTIFIER,
  THEMES,
  FONTS,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  ACCOUNT,
  DEFAULT_THEME,
  THEME_RESET_TIMER,
  DEFAULT_FONT,
  FONT_RESET_TIMER,
  DEFAULT_FONT_SIZE,
  FONT_SIZE_RESET_TIMER,
} from "./configs";

// create a client with selected options
const client = new tmi.Client(ACCOUNT);

let THEME_TIMER: NodeJS.Timeout = setTimeout(() => {});
let FONT_TIMER: NodeJS.Timeout = setTimeout(() => {});
let FONT_SIZE_TIMER: NodeJS.Timeout = setTimeout(() => {});

type modificationType = "theme" | "font" | "fontsize";
function modifySettings(
  type: modificationType,
  option: string,
  shouldReset: boolean = true
): string {
  try {
    // read file from disk
    const unparsedOldSettings = fs.readFileSync(SETTINGS_PATH, "utf8");

    // parse it
    const parsedOldSettings = JSON.parse(unparsedOldSettings);

    // deep copy old settings. this will be our new setting
    const newSettings = JSON.parse(JSON.stringify(parsedOldSettings));

    let reply = "";

    switch (type) {
      case "theme":
        const oldTheme: string = parsedOldSettings["workbench.colorTheme"] ?? DEFAULT_THEME;

        const themesToChooseFrom = shouldReset
          ? THEMES.filter((t) => t.toLowerCase() !== oldTheme.toLowerCase())
          : [...THEMES];

        const newTheme =
          themesToChooseFrom.find((t) => t.toLowerCase() === option.toLowerCase()) ??
          themesToChooseFrom[~~(Math.random() * themesToChooseFrom.length)] ??
          oldTheme;

        newSettings["workbench.colorTheme"] = newTheme;

        reply = `Theme changed to ${newTheme} successfully!`;

        if (shouldReset && THEME_RESET_TIMER > 0) {
          clearTimeout(THEME_TIMER);

          THEME_TIMER = setTimeout(() => {
            modifySettings("theme", DEFAULT_THEME, false);
          }, THEME_RESET_TIMER * 1000);

          console.log(
            chalk.blue(`* Theme will reset to ${DEFAULT_THEME} in ${THEME_RESET_TIMER} seconds`)
          );
        }
        break;
      case "font":
        const oldFont: string = parsedOldSettings["editor.fontFamily"] ?? DEFAULT_FONT;

        const fontsToChooseFrom = shouldReset
          ? FONTS.filter((t) => t.toLowerCase() !== oldFont.toLowerCase())
          : [...FONTS];

        const newFont =
          fontsToChooseFrom.find((t) => t.toLowerCase() === option.toLowerCase()) ??
          fontsToChooseFrom[~~(Math.random() * fontsToChooseFrom.length)] ??
          oldFont;

        newSettings["editor.fontFamily"] = newFont;

        reply = `Font changed to ${newFont} successfully!`;

        if (shouldReset && FONT_RESET_TIMER > 0) {
          clearTimeout(FONT_TIMER);

          FONT_TIMER = setTimeout(() => {
            modifySettings("font", DEFAULT_FONT, false);
          }, FONT_RESET_TIMER * 1000);

          console.log(
            chalk.blue(`* Font will reset to ${DEFAULT_FONT} in ${FONT_RESET_TIMER} seconds`)
          );
        }
        break;
      case "fontsize":
        const fontSize = parsedOldSettings["editor.fontSize"] ?? DEFAULT_FONT_SIZE;

        const newFontSize = !shouldReset
          ? DEFAULT_FONT_SIZE
          : option === "+"
          ? fontSize + 1
          : option === "-"
          ? fontSize - 1
          : fontSize;

        if (fontSize < MIN_FONT_SIZE) {
          reply = `Font size can't be lower than ${MIN_FONT_SIZE}`;
        } else if (fontSize > MAX_FONT_SIZE) {
          reply = `Font size can't be higher than ${MAX_FONT_SIZE}`;
        } else {
          if (fontSize === newFontSize) {
            reply = "";
            break;
          }

          newSettings["editor.fontSize"] = newFontSize;

          reply = `Font size changed to ${newFontSize} successfully!`;

          if (shouldReset && FONT_SIZE_RESET_TIMER > 0) {
            clearTimeout(FONT_SIZE_TIMER);
            FONT_SIZE_TIMER = setTimeout(() => {
              modifySettings("fontsize", "", false);
            }, FONT_SIZE_RESET_TIMER * 1000);
            console.log(
              chalk.blue(
                `* Font size will reset to ${DEFAULT_FONT_SIZE} in ${FONT_SIZE_RESET_TIMER} seconds`
              )
            );
          }
        }
        break;
    }

    const stringifiedNewSettings = JSON.stringify(newSettings, null, 4);

    // write file to disk
    fs.writeFileSync(SETTINGS_PATH, stringifiedNewSettings, "utf8");

    console.log(chalk.yellow(reply));
    return reply;
  } catch (error) {
    console.error(chalk.bgRed(`* error: ${error}`));
    return error;
  }
}

async function onMessage(
  channel: string,
  userstate: ChatUserstate,
  message: string,
  self: boolean
) {
  // ignore message if it is the bot's message
  if (self) return;

  const isMod = userstate.mod || userstate.username === channel.slice(1); // is true if the message sender is a mod

  let reply = "";

  if (userstate["custom-reward-id"]) {
    console.log(
      chalk.redBright(
        `* Claimed custom reward: custom-reward-id = '${userstate["custom-reward-id"]}' | text = '${message}'`
      )
    );

    switch (userstate["custom-reward-id"]) {
      case THEME_REWARD_ID:
        reply = modifySettings("theme", message.match(/\S+/g)?.join(" ") ?? "");
        break;
      case FONT_REWARD_ID:
        reply = modifySettings("font", message.match(/\S+/g)?.join(" ") ?? "");
        break;
    }
  } else if (message.startsWith(IDENTIFIER)) {
    const words = message.match(/\S+/g) ?? []; // get words with regex
    const command = (words[0] ?? "").toLowerCase().slice(1); // get the command and make it lowercase
    const args = words.slice(1); // get the arguments

    console.log(`* got: command - "${command}", arguments: "${args}"`);

    switch (command) {
      case "fontsize":
        if (isMod) {
          reply = modifySettings("fontsize", args[0]);
        }
        break;
    }
  }

  // don't send the reply if it's an empty string or the bot account is anonymous
  if (reply === "" || typeof ACCOUNT["identity"] === "undefined") return;

  await client.say(channel, reply);
  console.log(chalk.yellowBright(`* replied with "${reply}"`));
}

// register event handlers
client.on("connected", async (address: string, port: number) => {
  console.log(chalk.blueBright(`* connected to: address - ${address}, port - ${port}`));

  // set the default color
  await client.color("BlueViolet");
});

client.on("message", onMessage);

// connect to Twitch
client.connect();
