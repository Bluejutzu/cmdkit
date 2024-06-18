import type { CommandData, SlashCommandProps } from "commandkit";
import { getUserByDiscordId, getUserProfile } from "../../db/utils";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  EmbedBuilder,
  bold,
} from "discord.js";
import "dotenv";
import axios from "axios";
import { Interaction, checkperms } from "../../lib/utils";

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
    let rolesAmount: number;
    let banner: string;
    let permissions: string;
    try {
      await axios
        .get(
          `https://discord.com/api/v10/guilds/${interaction.guildId}/members/${interaction.user.id}`,
          {
            headers: {
              Authorization: `Bot ${process.env.TOKEN}`,
            },
          }
        )
        .then((response) => {
          roles = response.data.roles
            .map((roleId: string) => `<@&${roleId}>`)
            .join(", ");
          rolesAmount = response.data.roles.length;
          permissions = response.data.permissions;
          banner = response.data.user.banner;
        })
        .catch((error) => {
          console.error(error);
        });

      const profile = await getUserByDiscordId(interaction.user.id);

      if (!profile) {
        interaction.reply({
          content: "No profile found",
          ephemeral: true,
        });
        return;
      }
      if (!permissions!) {
        permissions = "No permissions found for user.";
      }
      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setAuthor({
          name: `${profile.discordName}`,
          iconURL: `https://cdn.discordapp.com/avatars/953708302058012702/${interaction.user.avatar}.webp?size=1024&format=webp&width=0&height=281`,
        })
        .addFields(
          { name: "Discord\nUsername", value: `${interaction.user}` },
          { name: "Display", value: `${interaction.user.displayName}` },
          { name: "Minecraft\nUsername", value: `${profile.minecraftName}` },
          { name: "Username", value: `${profile.minecraftName}` },
          { name: `Roles [${rolesAmount!}]`, value: `${roles!}` },
          { name: "Server Permissions", value: `${permissions}` }
        )
        .setThumbnail(`${profile.avatar}`);

      interaction.reply({ embeds: [embed], ephemeral: true });
      const newInteraction = interaction as unknown as SlashCommandProps;
      checkperms(newInteraction!);
    } catch (error) {
      console.error(error);
      await interaction.reply("Failed operation");
    }
  }
};
