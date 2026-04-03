import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <p className="text-sm font-medium text-gray-400">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">
        This page doesn&apos;t exist
      </h1>
      <p className="mt-2 max-w-md text-center text-gray-500">
        The form or resource you&apos;re looking for may have been removed, or
        the link is incorrect.
      </p>
      <Button asChild className="mt-8 rounded-xl">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
