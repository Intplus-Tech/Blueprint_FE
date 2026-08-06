import Image from 'next/image'
import { cn } from "@/lib/utils";

export function Logo({
  className,
  markClassName,
  size = "default",
  onDark = false,
}: {
  className?: string;
  markClassName?: string;
  size?: "default" | "lg";
  /** Use white wordmark for dark/photo backgrounds (doc stays brand blue) */
  onDark?: boolean;
}) {
  return (
    <a href="#" className={cn("flex items-center gap-2", { "aria-label": "Blueprint doc home" })}>
      {/* PNG Logo Icon with auto height/width styles */}
      <Image
        src="/mainlogo.png"
        alt=""
        width={34}
        height={34}
        priority
        style={{ width: 'auto', height: 'auto' }}
        className="shrink-0 object-contain"
      />
    </a>
  )
}