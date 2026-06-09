const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function timestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function fmt(level: string, color: string, msg: string, ...args: any[]) {
  const extra = args.length ? ` ${args.map(a => JSON.stringify(a)).join(" ")}` : "";
  console.log(`${colors.gray}[${timestamp()}]${colors.reset} ${color}[${level}]${colors.reset} ${msg}${extra}`);
}

export const logger = {
  info: (msg: string, ...args: any[]) => fmt("INFO", colors.cyan, msg, ...args),
  warn: (msg: string, ...args: any[]) => fmt("WARN", colors.yellow, msg, ...args),
  error: (msg: string, ...args: any[]) => fmt("ERROR", colors.red, msg, ...args),
  success: (msg: string, ...args: any[]) => fmt("OK", colors.green, msg, ...args),
};
