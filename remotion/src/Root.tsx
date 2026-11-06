import React from "react";
import { CalculateMetadataFunction, Composition } from "remotion";
import { demoTimeline } from "./demo";
import { FPS, HEIGHT, WIDTH } from "./theme";
import type { Timeline } from "./types";
import { Video } from "./Video";

const fromTimeline: CalculateMetadataFunction<Timeline> = ({ props }) => ({
  durationInFrames: Math.max(1, Math.ceil(props.durationSec * FPS)),
});

export const RemotionRoot: React.FC = () => (
  <>
    {/* A real video: pass its timeline.json with --props and the video
        folder with --public-dir (see README.md). */}
    <Composition
      id="Video"
      component={Video}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={FPS}
      defaultProps={demoTimeline}
      calculateMetadata={fromTimeline}
    />
    {/* Test-only: every overlay type on placeholders. */}
    <Composition
      id="OverlayDemo"
      component={Video}
      width={WIDTH}
      height={HEIGHT}
      fps={FPS}
      durationInFrames={FPS}
      defaultProps={demoTimeline}
      calculateMetadata={fromTimeline}
    />
  </>
);
