import type { CommandData, SlashCommandProps } from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";

export const data: CommandData = {
    name: "verify",
    description: "Connect your Minecraft account to discord",
    options: [
        {
            name: "username",
            description: "Your user",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ]
}