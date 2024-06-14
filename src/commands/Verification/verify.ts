import type { CommandData, SlashCommandProps } from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";

export const data: CommandData = {
    name: "verify",
    description: "Connect your Minecraft account to discord",
    options: [
        {
            name: "code",
            description: "The code provided to you for verification",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ]
}

export const run = async ({ interaction }: SlashCommandProps) => {};