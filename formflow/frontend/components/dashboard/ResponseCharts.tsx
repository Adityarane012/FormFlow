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
): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const raw = r.answers[field.id];
    if (raw === undefined || raw === null) continue;
    if (Array.isArray(raw)) {
      for (const x of raw) {
        const k = String(x);
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
    } else {
      const k = String(raw);
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
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
                <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    interval={0}
                    angle={-18}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#111827" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
