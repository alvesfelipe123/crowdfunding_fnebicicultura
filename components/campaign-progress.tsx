import { getApprovedTotal } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

const CAMPAIGN_GOAL = 15000;

export async function CampaignProgress() {
  const raised = await getApprovedTotal();
  const percentage = Math.min(100, Math.round((raised / CAMPAIGN_GOAL) * 100));

  return (
    <div className="mb-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-center text-sm text-zinc-600 sm:text-base">
        Meta de arrecadação: <span className="font-bold text-teal-700">{formatPrice(CAMPAIGN_GOAL, { integer: true })}</span>
        {" · "}Já arrecadados:{" "}
        <span className="font-bold text-emerald-600">{formatPrice(Math.round(raised), { integer: true })}</span>
        {" · "}
        <span className="font-semibold text-zinc-800">{percentage}% da meta</span>
      </p>
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-emerald-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
