import Link from "next/link";

/**
 * Small popover used by toolbar actions that require auth (New Document,
 * Add Co-Signer(s), AI Review). Matches the "Sign in to ..." pattern from
 * the Figma design.
 */
export function ToolInfoPopover({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
      <h3 className="mb-1.5 text-sm font-bold text-gray-900">{title}</h3>
      <p className="text-sm leading-snug text-gray-500">
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>{" "}
        {children}
      </p>
    </div>
  );
}