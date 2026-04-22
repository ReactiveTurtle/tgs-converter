import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { cwd } from 'process';
import { platform } from 'os';

export async function createTempDir(prefix: string): Promise<string> {
  const tempRoot = platform() === 'win32'
    ? 'C:/telegram-emoji-temp'
    : join(cwd(), '.tmp');

  await mkdir(tempRoot, { recursive: true });

  return mkdtemp(join(tempRoot, prefix));
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await writeFile(filePath, content, 'utf-8');
}

export async function removeDir(dirPath: string): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rm(dirPath, { recursive: true, force: true });
      return;
    } catch (error) {
      if (!isBusyError(error) || attempt === 4) {
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

function isBusyError(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && error.code === 'EBUSY';
}
