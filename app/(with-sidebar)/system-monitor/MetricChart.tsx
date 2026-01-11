"use client";

import { useEffect, useState } from "react";
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
  data,
  dataKey,
  cssColorVar,
  unit,
  WINDOW_MS,
}: {
  title: string;
  data: MetricPoint[];
  dataKey: keyof MetricPoint;
  cssColorVar: string;
  unit?: string;
  WINDOW_MS: number;
}) {
  const [color, setColor] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  const latest = data[data.length - 1]?.[dataKey];

  // Resolve CSS color safely in browser
  useEffect(() => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(cssColorVar)
      .trim();
    setColor(value);
  }, [cssColorVar]);

  // Advance the time window
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!color) return null;

  const endTs = data.length ? data[data.length - 1].ts : Date.now();
  const startTs = endTs - WINDOW_MS;

  return (
    <Card>
      <CardHeader className="flex flex-row items-baseline justify-between pb-2">
        <span className="text-sm font-medium">{title}</span>
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
