import { writeFile } from 'fs/promises';

import { TelegramEmojiConverter } from './TelegramEmojiConverter';
import type { TelegramEmojiJson } from './types';

async function main(): Promise<void> {
  const converter = new TelegramEmojiConverter({
    rlottieCliPath: 'C:\\rlottie-cli\\rlottie-cli.exe',
    ffmpegPath: 'C:\\ffmpeg\\bin\\ffmpeg.exe'
  });

  const animatedTgsInput = await loadTelegramEmojiJson('https://t.me/i/emoji/5456140674028019486.json');
  const secondAnimatedTgsInput = await loadTelegramEmojiJson('https://t.me/i/emoji/5796440171364749940.json');
  const webpInput = await loadTelegramEmojiJson('https://t.me/i/emoji/5452025154760618539.json');

  const animatedTgsResult = await converter.convert(animatedTgsInput);
  await writeFile('output-from-tgs-animated.gif', animatedTgsResult.buffer);

  const secondAnimatedTgsResult = await converter.convert(secondAnimatedTgsInput);
  await writeFile('output-from-tgs-second-animated.gif', secondAnimatedTgsResult.buffer);

  const webpResult = await converter.convert(webpInput);
  await writeFile('output-from-webp.png', webpResult.buffer);

  console.log('output-from-tgs-animated.gif', animatedTgsResult.type, animatedTgsResult.buffer.length);
  console.log('output-from-tgs-second-animated.gif', secondAnimatedTgsResult.type, secondAnimatedTgsResult.buffer.length);
  console.log('output-from-webp.png', webpResult.type, webpResult.buffer.length);
}

async function loadTelegramEmojiJson(url: string): Promise<TelegramEmojiJson> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download json: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TelegramEmojiJson>;
}

void main();
