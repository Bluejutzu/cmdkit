import type { CommandData, SlashCommandProps } from "commandkit";
import { ApplicationCommandOptionType } from "discord.js";

export const data: CommandData = {
  name: "generate-code",
  description: ".",
  options: [
    {
      name: "username",
      description: ".",
      type: ApplicationCommandOptionType.String,
      required: true
    },
  ],
};

export const run = async ({ interaction }: SlashCommandProps) => {};
