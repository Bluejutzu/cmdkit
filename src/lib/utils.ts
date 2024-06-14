import { ProfileInt, Response } from "./types";

export function decodeBase64(base64: string): string {
  return Buffer.from(base64, "base64").toString("utf-8");
}
export async function generateCode(): Promise<string> {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_`';
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < 15; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function getPlayerUUID(username: string): Promise<string | undefined> {
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

export async function getPlayerProfile(
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

export async function main(username: string | undefined) {
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