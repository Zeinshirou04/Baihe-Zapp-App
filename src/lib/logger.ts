import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

let LOG_FILE: string | null = null;

function getLogFile(): string {
  if (LOG_FILE) return LOG_FILE;
  const LOG_DIR = join(process.cwd(), 'logs');
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
  LOG_FILE = join(LOG_DIR, 'requests.log');
  return LOG_FILE;
}

function formatTime(): string {
  return new Date().toISOString();
}

function formatRequest(req: Request, extra?: Record<string, unknown>): string {
  const url = new URL(req.url);
  const base = `${formatTime()} | ${req.method} | ${url.pathname}${url.search}`;
  if (extra) {
    return `${base} | ${JSON.stringify(extra)}`;
  }
  return base;
}

export function logRequest(req: Request, extra?: Record<string, unknown>): void {
  const line = formatRequest(req, extra);
  console.log(line);
  try {
    appendFileSync(getLogFile(), line + '\n');
  } catch {
    // Edge runtime or file system unavailable
  }
}

export function logError(req: Request, error: Error | unknown): void {
  const msg = error instanceof Error ? error.message : String(error);
  const line = `${formatTime()} | ERROR | ${req.method} | ${new URL(req.url).pathname} | ${msg}`;
  console.error(line);
  try {
    appendFileSync(getLogFile(), line + '\n');
  } catch {
    // Edge runtime or file system unavailable
  }
}

export function logInfo(message: string, meta?: Record<string, unknown>): void {
  const line = `${formatTime()} | INFO | ${message}${meta ? ' | ' + JSON.stringify(meta) : ''}`;
  console.log(line);
  try {
    appendFileSync(getLogFile(), line + '\n');
  } catch {
    // Edge runtime or file system unavailable
  }
}