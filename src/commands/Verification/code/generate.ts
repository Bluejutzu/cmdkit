import type { CommandData, SlashCommandProps } from "commandkit";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { checkDB, saveVerificationCode } from "../../../db/utils";
import { getPlayerUUID } from "../../../lib/utils";

export const data: CommandData = {
  name: "generate-code",
  description: "Generate verification code",
  options: [
    {
      name: "username",
      description: "username",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export const run = async ({ interaction }: SlashCommandProps) => {
  const { commandName, options } = interaction;

  if (!interaction.isCommand()) return;
  if (commandName !== "generate-code") return;

  const mcUsername = options.getString("username");
  if (!mcUsername) {
    await interaction.reply("You must provide a Minecraft username.");
    return;
  }
  await interaction.deferReply();

  try {
    const uuid = await getPlayerUUID(mcUsername);
    if (!uuid) {
      await interaction.followUp("Failed to get Minecraft UUID.");
      return;
    }

    const userId = interaction.user.id;
    const exists = await checkDB(userId);
    if (exists) {
      const uuid = await getPlayerUUID(mcUsername);
      if (!uuid) {
        throw new Error(`Failed to get Minecraft UUID for ${mcUsername}`);
      }

      const code = await saveVerificationCode(mcUsername, uuid, userId);

      const embed = new EmbedBuilder()
        .setTitle("Verification Code")
        .setDescription(
          `Your verification code is: ${code}. Use this code to verify your account within 60 seconds.`
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      await interaction.reply({
        content: "This account is already verified.",
        ephemeral: true,
      });
    }
  } catch (error: any) {
    if (error.detail == `Key (id)=(${interaction.user.id}) already exists.`) {
      console.log(error.detail);
      await interaction.followUp({
        content: "This account is already verified.",
        ephemeral: true,
      });
    }
  }
};
