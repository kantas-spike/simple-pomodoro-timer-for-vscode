import * as assert from 'assert';
import * as utils from '../../utils';

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

  test('Utils test', () => {
    assert.strictEqual('00:01', utils.millisecToHHMM(1 * 1000));
    assert.strictEqual('00:10', utils.millisecToHHMM(10 * 1000));
    assert.strictEqual('01:01', utils.millisecToHHMM(61 * 1000));
    assert.strictEqual('10:10', utils.millisecToHHMM(610 * 1000));
  });
});
