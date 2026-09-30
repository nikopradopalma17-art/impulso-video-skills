---
allowed-tools: mcp__replicate__*, AskUserQuestion, Bash(curl*)
argument-hint: [prompt]
description: Generate images using Nano Banana Pro via Replicate
---

## context

This command uses the Replicate MCP server to generate images with Google's Nano Banana Pro model.

The model supports:
- Text-to-image generation
- Image-to-image editing
- 16:9, 1:1, 9:16, 4:3, 3:4 aspect ratios
- 2K, 4K, 8K resolutions
- PNG or JPEG output

## task

Generate an image using Nano Banana Pro with the prompt provided in $1:

1. **Create the prediction**:
   - Use model: `google/nano-banana-pro`
   - Version ID: `944891d151f5463d9e6eca5a6942f04053e664853dca30c21864021b046fea1d`
   - Default parameters:
     - `aspect_ratio`: "16:9"
     - `resolution`: "2K"
     - `output_format`: "png"
     - `safety_filter_level`: "block_only_high"
   - Use `Prefer: wait` to wait for completion

2. **Call the Replicate API**:
   ```
   mcp__replicate__create_predictions with:
   - version: google/nano-banana-pro:944891d151f5463d9e6eca5a6942f04053e664853dca30c21864021b046fea1d
   - input: {"prompt": "{user_prompt}", "aspect_ratio": "16:9", "resolution": "2K", "output_format": "png", "safety_filter_level": "block_only_high"}
   - Prefer: wait
   - jq_filter: {id, status, output, error}
   ```

3. **Display results**:
   - Show the image URL
   - Show the prediction ID
   - Summarize key features of the generated image

4. **Optionally download**:
   - Ask the user if they want to download the image to the `public/` directory
   - If yes, ask for a filename (suggest a descriptive name based on the prompt)
   - Download using curl: `curl -o public/{filename}.png {image_url}`
   - Confirm the download location

## examples

**Basic usage:**
```
/generate-image a photorealistic software engineer in a cozy studio
```

**With specific style:**
```
/generate-image a minimalist tech workspace with warm lighting, 70s aesthetic
```

## notes

- The prompt should be descriptive and include style, lighting, and composition details
- For talking head videos, specify "centered frame, medium close-up"
- For reference images, mention "photorealistic" or specific photography styles
- Images are saved to Replicate's CDN and accessible via HTTPS URLs
