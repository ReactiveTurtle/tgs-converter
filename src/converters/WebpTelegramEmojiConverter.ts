import { spawn } from 'child_process';

import type {
  EmojiFormatConverter,
  TelegramEmojiConversionResult,
  TelegramEmojiConverterOptions,
  TelegramEmojiJson
} from '../types';
import { downloadBuffer } from '../utils/buffer-util';

export class WebpTelegramEmojiConverter implements EmojiFormatConverter<TelegramEmojiConversionResult> {
  private readonly ffmpegPath: string;

  public constructor(options: TelegramEmojiConverterOptions) {
    this.ffmpegPath = options.ffmpegPath;
  }

  public async convert(input: TelegramEmojiJson): Promise<TelegramEmojiConversionResult> {
    const webpBuffer = await downloadBuffer(input.emoji);
    const ffmpeg = spawn(this.ffmpegPath, [
      '-y',
      '-f',
      'webp_pipe',
      '-i',
      '-',
      '-frames:v',
      '1',
      '-f',
      'image2pipe',
      '-vcodec',
      'png',
      '-'
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      windowsHide: true
    });

    const chunks: Buffer[] = [];
    ffmpeg.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));

    const buffer = await new Promise<Buffer>((resolvePromise, reject) => {
      ffmpeg.on('error', reject);
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolvePromise(Buffer.concat(chunks));
          return;
        }

        reject(new Error(`Command failed: ${this.ffmpegPath}`));
      });

      ffmpeg.stdin.end(webpBuffer);
    });

    return {
      type: 'png',
      buffer
    };
  }
}
