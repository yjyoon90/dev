import { NextResponse } from "next/server";
import webpush from "web-push";
import { getSubscriptions } from "@/lib/api";
import { daysUntil } from "@/lib/format";
import { todayKST } from "@/lib/today";
import {
  getAllSubscribers,
  isPushStoreConfigured,
  removeSubscriber,
} from "@/lib/pushStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * 매일 실행(Vercel Cron)되어, 각 구독자의 관심단지 중
 * 오늘/내일 접수 시작 또는 오늘 접수 마감인 건을 푸시로 알린다.
 * CRON_SECRET 으로 보호.
 */
export async function GET(req: Request) {
  // 인증: Vercel Cron은 Authorization: Bearer <CRON_SECRET> 헤더를 보냄.
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  const qsSecret = url.searchParams.get("secret");
  if (secret && auth !== `Bearer ${secret}` && qsSecret !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";
  if (!pub || !priv || !isPushStoreConfigured()) {
    return NextResponse.json(
      { ok: false, error: "push not configured" },
      { status: 503 }
    );
  }
  webpush.setVapidDetails(subject, pub, priv);

  const today = todayKST();
  const { data } = await getSubscriptions();
  const byId = new Map(data.map((s) => [s.id, s]));

  const subscribers = await getAllSubscribers();
  let sent = 0;
  let removed = 0;

  for (const sub of subscribers) {
    const lead = Number.isFinite(sub.leadDays) ? sub.leadDays : 1;
    // 관심단지 중: 접수시작이 D-lead 또는 당일, 또는 마감 당일인 건.
    const hits = sub.favorites
      .map((id) => byId.get(id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s))
      .filter((s) => {
        const start = daysUntil(s.receiptStart, today);
        const end = daysUntil(s.receiptEnd, today);
        return start === lead || start === 0 || end === 0;
      });
    if (hits.length === 0) continue;

    const top = hits[0];
    const startD = daysUntil(top.receiptStart, today);
    const when =
      startD === 0
        ? "오늘 접수 시작"
        : startD != null && startD > 0
          ? `${startD}일 후 접수 시작`
          : "오늘 마감";
    const payload = JSON.stringify({
      title: `🔔 청약 ${when}`,
      body: `관심단지 «${top.name}»${
        hits.length > 1 ? ` 외 ${hits.length - 1}건` : ""
      }`,
      url: "/?tab=favorites",
      tag: "cheongyak-daily",
    });

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await webpush.sendNotification(sub.subscription as any, payload);
      sent += 1;
    } catch (err: unknown) {
      const code = (err as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        await removeSubscriber(sub.endpoint); // 만료된 구독 제거
        removed += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, subscribers: subscribers.length, sent, removed });
}
