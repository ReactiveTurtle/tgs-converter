export interface TelegramEmojiJson {
  type: string;
  emoji: string;
  thumb?: string;
  path?: string;
  size?: number;
}

export enum TelegramEmojiConvertMode {
  MemoryOnly = 'memory-only'
}

export interface TelegramEmojiConvertOptions {
  mode?: TelegramEmojiConvertMode;
  outputPath?: string;
}

export interface TelegramEmojiConverterOptions {
  ffmpegPath: string;
  rlottieCliPath: string;
}

export interface EmojiFormatConverter<TResult = unknown> {
  convert(input: TelegramEmojiJson, options?: TelegramEmojiConvertOptions): Promise<TResult>;
}
