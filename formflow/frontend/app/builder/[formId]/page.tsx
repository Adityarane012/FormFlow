import { BuilderFormLoader } from "@/components/builder/BuilderFormLoader";

/**
 * Load the form in the browser (client fetch) so the same origin/URL as
 * POST /forms is used. Server-side fetch to localhost often fails or 404s
 * while the API is reachable from the browser only.
 */
export default function BuilderFormPage({
  params,
}: {
  params: { formId: string };
}) {
  return <BuilderFormLoader formId={params.formId} />;
}
