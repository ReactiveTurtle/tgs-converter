export interface RlottieInfo {
  width: number;
  height: number;
  frameRate: number;
  totalFrames: number;
  duration: number;
}

export interface RenderInfoArgsParams {
  inputPath: string;
}

export interface RenderFrameArgsParams {
  inputPath: string;
  frame: number;
  width: number;
  height: number;
}

export function createInfoArgs(params: RenderInfoArgsParams): string[] {
  return [
    'info',
    '--input',
    params.inputPath
  ];
}

export function createRenderFrameArgs(params: RenderFrameArgsParams): string[] {
  return [
    'render-frame',
    '--input',
    params.inputPath,
    '--frame',
    String(params.frame),
    '--width',
    String(params.width),
    '--height',
    String(params.height)
  ];
}

export function parseRlottieInfo(buffer: Buffer): RlottieInfo {
  return JSON.parse(buffer.toString('utf-8')) as RlottieInfo;
}

export interface RenderFramesWithDriveParams {
  inputPath: string;
  outputDir: string;
  fromFrame: number;
  toFrame: number;
  width: number;
  height: number;
}
