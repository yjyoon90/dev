import { NextResponse } from "next/server";
import {
  isPushStoreConfigured,
  removeSubscriber,
  saveSubscriber,
} from "@/lib/pushStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 푸시 구독 등록/갱신. body: { subscription, favorites } */
export async function POST(req: Request) {
  if (!isPushStoreConfigured()) {
    return NextResponse.json(
      { ok: false, error: "push store not configured" },
      { status: 503 }
    );
  }
  try {
    const { subscription, favorites, leadDays } = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json(
        { ok: false, error: "invalid subscription" },
        { status: 400 }
      );
    }
    const lead = Number.isFinite(leadDays) ? Math.max(0, Math.min(14, leadDays)) : 1;
    await saveSubscriber(
      subscription,
      Array.isArray(favorites) ? favorites : [],
      lead
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
}

/** 구독 해제. body: { endpoint } */
export async function DELETE(req: Request) {
  try {
    const { endpoint } = await req.json();
    if (endpoint) await removeSubscriber(endpoint);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
