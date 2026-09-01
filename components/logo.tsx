import Image from "next/image";
import { cn } from "@/lib/utils";

// Native aspect ratios of the trimmed assets
const MARK_RATIO = 66 / 85;   // blueLogo.png
const WORD_RATIO = 285 / 82;  // blueprintLogo-*.png

const MARK_HEIGHT_RATIO = 0.84;

// Native aspect ratio of the combined navbar logo (icon + wordmark in one image)
const MAIN_LOGO_RATIO = 241 / 60; // mainlogo.png

// Horizontal (navbar): single combined logo image
const H_HEIGHT = { sm: 32, default: 48, lg: 58, xl: 72 } as const;
const H_GAP = { default: 4, lg: 6, xl: 8 } as const;

// Vertical (auth pages): mark and wordmark stacked, centered, near-equal height
const V_HEIGHT = { default: 40, lg: 56, xl: 70 } as const;
const V_GAP = { default: 8, lg: 10, xl: 12 } as const;

export function Logo({
  className,
  markClassName,
  size = "default",
  variant = "vertical",
  onDark = false,
}: {
  className?: string;
  markClassName?: string;
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "horizontal" | "vertical";
  onDark?: boolean;
}) {
  const isHorizontal = variant === "horizontal";

  if (isHorizontal) {
    const h = H_HEIGHT[size];
    const w = Math.round(h * MAIN_LOGO_RATIO);

    return (
      <a
        href="#"
        aria-label="Blueprint doc home"
        className={cn("inline-flex flex-row items-center", className)}
      >
        <Image
          src="/mainlogo.png"
          alt="Blueprint doc"
          width={w}
          height={h}
          priority
          style={{ width: w, height: h }}
          className={cn("shrink-0 object-contain", markClassName)}
        />
      </a>
    );
  }

  const h = V_HEIGHT[size as "default" | "lg" | "xl"] ?? V_HEIGHT.default;
  const gap = V_GAP[size as "default" | "lg" | "xl"] ?? V_GAP.default;

  // Wordmark uses the full height; mark is scaled down relative to it.
  const wordHeight = h;
  const wordWidth = Math.round(wordHeight * WORD_RATIO);

  const markHeight = h;
  const markWidth = Math.round(markHeight * MARK_RATIO);

  return (
    <a
      href="#"
      aria-label="Blueprint doc home"
      className={cn("inline-flex flex-col items-center", className)}
      style={{ gap }}
    >
      <Image
        src="/blueLogo.png"
        alt=""
        width={markWidth}
        height={markHeight}
        priority
        style={{ width: markWidth, height: markHeight }}
        className={cn("shrink-0 object-contain", markClassName)}
      />

      <Image
        src={onDark ? "/blueprintLogo-light.png" : "/blueprintLogo-dark.png"}
        alt="Blueprint doc"
        width={wordWidth}
        height={wordHeight}
        priority
        style={{ width: wordWidth, height: wordHeight }}
        className="shrink-0 object-contain"
      />
    </a>
  );
}