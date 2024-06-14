import type { CommandData, SlashCommandProps } from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";

export const data: CommandData = {
  name: "whois",
  description: "Find a minecraft",
  options: [
    {
      name: "username",
      description: "Minecraft username to verify",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};
export const run = async ({ interaction }: SlashCommandProps) => {};
