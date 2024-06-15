import type { CommandData, SlashCommandProps } from "commandkit";
import { getUserByDiscordId } from "../../db/utils";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  bold,
} from "discord.js";
import "dotenv";
import axios from "axios";
import { main } from "../../lib/utils";
import pool from "../../db";
import { ProfileInt } from "../../lib/types";

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
        await interaction.reply({
          content: `You have to verify first! Use \`/verify\``,
          ephemeral: true,
        });
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
        .addFields({ name: "Token", value: `\`${user?.token}\`` })
        .setFooter({ text: "If this token gets leaked inform support." });

      (await interaction.user.createDM()).send({ embeds: [tokenEmbed] });

      await interaction.reply({
        content: "Token sent to your DMs!",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      await interaction.reply(
        "Error fetching user data. Please try again later."
      );
    }
  } else if (options.getSubcommand() === "me") {
    let roles: string;
    await axios
      .get(
        `https://discord.com/api/v10//guilds/${interaction.guildId}/members/${interaction.user.id}`,
        {
          headers: {
            Authorization: `Bot ${process.env.TOKEN}`,
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        roles = response.data.roles
          .map((roleId: string) => `<@&${roleId}>`)
          .join(", ");
      })
      .catch((error) => {
        console.error(error);
      });
    const result = await pool.query(
      "SELECT minecraft_name FROM users WHERE id = $1",
      [interaction.user.id]
    );
    if (result.rows.length > 0) {
      const profile = main(
        `${result.rows[0].minecraft_name}`
      ) as unknown as ProfileInt;

      if (profile) {
        const embed = new EmbedBuilder()
          .setTitle("Your Profile")
          .addFields(
            {
              name: "Minecraft User",
              value: `${profile.name}`,
            },
            {
              name: "Roles",
              value: `${roles!}`,
            }
          )
          .setThumbnail(`${profile.avatar}`);
        interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        interaction.reply({
          content: "Failed to run command",
          ephemeral: true,
        });
      }
    }
  }
};
