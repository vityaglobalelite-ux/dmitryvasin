import type { ImgHTMLAttributes } from "react";

type HomeImgProps = ImgHTMLAttributes<HTMLImageElement> & {
  eager?: boolean;
};

/** Home rasters: below-fold lazy so the first screen is not competing with 10MB of PNG. */
export function HomeImg({
  eager = false,
  alt = "",
  decoding = "async",
  ...props
}: HomeImgProps) {
  return (
    <img
      alt={alt}
      {...props}
      decoding={decoding}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
    />
  );
}
