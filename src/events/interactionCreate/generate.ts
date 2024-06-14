import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getPlayerProfile, decodeBase64, getPlayerUUID } from "../../lib/utils";
import { generateCode } from "../../lib/utils";
import { saveVerificationCode } from "../../redis";

export default async function generateCommand(
  interaction: ChatInputCommandInteraction
) {
  const { commandName, options } = interaction;
  if (!interaction.isCommand()) return;
  if (commandName !== "generate-code") return;

  const mcUsername = options.getString("username") as string;

  const uuid = (await getPlayerUUID(mcUsername)) as string;

  const profile = await getPlayerProfile(uuid);
  if (!profile) {
    await interaction.reply("Failed to get Minecraft profile.");
    return;
  }

  const code = await generateCode();
  const token = await generateCode();

  await saveVerificationCode(
    code,
    { discordId: interaction.user.id, mcUsername, token, profile },
    300
  );

  await interaction.reply(
    `Your verification code is: ${code}. Use this code to verify your account within 5 minutes.`
  );
}
