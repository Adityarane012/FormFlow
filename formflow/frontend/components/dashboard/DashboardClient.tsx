"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Download, LayoutDashboard } from "lucide-react";
import type { FormSchema } from "@shared/schemaTypes";
import {
  ResponseTable,
  type ResponseRow,
} from "@/components/dashboard/ResponseTable";
import { ResponseCharts } from "@/components/dashboard/ResponseCharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DashboardClientProps = {
  formId: string;
  schema: FormSchema;
  initialResponses: ResponseRow[];
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(schema: FormSchema, rows: ResponseRow[]) {
  const headers = ["submittedAt", ...schema.fields.map((f) => f.id)];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const cells = headers.map((h) => {
      if (h === "submittedAt") {
        return JSON.stringify(new Date(r.submittedAt).toISOString());
      }
      const v = r.answers[h];
      if (v === undefined || v === null) return '""';
      if (Array.isArray(v)) return JSON.stringify(v.join("; "));
      if (typeof v === "object") return JSON.stringify(JSON.stringify(v));
      return JSON.stringify(String(v));
    });
    lines.push(cells.join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `responses-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DashboardClient({
  formId,
  schema,
  initialResponses,
}: DashboardClientProps) {
  const rows = initialResponses;

  const exportPayload = useMemo(
    () =>
      rows.map((r) => ({
        submittedAt: r.submittedAt,
        answers: r.answers,
      })),
    [rows]
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
              <LayoutDashboard className="h-4 w-4" />
              Responses
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
              {schema.title || "Untitled form"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {rows.length} response{rows.length === 1 ? "" : "s"} · Form ID{" "}
              <span className="font-mono text-xs text-gray-600">{formId}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/builder/${formId}`}>Edit form</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() => downloadCsv(schema, rows)}
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="gap-2"
              onClick={() =>
                downloadJson(`responses-${formId}.json`, exportPayload)
              }
            >
              <Download className="h-4 w-4" />
              JSON
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <Tabs defaultValue="table" className="w-full">
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-6">
            <ResponseTable fields={schema.fields} rows={rows} />
          </TabsContent>
          <TabsContent value="charts" className="mt-6">
            <ResponseCharts schema={{ fields: schema.fields }} responses={rows} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
