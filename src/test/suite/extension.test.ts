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
      0.2,
      config.get('simple-pomodoro-timer.defaultWorkingTime'),
    );
    assert.strictEqual(
      0.1,
      config.get('simple-pomodoro-timer.defaultShortBreakTime'),
    );
    assert.strictEqual(
      0.3,
      config.get('simple-pomodoro-timer.defaultLongBreakTime'),
      'aaa',
    );
    assert.strictEqual(null, config.get('simple-pomodoro-timer.audioDir'));
  });

  test('PomodoroConfig', () => {
    const config = new PomodoroConfig();
    assert.strictEqual(0.2 * 60 * 1000, config.workingTimeMs);
    assert.strictEqual(0.1 * 60 * 1000, config.shortBreakTimeMs);
    assert.strictEqual(0.3 * 60 * 1000, config.longBreakTimeMs);
    assert.strictEqual('marimba02.mp3', config.bellNameAtEndOfNormalWorking);
    assert.strictEqual('pulse01.mp3', config.bellNameAtEndOfFourthWorking);
    assert.strictEqual('cymbal01.mp3', config.bellNameAtEndOfBreak);
  });

  test('utils.millisecToHHMM', () => {
    assert.strictEqual('00:01', utils.millisecToHHMM(1 * 1000));
    assert.strictEqual('00:10', utils.millisecToHHMM(10 * 1000));
    assert.strictEqual('01:01', utils.millisecToHHMM(61 * 1000));
    assert.strictEqual('10:10', utils.millisecToHHMM(610 * 1000));
  });

  test('utils.getNotificationMessage', () => {
    assert.strictEqual(
      utils.getNotificationMessage(
        '@time@ [@projectName@] @taskName@(@cycleCount@) - @message@',
        {
          '@time@': '2025/02/04 05:54:00',
          '@taskName@': 'テストタスク',
          '@projectName@': 'テストプロジェクト',
          '@cycleCount@': String(2),
          '@message@': 'テストメッセージ',
        },
      ),
      '2025/02/04 05:54:00 [テストプロジェクト] テストタスク(2) - テストメッセージ',
      '@time@: [@projectName@] @taskName@ - @message@',
    );
    assert.strictEqual(
      utils.getNotificationMessage(
        '@time@ [@projectName@] @taskName@(@cycleCount@) - @message@',
        {
          '@time@': '2025/02/04 05:54:00',
          '@projectName@': 'テスト',
          '@cycleCount@': undefined,
          '@message@': undefined,
          '@taskName@': undefined,
        },
      ),
      '2025/02/04 05:54:00 [テスト] () - ',
      '@time@: [@projectName@] @taskName@ - @message@',
    );
  });
});
