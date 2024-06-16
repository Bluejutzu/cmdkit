import type { CommandData, SlashCommandProps } from "commandkit";
import { ApplicationCommandOptionType, EmbedBuilder } from "discord.js";
import { saveVerificationCode } from "../../../db/utils";
import { getPlayerUUID, main } from "../../../lib/utils";

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
    const profile = await main(mcUsername);
    const uuid = profile?.id;
    if (!uuid) {
      await interaction.followUp("Failed to get Minecraft UUID.");
      return;
    }

    const code = await saveVerificationCode(
      mcUsername,
      uuid,
      interaction.user.id,
      profile.avatar,
      profile
    );

    const embed = new EmbedBuilder()
      .setTitle("Verification Code")
      .setDescription(
        `Your verification code is: ${code}. Use this code to verify your account within 60 seconds.`
      )
      .setTimestamp();

    await interaction.followUp({ embeds: [embed], ephemeral: true });
  } catch (error: any) {
    if (error.detail == `Key (id)=(${interaction.user.id}) already exists.`) {
      await interaction.followUp({
        content: "This account is already verified.",
        ephemeral: true,
      });
      return;
    } else {
      console.log("Failed to generate code", error);
      await interaction.followUp({
        content: "other error",
        ephemeral: true,
      });
      return;
    }
  }
};
