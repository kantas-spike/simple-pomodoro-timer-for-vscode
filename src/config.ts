import * as vscode from 'vscode';
import * as path from 'path';

const SECTION_ID = 'simple-pomodoro-timer';

export class PomodoroConfig {
  private defaultWorkingTimeMin = 25;
  private defaultLongBreakTimeMin = 15;
  private defaultShortBreakTimeMin = 5;
  private defaultBellFileName = 'marimba01.mp3';
  private defaultTimerIconForWorking = '🍅';
  private defaultTimerIconForBreak = '🍆';
  private defaultStatusbarAlignment = 'right';
  private defaultStatusbarPriority = -100;
  private defaultDelayTimeSec = 3;
  private defaultStartMessageFormat =
    '@time@ [start] @projectName@ @taskName@ @message@';
  private defaultStopMessageFormat =
    '@time@ [stop] @projectName@ @taskName@ @message@';

  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration(SECTION_ID);
  }

  get workingTimeMs(): number {
    return this.minutesToMillisec(
      'defaultWorkingTime',
      this.defaultWorkingTimeMin,
    );
  }

  get shortBreakTimeMs(): number {
    return this.minutesToMillisec(
      'defaultShortBreakTime',
      this.defaultShortBreakTimeMin,
    );
  }

  get longBreakTimeMs(): number {
    return this.minutesToMillisec(
      'defaultLongBreakTime',
      this.defaultLongBreakTimeMin,
    );
  }

  get bellNameAtEndOfNormalWorking(): string {
    return this.config.get(
      'bellNameAtEndOfNormalWorking',
      this.defaultBellFileName,
    );
  }

  get bellNameAtEndOfFourthWorking(): string {
    return this.config.get(
      'bellNameAtEndOfFourthWorking',
      this.defaultBellFileName,
    );
  }

  get bellNameAtEndOfBreak(): string {
    return this.config.get('bellNameAtEndOfBreak', this.defaultBellFileName);
  }

  get timerIconForWroking(): string {
    return this.config.get(
      'timerIconForWorking',
      this.defaultTimerIconForWorking,
    );
  }

  get timerIconForBreak(): string {
    return this.config.get('timerIconForBreak', this.defaultTimerIconForBreak);
  }

  get statusbarAlignment(): vscode.StatusBarAlignment {
    const align = this.config
      .get('statusbarAlignment', this.defaultStatusbarAlignment)
      .toLowerCase();
    if (align === 'left') {
      return vscode.StatusBarAlignment.Left;
    } else {
      return vscode.StatusBarAlignment.Right;
    }
  }

  get statusbarPriority(): number {
    return this.config.get('statusbarPriority', this.defaultStatusbarPriority);
  }

  get delayTimeWhenSwitchTimer(): number {
    return this.config.get(
      'delayTimeWhenSwitchTimer',
      this.defaultDelayTimeSec,
    );
  }

  get startMessgeFormat(): string {
    return this.config.get(
      'startMessageFormat',
      this.defaultStartMessageFormat,
    );
  }

  get stopMessgeFormat(): string {
    return this.config.get('stopMessageFormat', this.defaultStopMessageFormat);
  }

  getAudioDir(extensionPath: string): string {
    const adir = this.config.get('audioDir', null);
    if (adir) {
      return adir;
    } else {
      return path.join(extensionPath, 'audio');
    }
  }

  private minutesToMillisec(key: string, defaultvalue: number): number {
    return this.config.get<number>(key, defaultvalue) * 60 * 1000;
  }
}
