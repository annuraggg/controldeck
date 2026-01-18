"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MetricPoint } from "./useSystemMetrics";

export function MetricChart({
  title,
  subtitle,
  data,
  dataKey,
  cssColorVar,
  unit,
  WINDOW_MS,
  muted,
}: {
  title: string;
  subtitle?: string;
  data: MetricPoint[];
  dataKey: keyof MetricPoint;
  cssColorVar: string;
  unit?: string;
  WINDOW_MS: number;
  muted?: boolean;
}) {
  const color = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getComputedStyle(document.documentElement)
      .getPropertyValue(cssColorVar)
      .trim();
  }, [cssColorVar]);

  const latest = data[data.length - 1]?.[dataKey];

  if (!color) return null;

  if (data.length === 0) {
    return (
      <Card
        className={
          muted
            ? "border-dashed border-muted-foreground/50 bg-muted/40"
            : undefined
        }
      >
        <CardHeader className="flex flex-row items-baseline justify-between pb-2">
          <div className="space-y-0.5">
            <span className="text-sm font-medium">{title}</span>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="h-[220px]">
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Waiting for data…
          </div>
        </CardContent>
      </Card>
    );
  }

  const endTs = data[data.length - 1].ts;
  const startTs = endTs - WINDOW_MS;

  return (
    <Card
      className={
        muted ? "border-dashed border-muted-foreground/50 bg-muted/40" : undefined
      }
    >
      <CardHeader className="flex flex-row items-baseline justify-between pb-2">
        <div className="space-y-0.5">
          <span className="text-sm font-medium">{title}</span>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <span className="text-sm font-mono text-muted-foreground">
          {latest?.toFixed(2)}
          {unit}
        </span>
      </CardHeader>

      <CardContent className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient
                id={`${dataKey}-fill`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
              opacity={0.4}
            />

            <XAxis
              dataKey="ts"
              type="number"
              domain={[startTs, endTs]}
              hide
            />

            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />

            <Tooltip
              formatter={(value: number | undefined) =>
                value === undefined ? "" : `${value.toFixed(2)}${unit ?? ""}`
              }
              labelFormatter={(ts: number) => new Date(ts).toLocaleTimeString()}
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
            />

            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${dataKey}-fill)`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
