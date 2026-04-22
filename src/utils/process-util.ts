import { spawn } from 'child_process';

export async function runCommand(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      windowsHide: true
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
    });
  });
}

export async function runCommandAndCaptureOutput(command: string, args: string[], input?: Buffer | string): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'inherit'],
      windowsHide: true
    });

    const chunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
        return;
      }

      reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
    });

    if (input !== undefined) {
      child.stdin.end(input);
      return;
    }

    child.stdin.end();
  });
}
