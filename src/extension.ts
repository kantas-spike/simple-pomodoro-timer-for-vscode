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
      '@projectName@': undefined,
      '@message@': undefined,
    });
    vscode.window.showInformationMessage(message);
  };
  state.onStopped = (state, _) => {
    updateStatusBar(state, null);
    if (state.timerId) {
      const format = config.stopMessgeFormat;
      const now = new Date().toLocaleString('ja-JP');
      const message = utils.getNotificationMessage(format, {
        '@time@': now,
        '@taskName@': state.taskDesc,
        '@projectName@': undefined,
        '@message@': undefined,
      });
      vscode.window.showInformationMessage(message);
    }
  };

  statusBarItem = vscode.window.createStatusBarItem(
    config.statusbarAlignment,
    config.statusbarPriority,
  );
  updateStatusBar(state, 0);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  registerCommand(
    context,
    'pomodoro-timer.startTimer',
    async (projectName: string | undefined) => {
      let defaultValue = '未入力';
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selectedText = editor.document.getText(editor.selection);
        if (selectedText) {
          defaultValue = selectedText;
        }
      }
      const result = await vscode.window.showInputBox({
        value: defaultValue,
        prompt: 'やることを入力してください',
      });
      if (result) {
        state.startTimer(result);
      } else {
        return;
      }
    },
  );
  registerCommand(
    context,
    'pomodoro-timer.startTimerOnCurrentLine',
    async (taskDesc: string | undefined, projectName: string | undefined) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const currentLineText = editor.document.lineAt(
          editor.selection.active.line,
        ).text;
        taskDesc = utils.taskNameFromTitleLineText(currentLineText);
      }

      if (!taskDesc) {
        const defaultValue = '未入力';
        taskDesc = await vscode.window.showInputBox({
          value: defaultValue,
          prompt: 'やることを入力してください',
        });
      }
      if (taskDesc) {
        state.startTimer(taskDesc);
      } else {
        return;
      }
    },
  );
  registerCommand(context, 'pomodoro-timer.stopTimer', () => {
    state.stopTimer();
  });
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
