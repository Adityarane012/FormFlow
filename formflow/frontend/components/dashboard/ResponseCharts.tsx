"use client";

import { useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface ResponseChartsProps {
  schema: any;
  responses: any[];
}

export function ResponseCharts({ schema, responses }: ResponseChartsProps) {
  const fieldAnalytics = useMemo(() => {
    if (!schema || !responses || responses.length === 0) return [];

    return schema.fields
      .filter((f: any) => ["radio", "select", "checkbox"].includes(f.type))
      .map((f: any) => {
        const counts: Record<string, number> = {};
        f.options?.forEach((opt: string) => (counts[opt] = 0));

        responses.forEach((r) => {
          const val = r.answers[f.id];
          if (Array.isArray(val)) {
            val.forEach((v) => { if (counts[v] !== undefined) counts[v]++; });
          } else if (val && counts[val] !== undefined) {
            counts[val]++;
          }
        });

        const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
        return { field: f, data };
      });
  }, [schema, responses]);

  if (fieldAnalytics.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-bold text-foreground">Analytics</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {fieldAnalytics.map(({ field, data }: any, idx: number) => (
          <div key={field.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-6 text-sm font-semibold text-foreground">{field.label}</h3>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {idx % 2 === 0 ? (
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: "#64748b" }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: "#64748b" }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {data.map((_: any, i: number) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((_: any, i: number) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
