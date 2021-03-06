import fs from "fs";
import process from "process";
import dotenv from "dotenv";
import { Rainwave } from "rainwave-websocket-sdk";
import { stationByString } from "rainwave-websocket-sdk/dist/types";

dotenv.config();

const apiKey = process.env.RAINWAVE_API_KEY;
const userIdString = process.env.RAINWAVE_USER_ID;
const stationString = process.env.RAINWAVE_STATION;
if (!apiKey) {
  throw new Error("RAINWAVE_API_KEY must be supplied.");
}
if (!userIdString) {
  throw new Error("RAINWAVE_USER_ID must be supplied.");
}
if (!stationString) {
  throw new Error("RAINWAVE_STATION must be supplied.");
}
if (!stationByString[stationString]) {
  throw new Error("Invalid station.");
}
const userId = parseInt(userIdString, 10);
const sid = stationByString[stationString];

const rw = new Rainwave({
  apiKey,
  userId,
  sid,
  debug: (msg) => console.log(msg),
});
rw.on("sched_current", (current) => {
  const currentSong = current.songs[0];
  const songTitle = currentSong.title;
  const albumName = currentSong.albums[0].name;
  const artistNames = currentSong.artists
    .map((artist) => artist.name)
    .join(", ");
  const formatted = `${artistNames}\n${albumName}\n${songTitle}`;
  fs.writeFile("./current.txt", formatted, (err) => {
    if (err) {
      console.warn(err);
    }
  });
  console.info(formatted);
});
rw.startWebSocketSync();
