import { Router } from "express";
import { db } from "@workspace/db";
import { missionsTable, charactersTable } from "@workspace/db";
import { desc, eq, and, lt, gt, sql } from "drizzle-orm";
import { MISSIONS } from "@workspace/shared";
import type { MissionDifficulty } from "@workspace/shared";

const router = Router();

router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"] ?? 50), 200);
  const statusFilter = req.query["status"] as string | undefined;
  const now = new Date();

  try {
    const rows = await db
      .select({
        id: missionsTable.id,
        user_id: missionsTable.user_id,
        username: charactersTable.username,
        difficulty: missionsTable.difficulty,
        started_at: missionsTable.started_at,
        ends_at: missionsTable.ends_at,
        collected: missionsTable.collected,
      })
      .from(missionsTable)
      .innerJoin(charactersTable, eq(missionsTable.user_id, charactersTable.user_id))
      .orderBy(desc(missionsTable.started_at))
      .limit(limit);

    const missions = rows.map(r => {
      const def = MISSIONS[r.difficulty as MissionDifficulty];
      const isCompleted = r.collected === 1;
      const isFailed = !isCompleted && r.ends_at < now;
      const isInProgress = !isCompleted && r.ends_at >= now;

      return {
        id: r.id,
        user_id: r.user_id,
        username: r.username,
        difficulty: r.difficulty,
        label: def?.label ?? r.difficulty,
        emoji: def?.emoji ?? "🗺️",
        status: isCompleted ? "completed" : isFailed ? "failed" : "in_progress",
        started_at: r.started_at.toISOString(),
        ends_at: r.ends_at.toISOString(),
      };
    });

    // Apply status filter
    const filtered = statusFilter && statusFilter !== "all"
      ? missions.filter(m => m.status === statusFilter)
      : missions;

    res.json({ missions: filtered });
  } catch (err) {
    req.log.error({ err }, "missions-log error");
    res.status(500).json({ error: "internal" });
  }
});

export default router;
