import {
  getAgentDir,
  SettingsManager,
  type BashToolOptions,
  type ReadToolOptions,
} from "@mariozechner/pi-coding-agent";

export interface BuiltinToolOptions {
  bash?: BashToolOptions;
  read?: ReadToolOptions;
}

export function getBuiltinToolOptions(cwd: string): BuiltinToolOptions {
  const settings = SettingsManager.create(cwd, getAgentDir());
  return {
    bash: {
      commandPrefix: settings.getShellCommandPrefix(),
      shellPath: settings.getShellPath(),
    },
    read: {
      autoResizeImages: settings.getImageAutoResize(),
    },
  };
}
