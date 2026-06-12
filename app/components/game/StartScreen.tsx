"use client";

import { useCallback, useEffect, useState } from "react";

const MENU_ITEMS = ["CHECK IN", "ROOMS", "GUEST BOOK", "QUIT"] as const;
type MenuItem = (typeof MENU_ITEMS)[number];

type StartScreenProps = {
  onStart: () => void;
};

export function StartScreen({ onStart }: StartScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleSelect = useCallback(
    (item: MenuItem) => {
      if (item === "CHECK IN") {
        onStart();
      }
    },
    [onStart],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => (i - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => (i + 1) % MENU_ITEMS.length);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          handleSelect(MENU_ITEMS[selectedIndex]);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSelect, selectedIndex]);

  return (
    <div className="fh-title-screen fh-fade-in">
      <div className="fh-title-screen__stars" aria-hidden />
      <div className="fh-title-screen__grain" aria-hidden />
      <div className="fh-title-screen__glow" aria-hidden />

      <div className="fh-title-screen__logo">
        <div className="fh-title-border">
          <h1 className="fh-pixel-font fh-pixel-font--title fh-title-screen__title">
            THE FREAK HOTEL
          </h1>
        </div>
        <p className="fh-pixel-font fh-title-screen__subtitle">
          Not everyone checks out.
        </p>
      </div>

      <nav className="fh-title-screen__menu" aria-label="Main menu">
        {MENU_ITEMS.map((item, index) => (
          <button
            key={item}
            type="button"
            className={`fh-pixel-font fh-menu-item ${
              index === selectedIndex ? "fh-menu-item--selected" : ""
            }`}
            onClick={() => handleSelect(item)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {item}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="fh-pixel-font fh-title-screen__press-start fh-press-start-blink"
        onClick={onStart}
      >
        ▶ PRESS START
      </button>
    </div>
  );
}
