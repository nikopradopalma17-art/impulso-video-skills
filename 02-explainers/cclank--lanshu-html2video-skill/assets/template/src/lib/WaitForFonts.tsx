/**
 * Gate that holds the whole composition until fonts are registered.
 *
 * This is the one place useState/useEffect are permitted (the render-safety lint
 * allows this file by name). Everything downstream measures text with
 * measureText, and measureText will silently return Latin-fallback metrics if the
 * CJK faces are not loaded yet — which bakes the WRONG LINE BREAKS into the
 * render. That failure survives review because the frame looks plausible; it just
 * isn't the layout that was approved.
 *
 * Follows Remotion's delayRender/continueRender font-loading pattern.
 */

import React, { useEffect, useState } from "react";
import { cancelRender, useDelayRender } from "remotion";
import { waitForFonts } from "./type/fonts";

export const WaitForFonts: React.FC<{
  readonly children: React.ReactNode;
}> = ({ children }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { delayRender, continueRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Waiting for fonts to be loaded"));

  useEffect(() => {
    if (fontsLoaded) return;
    waitForFonts()
      .then(() => setFontsLoaded(true))
      .catch((err) => cancelRender(err));
  }, [fontsLoaded, handle, continueRender, delayRender]);

  useEffect(() => {
    if (fontsLoaded) continueRender(handle);
  }, [continueRender, fontsLoaded, handle]);

  if (!fontsLoaded) return null;
  return <>{children}</>;
};
