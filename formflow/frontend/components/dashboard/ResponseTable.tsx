"use client";

import { useMemo } from "react";
import type { FormField } from "@shared/schemaTypes";

export type ResponseRow = {
  id: string;
  submittedAt: string;
  answers: Record<string, unknown>;
};

type ResponseTableProps = {
  fields: FormField[];
  rows: ResponseRow[];
};

export function ResponseTable({ fields, rows }: ResponseTableProps) {
  const columns = useMemo(
    () => fields.map((f) => ({ id: f.id, label: f.label, type: f.type })),
    [fields]
  );

  function formatCell(fieldId: string, raw: unknown): string {
    if (raw === undefined || raw === null) return "—";
    if (Array.isArray(raw)) return raw.join(", ");
    if (typeof raw === "object") return JSON.stringify(raw);
    return String(raw);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/80">
              <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                Submitted
              </th>
              {columns.map((c) => (
                <th
                  key={c.id}
                  className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700"
                >
                  <span className="block max-w-[200px] truncate" title={c.label}>
                    {c.label}
                  </span>
                  <span className="mt-0.5 block text-xs font-normal text-gray-400">
                    {c.type}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  No responses yet. Share your public form link to collect
                  answers.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                    {new Date(r.submittedAt).toLocaleString()}
                  </td>
                  {columns.map((c) => (
                    <td
                      key={c.id}
                      className="max-w-[280px] px-4 py-3 text-gray-800"
                    >
                      <span className="line-clamp-3" title={formatCell(c.id, r.answers[c.id])}>
                        {formatCell(c.id, r.answers[c.id])}
                      </span>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
