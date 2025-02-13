/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as utils from './utils';
import { AudioPlayer } from './audioPlayer';
import { PomodoroConfig } from './config';
import { PomodoroState } from './state';
import { StartTimerTaskProvider } from './startTaskProvider';
import { StopTimerTaskProvider } from './stopTaskProvider';

let statusBarItem: vscode.StatusBarItem;
let startTimerTaskProvider: vscode.Disposable | undefined;
let stopTimerTaskProvider: vscode.Disposable | undefined;
let outputChannel: vscode.OutputChannel;

// 設定取得
const wc = vscode.workspace.getConfiguration(
  'simple-pomodoro-timer-for-vscode',
);
const config = new PomodoroConfig(wc);

function updateStatusBar(state: PomodoroState, intervalMs: number | null) {
  if (statusBarItem) {
    const mmss = utils.millisecToHHMM(intervalMs);
    statusBarItem.text = `${state.timerIcon} ${mmss} (${state.cycleCount})`;
    statusBarItem.show();
  }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  outputChannel = vscode.window.createOutputChannel('Pomodoro Timer');
  const player = new AudioPlayer(config.getAudioDir(context.extensionPath));
  const state = new PomodoroState(config);
  state.onTiked = (state, interval) => {
    updateStatusBar(state, interval);
  };
  state.onTimerFinished = (state, interval) => {
    updateStatusBar(state, interval);
    const bellName = state.getBellName();
    player.play(bellName);
  };
  state.onStarted = (state) => {
    const format = config.startMessgeFormat;
    const now = utils.dateToYYYYMMDDhhmmss(new Date());
    const message = utils.getNotificationMessage(format, {
      '@time@': now,
      '@taskName@': state.taskName,
      '@projectName@': state.projectName,
      '@cycleCount@': undefined,
      '@wipTime@': undefined,
      '@timerIconForWorking@': state.timerIconForWorking,
      '@timerIconForBreak@': state.timerIconForBreak,
      '@message@': undefined,
    });
    vscode.window.showInformationMessage(message);
    outputChannel.appendLine(message);
  };
  state.onStopped = (state, wipTimeMs, reason) => {
    updateStatusBar(state, null);
    const now = utils.dateToYYYYMMDDhhmmss(new Date());

      const message = utils.getNotificationMessage(format, {
        '@time@': now,
        '@taskName@': state.taskName,
        '@projectName@': state.projectName,
        '@cycleCount@': `${state.cycleCount}`,
        '@wipTime@': wipMinSec,
        '@timerIconForWorking@': state.timerIconForWorking,
        '@timerIconForBreak@': state.timerIconForBreak,
        '@message@': reason,
      });
      vscode.window.showInformationMessage(message);
      outputChannel.appendLine(message);
    }
  };

  statusBarItem = vscode.window.createStatusBarItem(
    config.statusbarAlignment,
    config.statusbarPriority,
  );
  updateStatusBar(state, 0);

  startTimerTaskProvider = vscode.tasks.registerTaskProvider(
    StartTimerTaskProvider.taskType,
    new StartTimerTaskProvider(state),
  );
  stopTimerTaskProvider = vscode.tasks.registerTaskProvider(
    StopTimerTaskProvider.taskType,
    new StopTimerTaskProvider(state),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (startTimerTaskProvider) {
    startTimerTaskProvider.dispose();
  }

  if (stopTimerTaskProvider) {
    stopTimerTaskProvider.dispose();
  }

  if (outputChannel) {
    outputChannel.dispose();
  }

  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
