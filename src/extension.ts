// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as utils from './utils';
import { AudioPlayer } from './audioPlayer';
import { PomodoroConfig } from './config';
import { PomodoroState } from './state';

let statusBarItem: vscode.StatusBarItem;
let taskDesc = '';

// 設定取得
const config = new PomodoroConfig();

function updateStatusBar(state: PomodoroState, intervalMs: number | null) {
  if (statusBarItem) {
    const mmss = utils.millisecToHHMM(intervalMs);
    statusBarItem.text = `${state.timerIcon} ${mmss} (${state.cycleCount})`;
    statusBarItem.show();
  }
}

function registerCommand(
  context: vscode.ExtensionContext,
  commandName: string,
  callback: (...args: any[]) => any,
  thisArg?: any,
): void {
  let disposable = vscode.commands.registerCommand(commandName, callback);
  context.subscriptions.push(disposable);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  const player = new AudioPlayer(context.extensionPath);
  const state = new PomodoroState(
    config.workingTimeMs,
    config.shortBreakTimeMs,
    config.longBreakTimeMs,
  );
  state.onTiked = (state, interval) => {
    updateStatusBar(state, interval);
  };
  state.onTimerFinished = (state, interval) => {
    updateStatusBar(state, interval);
    if (state.isWorking) {
      if (state.cycleCount % 4 === 0) {
        player.play(config.bellNameAtEndOfFourthWorking);
      } else {
        player.play(config.bellNameAtEndOfNormalWorking);
      }
    } else {
      player.play(config.bellNameAtEndOfBreak);
    }
  };
  state.onStopped = (state, interval) => {
    updateStatusBar(state, null);
  };

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  updateStatusBar(state, 0);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  registerCommand(context, 'pomodoro-timer.startTimer', async () => {
    const result = await vscode.window.showInputBox({
      value: '未入力',
      prompt: 'やることを入力してください',
    });
    if (result) {
      taskDesc = result;
      vscode.window.showInformationMessage(`${taskDesc}: 作業開始!!`);
      state.switchTimer();
    } else {
      return;
    }
  });
  registerCommand(context, 'pomodoro-timer.stopTimer', () => {
    vscode.window.showInformationMessage(
      `${taskDesc}: 作業停止!! 完了サイクル数: ${state.cycleCount}`,
    );
    state.stopTimer();
  });
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
