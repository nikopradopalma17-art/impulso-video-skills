const fs = require('fs');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

// Friendly name → Edge neural voice ID. Keep parity with elevenlabs.js where possible.
const VOICES = {
  brian: 'en-US-GuyNeural',       // calm documentary
  adam: 'en-US-DavisNeural',      // deeper authoritative
  rachel: 'en-US-AriaNeural',     // warm friendly
  sarah: 'en-US-JennyNeural',     // confident modern
  antoni: 'en-US-AndrewNeural',   // younger energetic
  // additional Edge voices, passable as-is
  emma: 'en-US-EmmaNeural',
  ryan: 'en-GB-RyanNeural',
  sonia: 'en-GB-SoniaNeural',
};

async function generateVoice({ text, voice = 'brian', outputPath, rate = '+0%', pitch = '+0Hz' }) {
  const voiceId = VOICES[String(voice).toLowerCase()] || voice;
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceId, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const { audioStream } = tts.toStream(text, { rate, pitch });
  await new Promise((resolve, reject) => {
    const out = fs.createWriteStream(outputPath);
    audioStream.on('data', chunk => out.write(chunk));
    audioStream.on('end', () => { out.end(); resolve(); });
    audioStream.on('error', reject);
  });
  return outputPath;
}

module.exports = { generateVoice, VOICES };
