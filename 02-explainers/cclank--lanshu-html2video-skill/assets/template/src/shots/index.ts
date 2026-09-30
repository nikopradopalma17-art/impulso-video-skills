/**
 * Shot registry. The storyboard's `shot` enum maps 1:1 onto these, so adding a
 * shot means adding it in both places and nowhere else.
 */

import type React from "react";
import type { ShotProps } from "../lib/scene-context";
import type { Scene } from "../schema/storyboard";
import {
  BulletLadder,
  CaveatBeat,
  OutroCredit,
  PullQuote,
  StatCard,
  StatementCard,
  TitleCard,
} from "./TextShots";
import { CompareSplit, DiagramWalk, FigureReveal } from "./FigureShots";

export const SHOTS: Record<Scene["shot"], React.FC<ShotProps>> = {
  title: TitleCard,
  statement: StatementCard,
  stat: StatCard,
  quote: PullQuote,
  figure: FigureReveal,
  compare: CompareSplit,
  diagram: DiagramWalk,
  caveat: CaveatBeat,
  ladder: BulletLadder,
  outro: OutroCredit,
};
