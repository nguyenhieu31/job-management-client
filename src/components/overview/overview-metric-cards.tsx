"use client";

import { OverviewDashboardResponse } from "@/types/overview";
import { TrendingUp, Users, UserCheck } from "lucide-react";

interface OverviewMetricCardsProps {
  data: OverviewDashboardResponse | null;
  loading: boolean;
}

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const cards = [
  {
    id: "card-accounts-receivable",
    key: "accountsReceivable" as const,
    label: "Công Nợ Khách Hàng",
    sublabel: "Tổng dư nợ chưa thanh toán",
    icon: TrendingUp,
    gradient: "from-rose-500/20 via-rose-400/10 to-transparent",
    iconColor: "text-rose-500",
    iconBg: "bg-rose-500/10",
    format: (v: number) => formatCurrency(v),
  },
  {
    id: "card-total-customers",
    key: "totalCustomers" as const,
    label: "Tổng Khách Hàng",
    sublabel: "Khách hàng đang hoạt động",
    icon: Users,
    gradient: "from-violet-500/20 via-violet-400/10 to-transparent",
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    format: (v: number) => v.toLocaleString("vi-VN"),
  },
  {
    id: "card-total-employees",
    key: "totalEmployees" as const,
    label: "Tổng Nhân Viên",
    sublabel: "Nhân viên đang hoạt động",
    icon: UserCheck,
    gradient: "from-emerald-500/20 via-emerald-400/10 to-transparent",
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    format: (v: number) => v.toLocaleString("vi-VN"),
  },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-muted" />
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
      <div className="h-8 w-32 rounded bg-muted mb-2" />
      <div className="h-3 w-24 rounded bg-muted/60" />
    </div>
  );
}

export default function OverviewMetricCards({
  data,
  loading,
}: OverviewMetricCardsProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {cards.map((c) => (
          <SkeletonCard key={c.id} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const rawValue = data[card.key] as number;
        return (
          <div
            key={card.id}
            id={card.id}
            className={`
              relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm
              hover:shadow-md hover:-translate-y-0.5 transition-all duration-300
            `}
          >
            {/* Gradient accent */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} pointer-events-none`}
            />

            <div className="relative">
              {/* Icon */}
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} mb-4`}
              >
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>

              {/* Value */}
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {card.format(rawValue)}
              </p>

              {/* Labels */}
              <p className="mt-1 text-sm font-semibold text-foreground/80">
                {card.label}
              </p>
              <p className="text-xs text-muted-foreground">{card.sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
