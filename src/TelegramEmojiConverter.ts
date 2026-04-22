import { TgsTelegramEmojiConverter } from './converters/TgsTelegramEmojiConverter';
import { WebpTelegramEmojiConverter } from './converters/WebpTelegramEmojiConverter';
import type { EmojiFormatConverter, TelegramEmojiConvertOptions, TelegramEmojiConverterOptions, TelegramEmojiJson } from './types';

export class TelegramEmojiConverter {
  private readonly converters: Record<string, EmojiFormatConverter<Buffer>>;

  public constructor(options: TelegramEmojiConverterOptions) {
    this.converters = {
      webp: new WebpTelegramEmojiConverter(options),
      tgs: new TgsTelegramEmojiConverter(options)
    };
  }

  public async convert(input: TelegramEmojiJson, options?: TelegramEmojiConvertOptions): Promise<Buffer> {
    const converter = this.resolveConverter(input);
    return converter.convert(input, options);
  }

  private resolveConverter(input: TelegramEmojiJson): EmojiFormatConverter<Buffer> {
    const converter = this.converters[input.type];

    if (!converter) {
      throw new Error(`Unsupported Telegram emoji type: ${input.type}`);
    }

    return converter;
  }
}
