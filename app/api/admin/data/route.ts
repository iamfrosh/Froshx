import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import Registration from "@/models/Registration";
import Draft from "@/models/Draft";
import Visit from "@/models/Visit";

export const dynamic = "force-dynamic";

const LAGOS_OFFSET_MS = 60 * 60 * 1000; // Africa/Lagos is UTC+1, no daylight saving

function startOfLagosDay(daysAgo = 0) {
  const now = Date.now() + LAGOS_OFFSET_MS;
  const day = Math.floor(now / 86400000) * 86400000 - daysAgo * 86400000;
  return new Date(day - LAGOS_OFFSET_MS);
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const today = startOfLagosDay(0);
    const week = startOfLagosDay(6);
    const fortnight = startOfLagosDay(13);

    const [
      registrations, drafts, totalRegs, regsToday, regsWeek,
      byCourse, byMode, byStatus,
      viewsTotal, viewsToday, viewsWeek, uniqueTotal, uniqueToday, uniqueWeek,
      daily, topPages, sources,
    ] = await Promise.all([
      Registration.find().sort({ createdAt: -1 }).limit(1000).lean(),
      Draft.find().sort({ updatedAt: -1 }).limit(200).lean(),
      Registration.countDocuments(),
      Registration.countDocuments({ createdAt: { $gte: today } }),
      Registration.countDocuments({ createdAt: { $gte: week } }),
      Registration.aggregate([{ $group: { _id: "$courseTitle", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Registration.aggregate([{ $group: { _id: "$mode", count: { $sum: 1 } } }]),
      Registration.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Visit.countDocuments(),
      Visit.countDocuments({ createdAt: { $gte: today } }),
      Visit.countDocuments({ createdAt: { $gte: week } }),
      Visit.distinct("sid").then((a) => a.length),
      Visit.distinct("sid", { createdAt: { $gte: today } }).then((a) => a.length),
      Visit.distinct("sid", { createdAt: { $gte: week } }).then((a) => a.length),
      Visit.aggregate([
        { $match: { createdAt: { $gte: fortnight } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Africa/Lagos" } },
            views: { $sum: 1 },
            visitors: { $addToSet: "$sid" },
          },
        },
        { $project: { views: 1, visitors: { $size: "$visitors" } } },
        { $sort: { _id: 1 } },
      ]),
      Visit.aggregate([{ $group: { _id: "$path", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 6 }]),
      Visit.aggregate([
        { $match: { referrer: { $nin: ["", null] } } },
        { $group: { _id: "$referrer", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
    ]);

    return NextResponse.json({
      registrations: registrations.map((r) => ({ ...r, _id: String(r._id) })),
      drafts: drafts.map((d) => ({ ...d, _id: String(d._id) })),
      stats: {
        totalRegs, regsToday, regsWeek, byCourse, byMode, byStatus,
        visits: { viewsTotal, viewsToday, viewsWeek, uniqueTotal, uniqueToday, uniqueWeek, daily, topPages, sources },
        draftCount: drafts.length,
      },
    });
  } catch (err) {
    console.error("admin data error", err);
    return NextResponse.json({ error: "Could not load data. Check MONGODB_URI." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!id || !["new", "contacted", "confirmed", "cancelled"].includes(status || "")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  await connectDB();
  await Registration.findByIdAndUpdate(id, { status });
  return NextResponse.json({ ok: true });
}
