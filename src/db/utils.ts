import pool from "./index";
import { v4 as uuidv4 } from "uuid";
import { ProfileInt, User } from "../lib/types";
import { generateCode, timeout } from "../lib/utils";

export async function saveVerificationCode(
  mcUsername: string,
  uuid: string,
  id: string,
  avatar?: string,
  profile?: ProfileInt | undefined
): Promise<string> {
  const code = await generateCode();
  const token = uuidv4();

  await pool.query(
    "INSERT INTO users (id, uuid, minecraft_name, avatarurl, token, code) VALUES ($1, $2, $3, $4, $5, $6)",
    [id, uuid, mcUsername, avatar, token, code]
  );
  (async () => {
    await timeout(60000);
    await pool.query(
      "DELETE FROM users WHERE code = $1 AND discord_name IS NULL",
      [code]
    );
  })();

  return code;
}

export async function verifyCode(
  discordName: string,
  code: string,
): Promise<boolean> {
  const result = await pool.query("SELECT * FROM users WHERE code = $1", [
    code,
  ]);
  const user = result.rows[0];

  if (!user) {
    return false;
  }

  await pool.query(
    "UPDATE users SET discord_name = $1",
    [discordName]
  );

  return true;
}
export async function getUserByDiscordId(id: string): Promise<User | null> {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];

  return {
    id: user.id,
    uuid: user.uuid,
    createdAt: user.created_at,
    discordName: user.discord_name,
    minecraftName: user.minecraft_name,
    token: user.token,
    code: user.code,
    avatar: user.avatarurl || null,
  };
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (result.rows.length > 0) {
      return result.rows[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Failed to get user profile", error);
    return null;
  }
}
