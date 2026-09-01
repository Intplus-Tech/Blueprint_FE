import Image from "next/image";

export function AuthLayout({
  children,
  centered = false,
}: {
  children: React.ReactNode;
  centered?: boolean;
}) {
  if (centered) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen w-full">
      {/* Left: hero image panel */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-gray-900 lg:flex">
        <Image
          src="/sidebar-logo.png"
          alt=""
          fill
          priority
          className="object-cover"
        />
        {/* subtle bottom-only gradient so the photo stays visible, like the reference */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="relative z-10 flex w-full flex-col items-center justify-center gap-2 px-8 text-center">
          <Image
            src="/blueLogo.png"
            alt=""
            width={140}
            height={140}
            priority
            quality={100}
            sizes="101px"
            className="h-[78px] w-[78px] shrink-0 object-contain contrast-125 brightness-110 saturate-125 drop-shadow-md md:h-[101px] md:w-[101px]"
          />

          <Image
            src="/blueprintLogo-light.png"
            alt="Blueprint doc"
            width={500}
            height={140}
            priority
            quality={100}
            className="h-auto w-[251px] shrink-0 object-contain contrast-125 brightness-110 saturate-125 drop-shadow-md md:w-[314px]"
          />
        </div>

        <span className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs text-gray-200">
          Powered By: <span className="font-medium text-white">Al Torney</span>
        </span>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full flex-1 items-center justify-center bg-gray-100 px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-xs">{children}</div>
      </div>
    </main>
  );
}