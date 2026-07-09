import type { SubscriptionStatus } from "@/lib/types";
import { statusColor } from "@/lib/format";

export default function StatusBadge({
  status,
}: {
  status: SubscriptionStatus;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusColor(
        status
      )}`}
    >
      {status}
    </span>
  );
}
