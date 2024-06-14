import type { CommandData, SlashCommandProps } from "commandkit";
import { getUserByDiscordId } from "../../db/utils";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  bold,
} from "discord.js";

export const data: CommandData = {
  name: "mc-profile",
  description: "Get Data from your connected account",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "token",
      description: "Get your Token messaged",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "me",
      description: "Get your profile data",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
};

export const run = async ({ interaction }: SlashCommandProps) => {
  const { options, command } = interaction;

  if (options.getSubcommand() === "token") {
    try {
      const user = await getUserByDiscordId(interaction.user.id);

      if (!user) {
        await interaction.reply(`You have to verify first! Use \`/verify\``);
        return;
      }

      const tokenEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Direct Message: Token")
        .setDescription(
          `This information is ${bold(
            "confidential"
          )}! Only the database managers and yourself are able to access this.`
        )
        .addFields({ name: "Token", value: `\`${user.token}\`` })
        .setFooter({text: "If this token gets leaked inform support."});
        

      (await interaction.user.createDM()).send({ embeds: [tokenEmbed] });

      await interaction.reply("Token sent to your DMs!");
    } catch (error) {
      console.error("Error fetching user data:", error);
      await interaction.reply(
        "Error fetching user data. Please try again later."
      );
    }
  } else if (options.getSubcommand() === "profile") {
  }
};
