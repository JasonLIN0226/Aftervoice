import { logDeepSeekStartupStatus } from "./lib/deepseek-config";

export async function register() {
  logDeepSeekStartupStatus();
}
