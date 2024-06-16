import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { decodeBase64 } from "../../lib/utils";
import { ProfileInt, Response } from "../../lib/types";

export default async function (interaction: ChatInputCommandInteraction) {
  const { commandName, options } = interaction;
  if (commandName !== "whois") return;

  async function getPlayerUUID(username: string): Promise<string | undefined> {
    const url = `https://api.mojang.com/users/profiles/minecraft/${username}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = (await response.json()) as Response;
      return data.id;
    } catch (error) {
      console.error("Failed to get UUID:", error);
    }
  }

  async function getPlayerProfile(
    uuid: string
  ): Promise<ProfileInt | undefined> {
    const url = `https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      return data as ProfileInt;
    } catch (error) {
      console.error("Failed to get player profile:", error);
    }
  }

  async function main(username: string | undefined) {
    const startTime = new Date().getTime();
    let profile: ProfileInt | undefined = undefined;

    if (username) {
      const fetchedUUID = await getPlayerUUID(username);
      if (fetchedUUID) {
        profile = await getPlayerProfile(fetchedUUID);

        if (profile) {
          const textureUrl = profile?.properties?.[0].value;

          if (textureUrl) {
            const decodedValue = decodeBase64(textureUrl);
            const textureData = JSON.parse(decodedValue);
            profile.textureDecoded = textureData.textures.SKIN.url;

            const avatarUrl = `https://crafthead.net/avatar/${profile.id}`;
            profile.avatar = avatarUrl;
          }

          const endTime = new Date().getTime();
          const timeTaken = endTime - startTime;
          console.log(`Time taken: ${timeTaken} ms`);
          profile.timeTaken = timeTaken;
        }
      } else {
        console.error(`Failed to fetch UUID for username: ${username}`);
      }
    }

    return profile;
  }

  const usernameOption = options.getString("username") as string;

  const profile = await main(usernameOption);

  if (profile) {
    const embed = new EmbedBuilder()
      .setColor("Blurple")
      .setAuthor({ name: "Mojang API" })
      .addFields(
        { name: "Username", value: `${profile.name}` },
        { name: "ID", value: `${profile.id}` }
      )
      .setThumbnail(`${profile.avatar}`)
      .setTimestamp()
      .setFooter({ text: `Operation took ${profile.timeTaken} ms to finish` });

    interaction.reply({ embeds: [embed] });
  } else {
    interaction.reply("Failed to fetch Minecraft profile.");
  }
}
