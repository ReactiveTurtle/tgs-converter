import { readFile } from 'fs/promises';
import { resolve } from 'path';

export async function downloadBuffer(url: string): Promise<Buffer> {
  if (!isHttpUrl(url)) {
    return readFile(resolve(url));
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download buffer: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function isHttpUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}
