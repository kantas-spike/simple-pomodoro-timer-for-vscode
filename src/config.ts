import * as vscode from 'vscode';
import * as path from 'path';
import { errorMonitor } from 'stream';

export class PomodoroConfig {
  private config: vscode.WorkspaceConfiguration;

  constructor(config: vscode.WorkspaceConfiguration) {
    this.config = config;
  }

  get workingTimeMs(): number {
    const key = 'defaultWorkingTime';
    return this.minutesToMillisec(key);
  }

  get shortBreakTimeMs(): number {
    const key = 'defaultShortBreakTime';
    return this.minutesToMillisec(key);
  }

  get longBreakTimeMs(): number {
    const key = 'defaultLongBreakTime';
    return this.minutesToMillisec(key);
  }

  get bellFileNameAtEndOfNormalWorking(): string {
    const key = 'bellNameAtEndOfNormalWorking';
    return this.getConfigValue<string>(key);
  }

  get bellFileNameAtEndOfFourthWorking(): string {
    const key = 'bellNameAtEndOfFourthWorking';
    return this.getConfigValue<string>(key);
  }

  get bellFileNameAtEndOfBreak(): string {
    const key = 'bellNameAtEndOfBreak';
    return this.getConfigValue<string>(key);
  }

  get timerIconForWroking(): string {
    const key = 'timerIconForWorking';
    return this.getConfigValue<string>(key);
  }

  get timerIconForBreak(): string {
    const key = 'timerIconForBreak';
    return this.getConfigValue<string>(key);
  }

  get statusbarAlignment(): vscode.StatusBarAlignment {
    const key = 'statusbarAlignment';
    const align = this.getConfigValue<string>(key).toLowerCase();
    if (align === 'left') {
      return vscode.StatusBarAlignment.Left;
    } else {
      return vscode.StatusBarAlignment.Right;
    }
  }

  get statusbarPriority(): number {
    const key = 'statusbarPriority';
    return this.getConfigValue<number>(key);
  }

  get delayTimeWhenSwitchTimer(): number {
    const key = 'delayTimeWhenSwitchTimer';
    return this.getConfigValue<number>(key);
  }

  get startMessgeFormat(): string {
    const key = 'startMessageFormat';
    return this.getConfigValue<string>(key);
  }

  get stopMessgeFormat(): string {
    const key = 'stopMessageFormat';
    return this.getConfigValue<string>(key);
  }

  getAudioDir(extensionPath: string): string {
    const key = 'audioDir';
    const adir = this.getConfigValue<string | null>(key);
    if (adir) {
      return adir;
    } else {
      return path.join(extensionPath, 'audio');
    }
  }

  private getConfigValue<T>(key: string): T {
    const val = this.config.get<T>(key);
    if (val === undefined) {
      throw new Error(`設定項目: ${key}が定義されていません。`);
    }
    return val;
  }

  private minutesToMillisec(key: string): number {
    const val = this.getConfigValue<number>(key);
    return val * 60 * 1000;
  }
}
