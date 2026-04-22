export interface TelegramEmojiJson {
  type: string;
  emoji: string;
  thumb?: string;
  path?: string;
  size?: number;
}

export interface TelegramEmojiConverterOptions {
  ffmpegPath: string;
  rlottieCliPath: string;
}

export interface TelegramEmojiConversionResult {
  type: 'gif' | 'png';
  buffer: Buffer;
}

export interface EmojiFormatConverter<TResult = unknown> {
  convert(input: TelegramEmojiJson): Promise<TResult>;
}
