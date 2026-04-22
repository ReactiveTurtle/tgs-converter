import { TelegramEmojiConverter } from './TelegramEmojiConverter';
import { TelegramEmojiConvertMode } from './types';
import type { TelegramEmojiJson } from './types';

async function main(): Promise<void> {
  const converter = new TelegramEmojiConverter({
    rlottieCliPath: 'C:\\rlottie-cli\\rlottie-cli.exe',
    ffmpegPath: 'C:\\ffmpeg\\bin\\ffmpeg.exe'
  });

  const animatedTgsInput = await loadTelegramEmojiJson('https://t.me/i/emoji/5456140674028019486.json');
  const secondAnimatedTgsInput = await loadTelegramEmojiJson('https://t.me/i/emoji/5796440171364749940.json');
  const webpInput = await loadTelegramEmojiJson('https://t.me/i/emoji/5452025154760618539.json');

  const animatedGifBuffer = await converter.convert(animatedTgsInput, {
    mode: TelegramEmojiConvertMode.MemoryOnly,
    outputPath: 'output-from-tgs-animated.gif'
  });

  const secondAnimatedGifBuffer = await converter.convert(secondAnimatedTgsInput, {
    mode: TelegramEmojiConvertMode.MemoryOnly,
    outputPath: 'output-from-tgs-second-animated.gif'
  });

  const webpPngBuffer = await converter.convert(webpInput, {
    outputPath: 'output-from-webp.png'
  });

  console.log('output-from-tgs-animated.gif', animatedGifBuffer.length);
  console.log('output-from-tgs-second-animated.gif', secondAnimatedGifBuffer.length);
  console.log('output-from-webp.png', webpPngBuffer.length);
}

async function loadTelegramEmojiJson(url: string): Promise<TelegramEmojiJson> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download json: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TelegramEmojiJson>;
}

void main();
