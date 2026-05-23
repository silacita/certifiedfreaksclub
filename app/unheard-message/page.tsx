import type { Metadata } from "next";

import { UnheardMessageExperience } from "../components/UnheardMessageExperience";

export const metadata: Metadata = {
  title: "1 UNHEARD MESSAGE — Certified Freaks Club",
  description: "A private transmission.",
};

export default function UnheardMessagePage() {
  return <UnheardMessageExperience />;
}
