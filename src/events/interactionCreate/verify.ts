import { ChatInputCommandInteraction, inlineCode } from "discord.js";
import { verifyCode } from "../../db/utils";

export default async function (interaction: ChatInputCommandInteraction) {
  const { commandName, options } = interaction;
  if (commandName !== "verify") return;
  const code = options.getString("code");
  if (!code) {
    await interaction.reply("You must provide a verification code.");
    return;
  }

  const success = await verifyCode(interaction.user.username, code);
  if (!success) {
    await interaction.reply("Invalid or expired verification code.");
    return;
  }

  await interaction.reply({
    content: `Successfully verified! Discord ID ${interaction.user.id} is now linked with Minecraft username.`,
    ephemeral: true,
  });
}
