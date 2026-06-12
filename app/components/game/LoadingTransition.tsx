"use client";

import { useEffect } from "react";

type LoadingTransitionProps = {
  onComplete: () => void;
};

export function LoadingTransition({ onComplete }: LoadingTransitionProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 3200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fh-loading-screen" role="status" aria-live="polite">
      <p className="fh-pixel-font fh-loading-screen__line">No previous save found.</p>
      <p className="fh-pixel-font fh-loading-screen__line">Creating memory...</p>
    </div>
  );
}
