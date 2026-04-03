"use client";

import { useMemo } from "react";
import type { FormField } from "@shared/schemaTypes";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ResponseRow } from "@/components/dashboard/ResponseTable";

type ResponseChartsProps = {
  fields: FormField[];
  rows: ResponseRow[];
};

function countForField(
  field: FormField,
  rows: ResponseRow[]
): { name: string; count: number; percentage: number }[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const r of rows) {
    const raw = r.answers[field.id];
    if (raw === undefined || raw === null) continue;
    if (Array.isArray(raw)) {
      for (const x of raw) {
        const k = String(x);
        counts.set(k, (counts.get(k) ?? 0) + 1);
        total += 1;
      }
    } else {
      if (String(raw).trim() === "") continue;
      const k = String(raw);
      counts.set(k, (counts.get(k) ?? 0) + 1);
      total += 1;
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ 
      name, 
      count, 
      percentage: total > 0 ? (count / total) * 100 : 0 
    }))
    .sort((a, b) => b.count - a.count);
}

export function ResponseCharts({ fields, rows }: ResponseChartsProps) {
  const chartFields = useMemo(
    () =>
      fields.filter((f) =>
        ["select", "radio", "checkbox"].includes(f.type)
      ),
    [fields]
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center text-sm text-gray-500">
        Charts appear when you have responses and at least one choice-based
        question (dropdown, multiple choice, or checkboxes).
      </div>
    );
  }

  if (chartFields.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-sm">
        Add a dropdown, multiple choice, or checkbox field to unlock answer
        distribution charts.
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {chartFields.map((field) => {
        const data = countForField(field, rows);
        return (
          <div
            key={field.id}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-gray-900">{field.label}</h3>
            <p className="mt-1 text-xs text-gray-500 capitalize">{field.type}</p>
            <div className="mt-6 h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 8, right: 50, left: 0, bottom: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#374151", fontSize: 13, fontWeight: 500 }} 
                    width={140} 
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    formatter={(value: any, name: any, props: any) => [`${value} response(s)`, "Count"]}
                     labelFormatter={(label: any, props: any) => {
                      if (props && props[0]) {
                         return `${label} - ${props[0].payload.percentage.toFixed(1)}%`;
                      }
                      return label;
                    }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                      fontSize: "13px",
                      fontWeight: 500
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#3b82f6" 
                    radius={[0, 6, 6, 0]} 
                    barSize={32}
                    label={({ x, y, width, height, value, index }) => (
                      <text 
                        x={x + width + 10} 
                        y={y + height / 2 + 4} 
                        fill="#6b7280" 
                        fontSize="12" 
                        fontWeight="600"
                      >
                        {`${value} (${data[index].percentage.toFixed(0)}%)`}
                      </text>
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
