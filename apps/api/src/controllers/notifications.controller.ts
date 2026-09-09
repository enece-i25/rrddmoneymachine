import type { Request, Response } from "express";
import { z } from "zod";
import { pool } from "../db/client.js";

export async function registerDeviceTokenController(req: Request, res: Response): Promise<void> {
  try {
    const input = z.object({ fcmToken: z.string().min(1), platform: z.enum(["web", "android", "ios"]) }).parse(req.body);
    await pool.query(`INSERT INTO device_tokens (user_id, fcm_token, platform) VALUES ($1, $2, $3) ON CONFLICT (user_id, fcm_token) DO UPDATE SET platform = EXCLUDED.platform`, [req.user!.userId, input.fcmToken, input.platform]);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Unable to register device token" });
  }
}
