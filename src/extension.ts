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
let taskDesc = '';
let startTimerTaskProvider: vscode.Disposable | undefined;
let stopTimerTaskProvider: vscode.Disposable | undefined;

// 設定取得
const config = new PomodoroConfig();

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
  const player = new AudioPlayer(config.getAudioDir(context.extensionPath));
  const state = new PomodoroState(
    config.workingTimeMs,
    config.shortBreakTimeMs,
    config.longBreakTimeMs,
    config.bellNameAtEndOfNormalWorking,
    config.bellNameAtEndOfFourthWorking,
    config.bellNameAtEndOfBreak,
    config.timerIconForWroking,
    config.timerIconForBreak,
    config.delayTimeWhenSwitchTimer,
  );
  state.onTiked = (state, interval) => {
    updateStatusBar(state, interval);
  };
  state.onTimerFinished = (state, interval) => {
    updateStatusBar(state, interval);
    const bellName = state.getBellName();
    player.play(bellName);
  };
  state.onStarted = (state, _) => {
    const format = config.startMessgeFormat;
    const now = new Date().toLocaleString('ja-JP');
    const message = utils.getNotificationMessage(format, {
      '@time@': now,
      '@taskName@': state.taskDesc,
      '@projectName@': state.projectName,
      '@cycleCount@': undefined,
      '@message@': undefined,
    });
    vscode.window.showInformationMessage(message);
  };
  state.onStopped = (state, _, reason) => {
    updateStatusBar(state, null);
    if (state.timerId) {
      const format = config.stopMessgeFormat;
      const now = new Date().toLocaleString('ja-JP');
      const message = utils.getNotificationMessage(format, {
        '@time@': now,
        '@taskName@': state.taskDesc,
        '@projectName@': state.projectName,
        '@cycleCount@': `${state.cycleCount}`,
        '@message@': reason,
      });
      vscode.window.showInformationMessage(message);
    }
  };

  statusBarItem = vscode.window.createStatusBarItem(
    config.statusbarAlignment,
    config.statusbarPriority,
  );
  updateStatusBar(state, 0);

  startTimerTaskProvider = vscode.tasks.registerTaskProvider(
    StartTimerTaskProvider.TaskType,
    new StartTimerTaskProvider(state),
  );
  stopTimerTaskProvider = vscode.tasks.registerTaskProvider(
    StopTimerTaskProvider.TaskType,
    new StopTimerTaskProvider(state),
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (startTimerTaskProvider) {
    startTimerTaskProvider.dispose();
  }

  if (stopTimerTaskProvider) {
    stopTimerTaskProvider.dispose();
  }

  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
