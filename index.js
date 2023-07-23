import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import * as wanikani from "./wanikani.js";
import cron from "cron";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_TOKEN = process.env["DISCORD_TOKEN"]
const WANIKANI_TOKENS = JSON.parse(process.env["WANIKANI_TOKENS"]);
const TEST_GUILD_ID = process.env["TEST_GUILD_ID"];
console.log(DISCORD_TOKEN, WANIKANI_TOKENS, TEST_GUILD_ID)

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

async function sendMessage() {
    const guild = client.guilds.cache.get(TEST_GUILD_ID);
    const channel = guild.channels.cache.get("924956537787662336");
    const standings = new EmbedBuilder();
    standings.setTitle("WaniKani Standings: " + new Date().toLocaleDateString());

    let description = "";
    for (const token of WANIKANI_TOKENS) {
        let userStats = await wanikani.statsForDay(token);
        const user = await wanikani.getUser(token);
        description += `**[${user.username}'s](${user.profile_url})** [Level ${user.level}]:\n`;
        description += `  -> Reviews Completed: ${userStats["reviewsCompleted"]}\n`;
        description += `  -> Reviews Remaining: ${userStats["reviewsPending"]}\n`;
        description += `  -> Lessons Completed: ${userStats["lessonsCompleted"]}\n`;
        description += `  -> Lessons Remaining: ${userStats["lessonsPending"]}\n`;
        description += "\n";
    }
    standings.setDescription(description);
    channel.send({ embeds: [standings] });
}

client.once('ready', async () => {
    let scheduledMessage = new cron.CronJob('0 12 */2 * * *', () => sendMessage());
    sendMessage();
    
    // for (const token of WANIKANI_TOKENS) {
    //     await wanikani.statsForDay(token);
    // }
    // When you want to start it, use:
    scheduledMessage.start()
});

client.login(DISCORD_TOKEN);