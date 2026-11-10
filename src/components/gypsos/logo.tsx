import Image from "next/image";

/**
 * The supplied GYPSOS logo (white artwork on transparent, 500x500 canvas).
 * The artwork occupies x 35–485, y 186–288 of the canvas; this wrapper only trims the empty
 * transparent padding by cropping to that box. Pixels, colours and proportions are untouched.
 */
export function Logo({ className = "", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ aspectRatio: "450 / 102" }}
      role="img"
      aria-label="GYPSOS"
    >
      <Image
        src="/images/gypsos/gypsos-logo.png"
        alt=""
        width={500}
        height={500}
        priority={priority}
        className="absolute h-auto max-w-none select-none"
        style={{ width: "111.111%", left: "-7.778%", top: "-182.353%" }}
      />
    </span>
  );
}
