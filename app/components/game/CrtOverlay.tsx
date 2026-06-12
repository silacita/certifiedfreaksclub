type CrtOverlayProps = {
  variant?: "title" | "default";
};

export function CrtOverlay({ variant = "default" }: CrtOverlayProps) {
  return (
    <>
      <div className="fh-vhs-noise" aria-hidden />
      <div className="fh-crt-scanlines" aria-hidden />
      <div className="fh-crt-chromatic" aria-hidden />
      <div className="fh-crt-flicker" aria-hidden />
      <div
        className={`fh-crt-vignette ${variant === "title" ? "fh-crt-vignette--title" : ""}`}
        aria-hidden
      />
    </>
  );
}
