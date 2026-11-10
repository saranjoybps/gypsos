import Image from "next/image";

/** The supplied GYPSOS 25 kg bag artwork (public/images/gypsos/gypsos-bag.png, 1024x1536). Size it via the wrapper className. */
export function BagImage({ className = "", sizes, priority = false }: { className?: string; sizes: string; priority?: boolean }) {
  return (
    <div className={`relative aspect-[2/3] ${className}`}>
      <Image src="/images/gypsos/gypsos-bag.png" alt="GYPSOS Gypsum Powder 25 kg bag" fill sizes={sizes} priority={priority} className="object-contain" />
    </div>
  );
}
