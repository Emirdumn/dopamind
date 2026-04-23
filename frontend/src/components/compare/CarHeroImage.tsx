"use client";

import { useState, useEffect } from "react";
import { slugCarImage, carGradient } from "@/lib/car-image";

/**
 * Hero car visual used in the vertical compare columns. Tries to load a
 * real photograph from `/public/cars/{slug}.jpg`; on failure silently drops
 * to a deterministic brand-tinted gradient so the column never renders a
 * broken image icon (doc §4 "Ambient Shadows" / no heavy default shadows).
 *
 * The image is rendered contained (not cover) so uploaded studio shots —
 * which typically isolate the car on transparent/dark backgrounds — read
 * correctly inside the surface-container-low tile.
 */
export default function CarHeroImage({
  brand,
  model,
  alt,
  className = "",
}: {
  brand?: string | null;
  model?: string | null;
  alt: string;
  className?: string;
}) {
  const src = slugCarImage({ brand, model });
  const [broken, setBroken] = useState(false);

  // Reset when the underlying car changes (e.g. "change vehicle" swap)
  useEffect(() => {
    setBroken(false);
  }, [src]);

  return (
    <div
      className={`relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-surface-container-low ${className}`}
      style={broken ? { background: carGradient(brand) } : undefined}
    >
      {/* primary light-bleed behind the car (doc §4) */}
      <div className="absolute inset-0 light-bleed pointer-events-none" aria-hidden="true" />

      {!broken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setBroken(true)}
          className="absolute inset-0 w-full h-full object-contain p-3"
          draggable={false}
        />
      )}
    </div>
  );
}
