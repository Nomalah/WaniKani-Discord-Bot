import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, Collection, Intents } from "discord.js";
import * as wanikani from "./wanikani.js";
import cron from "cron";
import dotenv from "dotenv";

dotenv.config();

const DISCORD_TOKEN = process.env["DISCORD_TOKEN"]
const WANIKANI_TOKENS = JSON.parse(process.env["WANIKANI_TOKENS"]);
const TEST_GUILD_ID = process.env["TEST_GUILD_ID"];
console.log(DISCORD_TOKEN, WANIKANI_TOKENS, TEST_GUILD_ID)

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commands = [];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.once('ready', () => {
    const CLIENT_ID = client.user.id;
    const rest = new REST({
        version: '9'
    }).setToken(DISCORD_TOKEN);
    (async () => {
        try {
            if (!TEST_GUILD_ID) {
                await rest.put(
                    Routes.applicationCommands(CLIENT_ID), {
                    body: commands
                },
                );
                console.log('Successfully registered application commands globally');
            } else {
                await rest.put(
                    Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID), {
                    body: commands
                },
                );
                console.log('Successfully registered application commands for development guild');
            }
        } catch (error) {
            console.error(error);
        }
    })();

    let scheduledMessage = new cron.CronJob('0 0 10,14,19,23 * * *', async () => {
        const guild = client.guilds.cache.get(TEST_GUILD_ID);
        const channel = guild.channels.cache.get("924956537787662336");
        let standings = "";
        for (let token of WANIKANI_TOKENS) {
            let userStats = await wanikani.statsForDay(token);
            
            standings += `**${await wanikani.getName(token)}'s** stats for the day:\nReviews Completed: ${userStats["reviewsCompleted"]}\nReviews Remaining: ${userStats["reviewsPending"]}\nLessons Completed: ${userStats["lessonsCompleted"]}\nLessons Remaining: ${userStats["lessonsPending"]}\n\n`;
        }
        console.log(standings)
        channel.send(standings);
    });
    (async () => {
        const guild = client.guilds.cache.get(TEST_GUILD_ID);
        const channel = guild.channels.cache.get("924956537787662336");
        let standings = "";
        for (let token of WANIKANI_TOKENS) {
            let userStats = await wanikani.statsForDay(token);
            standings += `**${await wanikani.getName(token)}'s** stats for the day:\nReviews Completed: ${userStats["reviewsCompleted"]}\nReviews Remaining: ${userStats["reviewsPending"]}\nLessons Completed: ${userStats["lessonsCompleted"]}\nLessons Remaining: ${userStats["lessonsPending"]}\n\n`;
        }
        console.log(standings)
        channel.send(standings);
    })();
    // When you want to start it, use:
    scheduledMessage.start()
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(error);
        await interaction.followUp({ content: "There was an error while executing this command!", ephemeral: true });
    }
});

client.login(DISCORD_TOKEN);