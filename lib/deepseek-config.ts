const PLACEHOLDER_KEYS = new Set([
  "your_deepseek_api_key_here",
  "your_real_deepseek_api_key_here",
]);

type DeepSeekRuntimeConfig = {
  apiKey: string | null;
  configError: string | null;
  useLlm: boolean;
};

let hasLoggedStartupStatus = false;

export function envFlag(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

export function getDeepSeekRuntimeConfig(): DeepSeekRuntimeConfig {
  const useLlm = envFlag(process.env.USE_LLM, false);
  const rawApiKey = process.env.DEEPSEEK_API_KEY?.trim() ?? "";

  if (!useLlm) {
    return {
      useLlm,
      apiKey: null,
      configError: null,
    };
  }

  if (!rawApiKey) {
    return {
      useLlm,
      apiKey: null,
      configError:
        "USE_LLM=true but DEEPSEEK_API_KEY is missing. The app cannot use DeepSeek until a real key is added.",
    };
  }

  if (PLACEHOLDER_KEYS.has(rawApiKey)) {
    return {
      useLlm,
      apiKey: null,
      configError:
        "USE_LLM=true but DEEPSEEK_API_KEY is still a placeholder value. Replace it with a real DeepSeek key.",
    };
  }

  return {
    useLlm,
    apiKey: rawApiKey,
    configError: null,
  };
}

export function logDeepSeekStartupStatus() {
  if (hasLoggedStartupStatus) {
    return;
  }

  hasLoggedStartupStatus = true;

  const config = getDeepSeekRuntimeConfig();

  if (config.configError) {
    console.warn(`[After Distortion] Warning: ${config.configError}`);
    return;
  }

  if (config.useLlm) {
    console.info("[After Distortion] DeepSeek mode is enabled.");
    return;
  }

  console.info("[After Distortion] Local transformation mode is enabled.");
}
