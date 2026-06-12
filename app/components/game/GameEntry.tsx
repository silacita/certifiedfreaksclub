"use client";

import dynamic from "next/dynamic";

const FreakHotelGame = dynamic(
  () => import("./FreakHotelGame").then((m) => m.FreakHotelGame),
  {
    ssr: false,
    loading: () => <div className="fh-game" aria-hidden />,
  },
);

export function GameEntry() {
  return <FreakHotelGame />;
}
