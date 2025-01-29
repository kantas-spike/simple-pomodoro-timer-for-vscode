import * as assert from 'assert';
import * as utils from '../../utils';
import { PomodoroConfig } from '../../config';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });

  test('Default Configuration', () => {
    const config: vscode.WorkspaceConfiguration =
      vscode.workspace.getConfiguration();
    console.log('@@@' + config.get('simple-pomodoro-timer.defaultWorkingTime'));
    assert.strictEqual(
      25,
      config.get('simple-pomodoro-timer.defaultWorkingTime'),
    );
    assert.strictEqual(
      5,
      config.get('simple-pomodoro-timer.defaultShortBreakTime'),
    );
    assert.strictEqual(
      15,
      config.get('simple-pomodoro-timer.defaultLongBreakTime'),
    );
  });

  test('PomodoroConfig', () => {
    const config = new PomodoroConfig();
    assert.strictEqual(25 * 60 * 1000, config.workingTimeMs);
    assert.strictEqual(5 * 60 * 1000, config.shortBreakTimeMs);
    assert.strictEqual(15 * 60 * 1000, config.longBreakTimeMs);
    assert.strictEqual('marimba02.mp3', config.bellNameAtEndOfNormalWorking);
    assert.strictEqual('pulse01.mp3', config.bellNameAtEndOfFourthWorking);
    assert.strictEqual('cymbal01.mp3', config.bellNameAtEndOfBreak);
  });

  test('utils.taskNameFromLineText test', () => {
    assert.strictEqual(
      'abcd efg',
      utils.taskNameFromLineText('    abcd efg    '),
    );
    assert.strictEqual(
      '1. abcde',
      utils.taskNameFromLineText('  1.  [ ]  abcde    '),
    );
    assert.strictEqual(
      '99. abcde',
      utils.taskNameFromLineText('  99.  [ ]  abcde    '),
    );
    assert.strictEqual(
      '- abcde',
      utils.taskNameFromLineText('  -  [ ]  abcde    '),
    );
    assert.strictEqual(
      '+ abcde',
      utils.taskNameFromLineText('  +  [ ]  abcde    '),
    );
    assert.strictEqual(
      '* abcde',
      utils.taskNameFromLineText('  *  [ ]  abcde    '),
    );
  });

  test('utils.millisecToHHMM', () => {
    assert.strictEqual('00:01', utils.millisecToHHMM(1 * 1000));
    assert.strictEqual('00:10', utils.millisecToHHMM(10 * 1000));
    assert.strictEqual('01:01', utils.millisecToHHMM(61 * 1000));
    assert.strictEqual('10:10', utils.millisecToHHMM(610 * 1000));
  });
});
