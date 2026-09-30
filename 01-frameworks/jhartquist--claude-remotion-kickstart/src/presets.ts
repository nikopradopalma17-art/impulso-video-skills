export const VIDEO_PRESETS = {
	'Landscape-720p': {
		width: 1280,
		height: 720,
		fps: 60,
	},
	'Landscape-1080p': {
		width: 1920,
		height: 1080,
		fps: 60,
	},
	'Square-1080p': {
		width: 1080,
		height: 1080,
		fps: 60,
	},
	'Portrait-1080p': {
		width: 1080,
		height: 1920,
		fps: 60,
	},
} as const;

export type PresetName = keyof typeof VIDEO_PRESETS;
