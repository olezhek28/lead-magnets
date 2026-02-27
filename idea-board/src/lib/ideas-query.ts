import { getDb } from "@/lib/db";

interface QueryIdeasParams {
  sort?: string;
  category?: string | null;
  status?: string | null;
  search?: string;
  page?: number;
  limit?: number;
  currentUserId?: number | null;
}

export function queryIdeas({
  sort = "popular",
  category = null,
  status = null,
  search = "",
  page = 1,
  limit = 20,
  currentUserId = null,
}: QueryIdeasParams = {}) {
  const db = getDb();
  const offset = (page - 1) * limit;

  const conditions: string[] = ["i.status NOT IN ('moderation', 'archived')", "i.merged_into_id IS NULL"];
  const params: any[] = [];

  if (category) {
    conditions.push("i.category = ?");
    params.push(category);
  }

  if (status) {
    conditions.push("i.status = ?");
    params.push(status);
  }

  if (search) {
    conditions.push("(i.title LIKE ? OR i.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  let orderBy = "i.votes_count DESC, i.created_at DESC";
  let joinClause = "";

  if (sort === "trending") {
    joinClause = `
      LEFT JOIN (
        SELECT idea_id, COUNT(*) as recent_votes
        FROM votes
        WHERE voted_at > datetime('now', '-7 days')
        GROUP BY idea_id
      ) rv ON rv.idea_id = i.id
    `;
    orderBy = "COALESCE(rv.recent_votes, 0) DESC, i.votes_count DESC";
  } else if (sort === "new") {
    orderBy = "i.created_at DESC";
  }

  let voteSelect: string;
  const voteParams: any[] = [];
  if (currentUserId) {
    voteSelect = `, (SELECT 1 FROM votes WHERE user_id = ? AND idea_id = i.id) as user_voted`;
    voteParams.push(currentUserId);
  } else {
    voteSelect = `, 0 as user_voted`;
  }

  const countSql = `SELECT COUNT(*) as total FROM ideas i ${where}`;
  const total = (db.prepare(countSql).get(...params) as any).total;

  const sql = `
    SELECT i.*, u.username as author_username, u.first_name as author_name
    ${voteSelect}
    FROM ideas i
    JOIN users u ON u.id = i.author_id
    ${joinClause}
    ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const ideas = db.prepare(sql).all(...voteParams, ...params, limit, offset);

  return {
    ideas,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
