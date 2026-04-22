import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import { gunzipSync } from 'zlib';

import { TelegramEmojiConvertMode } from '../types';
import type { EmojiFormatConverter, TelegramEmojiConvertOptions, TelegramEmojiConverterOptions, TelegramEmojiJson } from '../types';
import { downloadBuffer } from '../utils/buffer-util';
import { createInfoArgs, createRenderFrameArgs, parseRlottieInfo } from './tgs-strategies/TelegramEmojiRlottieHelper';
import { runCommandAndCaptureOutput } from '../utils/process-util';

export class TgsTelegramEmojiConverter implements EmojiFormatConverter<Buffer> {
  private readonly ffmpegPath: string;
  private readonly rlottieCliPath: string;

  public constructor(options: TelegramEmojiConverterOptions) {
    this.ffmpegPath = options.ffmpegPath;
    this.rlottieCliPath = options.rlottieCliPath;
  }

  public async convert(input: TelegramEmojiJson, options?: TelegramEmojiConvertOptions): Promise<Buffer> {
    const mode = options?.mode ?? TelegramEmojiConvertMode.MemoryOnly;

    if (mode !== TelegramEmojiConvertMode.MemoryOnly) {
      throw new Error(`Unsupported TGS conversion mode: ${mode}`);
    }

    const tgsBuffer = await downloadBuffer(input.emoji);
    const jsonBuffer = gunzipSync(tgsBuffer);
    const animation = JSON.parse(jsonBuffer.toString('utf-8')) as { ip?: number; op?: number };
    const isSingleFrame = Number(animation.op ?? 0) - Number(animation.ip ?? 0) <= 1;
    const infoBuffer = await runCommandAndCaptureOutput(
      this.rlottieCliPath,
      createInfoArgs({ inputPath: '-' }),
      jsonBuffer
    );
    const info = parseRlottieInfo(infoBuffer);

    if (isSingleFrame) {
      return this.convertSingleFrame(jsonBuffer, info, options);
    }

    return this.convertAnimation(jsonBuffer, info, options);
  }

  private async convertSingleFrame(
    jsonBuffer: Buffer,
    info: { width: number; height: number; totalFrames: number; frameRate: number },
    options?: TelegramEmojiConvertOptions
  ): Promise<Buffer> {
    const rgbaBuffer = await runCommandAndCaptureOutput(
      this.rlottieCliPath,
      createRenderFrameArgs({ inputPath: '-', frame: 0, width: info.width, height: info.height }),
      jsonBuffer
    );
    const ffmpeg = spawn(this.ffmpegPath, [
      '-y',
      '-f',
      'rawvideo',
      '-pixel_format',
      'rgba',
      '-video_size',
      `${info.width}x${info.height}`,
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

      ffmpeg.stdin.end(rgbaBuffer);
    });

    if (options?.outputPath) {
      const outputPath = resolve(options.outputPath);
      await writeFile(outputPath, result);
    }

    return result;
  }

  private async convertAnimation(
    jsonBuffer: Buffer,
    info: { width: number; height: number; totalFrames: number; frameRate: number },
    options?: TelegramEmojiConvertOptions
  ): Promise<Buffer> {
    const ffmpeg = spawn(this.ffmpegPath, [
      '-y',
      '-f',
      'rawvideo',
      '-pixel_format',
      'rgba',
      '-video_size',
      `${info.width}x${info.height}`,
      '-framerate',
      String(info.frameRate),
      '-i',
      '-',
      '-f',
      'gif',
      '-'
    ], {
      stdio: ['pipe', 'pipe', 'inherit'],
      windowsHide: true
    });

    const chunks: Buffer[] = [];
    ffmpeg.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));

    const ffmpegCompletion = new Promise<Buffer>((resolvePromise, reject) => {
      ffmpeg.on('error', reject);
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolvePromise(Buffer.concat(chunks));
          return;
        }

        reject(new Error(`Command failed: ${this.ffmpegPath}`));
      });
    });

    for (let frame = 0; frame < info.totalFrames; frame += 1) {
      const rgbaBuffer = await runCommandAndCaptureOutput(
        this.rlottieCliPath,
        createRenderFrameArgs({ inputPath: '-', frame, width: info.width, height: info.height }),
        jsonBuffer
      );
      ffmpeg.stdin.write(rgbaBuffer);
    }

    ffmpeg.stdin.end();

    const result = await ffmpegCompletion;

    if (options?.outputPath) {
      const outputPath = resolve(options.outputPath);
      await writeFile(outputPath, result);
    }

    return result;
  }
}
