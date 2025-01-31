import * as vscode from 'vscode';
import * as path from 'path';

const SECTION_ID = 'simple-pomodoro-timer';

export class PomodoroConfig {
  private DEFAULT_WORKING_TIME_MIN = 25;
  private DEFAULT_LONG_BREAK_TIME_MIN = 15;
  private DEFAULT_SHORT_BREAK_TIME_MIN = 5;
  private DEFAULT_BELL_FILENAME = 'marimba01.mp3';
  private DEFAULT_TIMER_ICON_WORKING = '🍅';
  private DEFAULT_TIMER_ICON_BREAK = '🍆';
  private DEFAULT_TIMER_ALIGNMENT = 'right';
  private DEFAULT_TIMER_PRIORITY = -100;
  private config: vscode.WorkspaceConfiguration;

  constructor() {
    this.config = vscode.workspace.getConfiguration(SECTION_ID);
  }

  get workingTimeMs(): number {
    return this.minutesToMillisec(
      'defaultWorkingTime',
      this.DEFAULT_WORKING_TIME_MIN,
    );
  }

  get shortBreakTimeMs(): number {
    return this.minutesToMillisec(
      'defaultShortBreakTime',
      this.DEFAULT_SHORT_BREAK_TIME_MIN,
    );
  }

  get longBreakTimeMs(): number {
    return this.minutesToMillisec(
      'defaultLongBreakTime',
      this.DEFAULT_LONG_BREAK_TIME_MIN,
    );
  }

  get bellNameAtEndOfNormalWorking(): string {
    return this.config.get(
      'bellNameAtEndOfNormalWorking',
      this.DEFAULT_BELL_FILENAME,
    );
  }

  get bellNameAtEndOfFourthWorking(): string {
    return this.config.get(
      'bellNameAtEndOfFourthWorking',
      this.DEFAULT_BELL_FILENAME,
    );
  }

  get bellNameAtEndOfBreak(): string {
    return this.config.get('bellNameAtEndOfBreak', this.DEFAULT_BELL_FILENAME);
  }

  get timerIconForWroking(): string {
    return this.config.get(
      'timerIconForWorking',
      this.DEFAULT_TIMER_ICON_WORKING,
    );
  }

  get timerIconForBreak(): string {
    return this.config.get('timerIconForBreak', this.DEFAULT_TIMER_ICON_BREAK);
  }

  get statusbarAlignment(): vscode.StatusBarAlignment {
    const align = this.config
      .get('statusbarAlignment', this.DEFAULT_TIMER_ALIGNMENT)
      .toLowerCase();
    if (align === 'left') {
      return vscode.StatusBarAlignment.Left;
    } else {
      return vscode.StatusBarAlignment.Right;
    }
  }

  get statusbarPriority(): number {
    return this.config.get('statusbarPriority', this.DEFAULT_TIMER_PRIORITY);
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
