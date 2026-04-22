'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

const { TelegramEmojiConverter } = require('../dist');

test('converts animated tgs in memory-only mode', { concurrency: false }, async () => {
  const converter = createConverter();
  const input = await loadFixture('tgs-animated-sample.json');
  const result = await converter.convert(input);

  assert.equal(result.type, 'gif');
  assert.equal(result.buffer.subarray(0, 6).toString('ascii'), 'GIF89a');
});

test('converts single-frame tgs to png', { concurrency: false }, async () => {
  const converter = createConverter();
  const input = await loadFixture('tgs-single-frame.json');
  const result = await converter.convert(input);

  assert.equal(result.type, 'png');
  assert.equal(result.buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

test('converts webp to png', { concurrency: false }, async () => {
  const converter = createConverter();
  const input = await loadFixture('webp-sample.json');
  const result = await converter.convert(input);

  assert.equal(result.type, 'png');
  assert.equal(result.buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
});

function createConverter() {
  return new TelegramEmojiConverter({
    rlottieCliPath: 'C:\\rlottie-cli\\rlottie-cli.exe',
    ffmpegPath: 'C:\\ffmpeg\\bin\\ffmpeg.exe'
  });
}

async function loadFixture(fileName) {
  const fixturesDir = path.resolve(__dirname, '..', 'fixtures');
  const jsonPath = path.join(fixturesDir, fileName);
  const payload = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));

  payload.emoji = path.join(fixturesDir, payload.emoji);

  return payload;
}
