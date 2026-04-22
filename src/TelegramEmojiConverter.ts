import { TgsTelegramEmojiConverter } from './converters/TgsTelegramEmojiConverter';
import { WebpTelegramEmojiConverter } from './converters/WebpTelegramEmojiConverter';
import type {
  EmojiFormatConverter,
  TelegramEmojiConversionResult,
  TelegramEmojiConverterOptions,
  TelegramEmojiJson
} from './types';

export class TelegramEmojiConverter {
  private readonly converters: Record<string, EmojiFormatConverter<TelegramEmojiConversionResult>>;

  public constructor(options: TelegramEmojiConverterOptions) {
    this.converters = {
      webp: new WebpTelegramEmojiConverter(options),
      tgs: new TgsTelegramEmojiConverter(options)
    };
  }

  public async convert(input: TelegramEmojiJson): Promise<TelegramEmojiConversionResult> {
    const converter = this.resolveConverter(input);
    return converter.convert(input);
  }

  private resolveConverter(input: TelegramEmojiJson): EmojiFormatConverter<TelegramEmojiConversionResult> {
    const converter = this.converters[input.type];

    if (!converter) {
      throw new Error(`Unsupported Telegram emoji type: ${input.type}`);
    }

    return converter;
  }
}
