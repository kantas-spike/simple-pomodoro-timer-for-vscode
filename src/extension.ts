// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as utils from './utils';
import * as path from 'path';
const sound = require('sound-play');

const DEFAULT_WORKING_TIME_MIN = 25;
const DEFAULT_LONG_BREAK_TIME_MIN = 15;
const DEFAULT_SHORT_BREAK_TIME_MIN = 5;
const TIMER_INTERVAL_MS = 1000;
const TIMER_DELAY_MS = 5 * 1000;
const DEFAULT_BELL_FILENAME = 'marimba01.mp3';

let statusBarItem: vscode.StatusBarItem;
let cycleCount = 0;
let isWorking = false;
let timerId: NodeJS.Timeout | null = null;
let targetEndTimeMs = 0;
let timerIcon: '🍅' | '🍆' = '🍅';
let taskDesc = '';
let bellNameAtEndOfNormalWorking = '';
let bellNameAtEndOfFourthWorking = '';
let bellNameAtEndOfBreak = '';

let audioDir = '';

function switchTimer() {
  // 設定取得
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration();
  const workingTimeMilliSec =
    config.get<number>(
      'simple-pomodoro-timer.defaultWorkingTime',
      DEFAULT_WORKING_TIME_MIN,
    ) *
    60 *
    1000;
  const shortBreakTimeMin =
    config.get<number>(
      'simple-pomodoro-timer.defaultShortBreakTime',
      DEFAULT_SHORT_BREAK_TIME_MIN,
    ) *
    60 *
    1000;
  const longBreakTimeMin =
    config.get<number>(
      'simple-pomodoro-timer.defaultLongBreakTime',
      DEFAULT_LONG_BREAK_TIME_MIN,
    ) *
    60 *
    1000;
  bellNameAtEndOfNormalWorking = config.get(
    'simple-pomodoro-timer.bellNameAtEndOfNormalWorking',
    DEFAULT_BELL_FILENAME,
  );
  bellNameAtEndOfFourthWorking = config.get(
    'simple-pomodoro-timer.bellNameAtEndOfFourthWorking',
    DEFAULT_BELL_FILENAME,
  );
  bellNameAtEndOfBreak = config.get(
    'simple-pomodoro-timer.bellNameAtEndOfBreak',
    DEFAULT_BELL_FILENAME,
  );

  let intervalMs = workingTimeMilliSec;
  if (isWorking) {
    isWorking = false;
    timerIcon = '🍆';
    if (cycleCount !== 0 && cycleCount % 4 === 0) {
      // long break
      intervalMs = longBreakTimeMin;
    } else {
      intervalMs = shortBreakTimeMin;
    }
  } else {
    isWorking = true;
    timerIcon = '🍅';
  }
  targetEndTimeMs = new Date().getTime() + intervalMs;
  updateStatusBar(intervalMs);
  if (timerId) {
    clearInterval(timerId);
  }
  timerId = setInterval(intervalCallback, TIMER_INTERVAL_MS, targetEndTimeMs);
}

function intervalCallback(endTime: number) {
  const now = new Date();
  const interval = endTime - now.getTime();
  if (interval <= 0) {
    timerFinished();
  }
  updateStatusBar(interval);
}

function updateStatusBar(intervalMs: number | null) {
  if (statusBarItem) {
    const mmss = utils.millisecToHHMM(intervalMs);
    statusBarItem.text = `${timerIcon} ${mmss} (${cycleCount})`;
    statusBarItem.show();
  }
}

function timerFinished() {
  updateStatusBar(0);
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  if (isWorking) {
    cycleCount += 1;
    if (cycleCount % 4 === 0) {
      playAudio(audioDir, bellNameAtEndOfFourthWorking);
    } else {
      playAudio(audioDir, bellNameAtEndOfNormalWorking);
    }
  } else {
    playAudio(audioDir, bellNameAtEndOfBreak);
  }
  setTimeout(() => {
    switchTimer();
  }, TIMER_DELAY_MS);
}

function stopTimer() {
  timerIcon = '🍅';
  updateStatusBar(null);
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
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

function playAudio(audioDir: string, audioFileName: string) {
  const audioPath = path.join(audioDir, audioFileName);
  sound.play(audioPath);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  audioDir = utils.getAudioDirPath(context.extensionPath);

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100,
  );
  updateStatusBar(0);

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
      switchTimer();
    } else {
      return;
    }
  });
  registerCommand(context, 'pomodoro-timer.stopTimer', () => {
    vscode.window.showInformationMessage(
      `${taskDesc}: 作業停止!! 完了サイクル数: ${cycleCount}`,
    );
    stopTimer();
  });
}

// This method is called when your extension is deactivated
export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
