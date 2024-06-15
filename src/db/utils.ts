import pool from "./index";
import { v4 as uuidv4 } from "uuid";
import { User } from "../lib/types";
import { generateCode, timeout } from "../lib/utils";

export async function saveVerificationCode(
  mcUsername: string,
  uuid: string,
  id: string
): Promise<string> {
  const code = await generateCode();
  const token = uuidv4();

  await pool.query(
    "INSERT INTO users (id, uuid, minecraft_name, code, token) VALUES ($1, $2, $3, $4, $5)",
    [id, uuid, mcUsername, code, token]
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
  code: string
): Promise<boolean> {
  const result = await pool.query("SELECT * FROM users WHERE code = $1", [
    code,
  ]);
  const user = result.rows[0];

  if (!user) {
    return false;
  }

  await pool.query(
    "UPDATE users SET discord_name = $1, code = NULL WHERE code = $2",
    [discordName, code]
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
    role: user.role,
    token: user.token,
    code: user.code,
  };
}

export async function checkDB(id: string): Promise<boolean> {
  try {
    const result = await pool.query(
      "SELECT EXISTS (SELECT 1 FROM users WHERE id = $1)",
      [id]
    );
    return result.rows[0].exists;
  } catch (error) {
    console.error("Failed to check existence", error);
    return false;
  }
}
