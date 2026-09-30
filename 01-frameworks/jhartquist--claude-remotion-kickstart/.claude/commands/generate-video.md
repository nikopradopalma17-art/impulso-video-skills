---
allowed-tools: mcp__replicate__*, AskUserQuestion, Bash(curl*, sleep*)
argument-hint: [prompt]
description: Generate videos using Veo 3.1 Fast via Replicate with polling
---

## context

This command uses the Replicate MCP server to generate videos with Google's Veo 3.1 Fast model by default.

**Model options:**

- **veo-3.1-fast** (default): Faster and cheaper, great for most use cases
- **veo-3.1**: Higher fidelity, use when user specifically requests "full model" or "high quality"

Veo 3.1 features:

- Text-to-video with context-aware audio
- Starting frame support (reference image)
- Ending frame support (last frame)
- Multiple reference images for style guidance (full model only)
- 16:9, 9:16, 1:1 aspect ratios
- 1080p resolution
- 4, 6, or 8 second durations

**Important:** Video generation takes 90-120 seconds, so this command uses polling instead of waiting.

## task

Generate a video using Veo 3.1 Fast (or full model if specified) with the prompt provided in $1:

1. **Determine which model to use**:
   - Check if prompt contains keywords: "full model", "high quality", "high fidelity", "veo 3.1"
   - If yes: use `google/veo-3.1` (full model)
   - If no: use `google/veo-3.1-fast` (default)
   - Inform user which model is being used

2. **Parse arguments and analyze prompt**:
   - Main prompt is in $1 (required)
   - Ask if they want to use a starting frame image (optional)
   - Ask for aspect ratio: 16:9, 9:16, or 1:1 (default: 16:9)

3. **Intelligently determine duration** (4, 6, or 8 seconds):
   - **4 seconds** for:
     - Short phrases (1-5 words)
     - Quick actions or movements
     - Simple gestures
     - Example: "waves hello", "nods in agreement", "Hello there"

   - **6 seconds** for:
     - Medium phrases (6-12 words)
     - Standard dialogue delivery
     - Most talking head content
     - Example: "This entire video was created using Claude Code"

   - **8 seconds** for:
     - Long phrases (13+ words)
     - Complex sentences with pauses
     - Detailed actions or multiple movements
     - Example: "In this tutorial, I'm going to show you how to build amazing applications"

   - Count words in quoted dialogue or estimate speech length
   - Consider natural speaking pace: ~2 words per second
   - Inform user of your duration choice and reasoning

4. **Model version IDs**:
   - veo-3.1-fast
   - veo-3.1

5. **Create the prediction WITHOUT waiting**:
   - Do NOT include `Prefer: wait` (this avoids timeout)
   - Default parameters:
     - `aspect_ratio`: "16:9"
     - `duration`: (determined in step 3)
     - `resolution`: "1080p"
     - `generate_audio`: true
   - Include `image` parameter if user provided a starting frame URL

6. **API call structure**:

   ```
   mcp__replicate__create_predictions with:
   - version: google/veo-3.1-fast:{version_id} (or veo-3.1 if requested)
   - input: {
       "prompt": "{user_prompt}",
       "aspect_ratio": "16:9",
       "duration": {calculated_duration},
       "resolution": "1080p",
       "generate_audio": true,
       "image": "{starting_frame_url}" (if provided)
     }
   - jq_filter: {id, status, created_at}
   - Do NOT include Prefer parameter
   ```

7. **Poll for completion**:
   - Inform user that video generation started (show prediction ID, model used, and chosen duration)
   - Explain it typically takes 90-120 seconds
   - Wait 30 seconds initially
   - Then check status every 15 seconds using `mcp__replicate__get_predictions`
   - Show progress updates: "Still processing... (45s elapsed)"
   - Continue until status is "succeeded", "failed", or "canceled"

8. **Polling implementation**:

   ```bash
   sleep 30
   # Check status with mcp__replicate__get_predictions

   # If still processing, loop:
   while status is "processing" or "starting":
     sleep 15
     check status again
     update elapsed time
   ```

9. **Display results when complete**:
   - Show the video URL (mp4 file)
   - Show prediction ID
   - Show total generation time
   - Summarize the video details (duration, resolution, has audio, model used)

10. **Optionally download**:
    - Ask if they want to download to `public/` directory
    - If yes, suggest a descriptive filename
    - Download using curl: `curl -o public/{filename}.mp4 {video_url}`
    - Confirm the download location

## examples

**Basic (uses fast model):**

```
/generate-video software engineer says "Hello world"
```

**Request full model:**

```
/generate-video high quality cinematic shot of developer coding, use full model
```

**With starting frame (uses fast model):**

```
/generate-video person speaking: "This was created with Claude Code"
```

(Then provide starting frame URL when prompted)

**Long dialogue (8 seconds, fast model):**

```
/generate-video developer explaining: "In this tutorial, we're going to build an amazing application using React and TypeScript"
```

## notes

- **veo-3.1-fast** is the default and recommended for most use cases
- Only use **veo-3.1** (full model) when explicitly requested by user
- Always include details about movements, camera angles, and audio in the prompt
- Put dialogue in quotes or specify "says" to help duration estimation
- Veo generates context-aware audio automatically when `generate_audio: true`
- Starting frame images help maintain consistency in appearance and style
- The model handles lip sync automatically when speech is specified
- Natural speaking pace is approximately 2 words per second
- Polling avoids timeout errors that occur with long-running generations
