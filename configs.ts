import type { Options } from "tmi.js";
import * as dotenv from "dotenv";
import { resolve } from "path";
import os from "os";

// load environment variables
dotenv.config({
  path: resolve(__dirname, "../.env"),
});

const HOME_DIR = os.homedir();

// depending on the operating system, comment or uncomment these lines. NOTE: these paths may not work
export const SETTINGS_PATH = `${HOME_DIR}/.config/Code/User/settings.json`; // for LINUX
// export const SETTINGS_PATH = `${HOME_DIR}\\AppData\\Roaming\\Code\\User\\settings.json`; // for WINDOWS
// export const SETTINGS_PATH = `${HOME_DIR}/Library/Application Support/Code/User/settings.json`; // for MAC

// twitch reward id, here is an example: "92ca1e83-f024-68df-a626-u7695asc27"
// to get them: uncomment the 157th line in "main.js", run the bot and claim the rewards. It should show the reward id
// NOTE: only words with custom rewards which have the text option!
export const THEME_REWARD_ID = "637a2d0e-cf5b-487f-ab61-3369ec07d4ba";
export const FONT_REWARD_ID = "04916284-f63e-4c1d-9dc6-0f193a28a7f9";

// to get possible themes press "Ctrl + K" then "Ctrl + T". NOTE: they are case sensitive
// NOTE: some built-in vscode themes may not work
// some examples
export const THEMES = [
  "One Dark Pro",
  "One Dark Pro Flat",
  "GitHub Dark",
  "One Monokai",
  "Monokai",
  "Abyss",
  "Solarized Dark",
  "Tomorrow Night Blue",
];

// only monospace fonts work (by default)
// some examples
export const FONTS = [
  "Consolas",
  "Fira Code",
  "Source Code Pro",
  "Input Mono Narrow",
  "Noto Sans Mono",
];

export const MIN_FONT_SIZE = 10;
export const MAX_FONT_SIZE = 20;

// set the "*****_RESET_TIME" to 0, in order to make it not reset
export const DEFAULT_THEME = "One Dark Pro Flat";
export const THEME_RESET_TIMER = 5; // in seconds

export const DEFAULT_FONT = "Input Mono Narrow";
export const FONT_RESET_TIMER = 5; // in seconds

export const DEFAULT_FONT_SIZE = 16;
export const FONT_SIZE_RESET_TIMER = 0; // in seconds

export const ACCOUNT: Options = {
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_TOKEN,
  },
  channels: process.env.CHANNELS?.split(",") ?? [],
};

export const IDENTIFIER = process.env.BOT_IDENTIFIER ?? "!";
