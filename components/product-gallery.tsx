"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const current = images[index];

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <Image
          src={current}
          alt={alt}
          fill
          priority
          className="object-contain p-4"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative aspect-square w-20 overflow-hidden rounded-xl border-2 bg-zinc-50 transition-opacity dark:bg-zinc-950 ${
                i === index
                  ? "border-indigo-600 opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`Ver imagem ${i + 1} de ${alt}`}
            >
              <Image
                src={img}
                alt=""
                fill
                className="object-contain p-1"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}