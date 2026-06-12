"use client";

import { useEffect } from "react";

type LoadingTransitionProps = {
  onComplete: () => void;
};

const LOADING_MS = 1000;

export function LoadingTransition({ onComplete }: LoadingTransitionProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, LOADING_MS);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fh-loading-screen" role="status" aria-live="polite">
      <p className="fh-pixel-font fh-loading-screen__line fh-loading-screen__line--visible">
        Creating memory...
      </p>
      <div className="fh-loading-screen__bar" aria-hidden>
        <div className="fh-loading-screen__bar-fill" />
      </div>
    </div>
  );
}
