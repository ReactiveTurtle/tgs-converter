import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

import type { EmojiFormatConverter, TelegramEmojiConvertOptions, TelegramEmojiConverterOptions, TelegramEmojiJson } from '../types';
import { downloadBuffer } from '../utils/buffer-util';

export class WebpTelegramEmojiConverter implements EmojiFormatConverter<Buffer> {
  private readonly ffmpegPath: string;

  public constructor(options: TelegramEmojiConverterOptions) {
    this.ffmpegPath = options.ffmpegPath;
  }

  public async convert(input: TelegramEmojiJson, options?: TelegramEmojiConvertOptions): Promise<Buffer> {
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

    const result = await new Promise<Buffer>((resolvePromise, reject) => {
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

    if (options?.outputPath) {
      const outputPath = resolve(options.outputPath);
      await writeFile(outputPath, result);
    }

    return result;
  }
}
