---
allowed-tools: Read, Write, Bash(mkdir*)
argument-hint: [composition-name]
description: Create a new video composition with boilerplate structure
---

## task

Create a new Remotion video composition named "$1".

## steps

1. **Validate the name**:
   - Convert to lowercase for folder name (e.g., "My Video" → "my-video")
   - Use PascalCase for component names (e.g., "my-video" → "MyVideo")

2. **Create the folder structure**:
   ```
   src/compositions/{folder-name}/
   ├── Composition.tsx
   ├── config.ts
   ├── content.ts
   └── segments/
       ├── TitleSegment.tsx
       └── ContentSegment.tsx
   ```

3. **Generate files** using these templates:

### config.ts
```typescript
// Segment durations in seconds
export const TITLE_DURATION_SECONDS = 3;
export const CONTENT_DURATION_SECONDS = 5;
```

### content.ts
```typescript
export const CONTENT = {
  title: "{Composition Name}",
  contentHeader: "Your Header",
  contentBody: "Your content goes here.",
};
```

### segments/TitleSegment.tsx
```typescript
import { TitleSlide } from "../../../components/TitleSlide";
import { CONTENT } from "../content";

export const TitleSegment: React.FC = () => {
  return <TitleSlide title={CONTENT.title} />;
};
```

### segments/ContentSegment.tsx
```typescript
import { ContentSlide } from "../../../components/ContentSlide";
import { CONTENT } from "../content";

export const ContentSegment: React.FC = () => {
  return (
    <ContentSlide header={CONTENT.contentHeader} content={CONTENT.contentBody} />
  );
};
```

### Composition.tsx
```typescript
import { Series, useVideoConfig } from "remotion";
import { TitleSegment } from "./segments/TitleSegment";
import { ContentSegment } from "./segments/ContentSegment";
import { getDurationInFrames } from "../../config";
import { TITLE_DURATION_SECONDS, CONTENT_DURATION_SECONDS } from "./config";
import { createComposition } from "../../utils/createComposition";

const {ComponentName}Composition: React.FC = () => {
  const { fps } = useVideoConfig();
  const titleDuration = getDurationInFrames(TITLE_DURATION_SECONDS, fps);
  const contentDuration = getDurationInFrames(CONTENT_DURATION_SECONDS, fps);

  return (
    <Series>
      <Series.Sequence durationInFrames={titleDuration}>
        <TitleSegment />
      </Series.Sequence>
      <Series.Sequence durationInFrames={contentDuration}>
        <ContentSegment />
      </Series.Sequence>
    </Series>
  );
};

const TOTAL_DURATION_SECONDS = TITLE_DURATION_SECONDS + CONTENT_DURATION_SECONDS;

export const {ComponentName} = createComposition({
  name: "{ComponentName}",
  component: {ComponentName}Composition,
  durationInSeconds: TOTAL_DURATION_SECONDS,
  preset: "Landscape-1080p",
});
```

4. **Update Root.tsx**:
   - Add import: `import { {ComponentName} } from "./compositions/{folder-name}/Composition";`
   - Add inside the Compositions folder with its own Folder wrapper:
     ```tsx
     <Folder name="{ComponentName}">
       <{ComponentName} />
     </Folder>
     ```

5. **Report completion**:
   - List all created files
   - Show how to render: `pnpm exec remotion render {ComponentName}`
   - Remind user to customize content.ts and config.ts
