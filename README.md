# tgs-converter

TypeScript library for converting Telegram emoji assets.

## What it does

- `tgs -> gif` for animated stickers
- `tgs -> png` for single-frame stickers
- `webp -> png`

## Runtime dependencies

This library relies on two external binaries:

- `ffmpeg`
- `rlottie-cli`

`rlottie-cli` is used to read Lottie JSON and render raw RGBA frames.

`ffmpeg` is used to encode the final output:

- animated `tgs` -> `gif`
- single-frame `tgs` -> `png`
- `webp` -> `png`

## Installation

```bash
npm install tgs-converter
```

You also need working binaries on the machine:

- `ffmpeg`
- `rlottie-cli`

## Usage

```ts
import { TelegramEmojiConverter, TelegramEmojiConvertMode } from 'tgs-converter';

const converter = new TelegramEmojiConverter({
  rlottieCliPath: 'C:\\rlottie-cli\\rlottie-cli.exe',
  ffmpegPath: 'C:\\ffmpeg\\bin\\ffmpeg.exe'
});

const response = await fetch('https://t.me/i/emoji/5456140674028019486.json');
const input = await response.json();

const outputBuffer = await converter.convert(input, {
  mode: TelegramEmojiConvertMode.MemoryOnly,
  outputPath: 'output.gif'
});

console.log(outputBuffer.length);
```

## Input format

The converter expects Telegram emoji JSON like this:

```json
{
  "type": "tgs",
  "emoji": "https://cdn4.telesco.pe/file/sticker.tgs?..."
}
```

Or:

```json
{
  "type": "webp",
  "emoji": "https://cdn4.telesco.pe/file/example.webp?..."
}
```

## Test conversion script

Run:

```bash
npm run test:conversion
```

It downloads sample Telegram emoji JSON files and generates:

- `output-from-tgs-animated.gif`
- `output-from-tgs-second-animated.gif`
- `output-from-webp.png`

## Tests

Run:

```bash
npm test
```

Current local tests cover:

- animated `tgs -> gif`
- single-frame `tgs -> png`
- `webp -> png`

## Publishing to npm

Typical flow:

1. Build the package:

```bash
npm run build
```

2. Check published contents:

```bash
npm pack
```

3. Login to npm:

```bash
npm login
```

4. Publish:

```bash
npm publish
```

If the package is scoped and public, use:

```bash
npm publish --access public
```

## Notes

- The library returns a `Buffer`.
- If `outputPath` is provided, the result is also written to disk.
- TGS conversion currently uses only the `memory-only` mode.
