import { ChatInputCommandInteraction, inlineCode } from "discord.js";
import { getVerificationData, deleteVerificationCode } from "../../redis";
import { createUser, getUserByDiscordId } from "../../db/utils";

export default async function verifyCommand(
  interaction: ChatInputCommandInteraction
) {
  const { commandName, options } = interaction;
  if (commandName !== "verify") return;
  const code = options.getString("code") as string;
  const data = await getVerificationData(code);
  const userId = interaction.user.id;

  const user = await getUserByDiscordId(userId);
  console.log(user);
  if (!user) {
    await createUser(
      interaction.user.username,
      data.mcUsername,
      data.token,
      userId,
      data.profile.id
    );
    
    await interaction.reply(
      `Successfully verified! Discord ID ${interaction.user.id} is now linked with Minecraft username ${data.mcUsername}.`
    );

    await deleteVerificationCode(code);
  } else {
    await deleteVerificationCode(code);
    interaction.reply(
      `You are already verified try running ${inlineCode("/mcAccount profile")}`
    );
  }
}
