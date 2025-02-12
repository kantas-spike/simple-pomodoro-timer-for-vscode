import * as vscode from 'vscode';
import * as assert from 'assert';
import { PomodoroConfig } from '../../config';
import { ConfigHelper } from '../support/configHelper';

suite('PomodoroConfig Test Suite', () => {
  test('test properties', async () => {
    const wc = vscode.workspace.getConfiguration('simple-pomodoro-timer');
    const config = new PomodoroConfig(wc);
    assert.strictEqual(0.2 * 60 * 1000, config.workingTimeMs);
    assert.strictEqual(0.1 * 60 * 1000, config.shortBreakTimeMs);
    assert.strictEqual(0.3 * 60 * 1000, config.longBreakTimeMs);
    assert.strictEqual(
      'marimba02.mp3',
      config.bellFileNameAtEndOfNormalWorking,
    );
    assert.strictEqual('pulse01.mp3', config.bellFileNameAtEndOfFourthWorking);
    assert.strictEqual('cymbal01.mp3', config.bellFileNameAtEndOfBreak);
    assert.strictEqual('🍅', config.timerIconForWroking);
    assert.strictEqual('🥔', config.timerIconForBreak);
    assert.strictEqual(
      vscode.StatusBarAlignment.Right,
      config.statusbarAlignment,
    );
    assert.strictEqual(-100, config.statusbarPriority);
    assert.strictEqual(3, config.delayTimeWhenSwitchTimer);
    assert.strictEqual(
      '@time@ [start] @@projectName@ @taskName@',
      config.startMessgeFormat,
    );
    assert.strictEqual(
      '@time@ [stop ] @@projectName@ @taskName@(@timerIconForWorking@x@cycleCount@ + @wipTime@) @message@',
      config.stopMessgeFormat,
    );
  });
  suite('ConfigHelperを使ったテスト', () => {
    let wc: vscode.WorkspaceConfiguration;
    setup(() => {
      wc = vscode.workspace.getConfiguration('simple-pomodoro-timer');
    });

    test('statusbarAlignment', () => {
      const fakeWc = new ConfigHelper(
        wc,
        new Map([['statusbarAlignment', 'left']]),
      );
      const config = new PomodoroConfig(fakeWc);
      assert.strictEqual(
        config.statusbarAlignment,
        vscode.StatusBarAlignment.Left,
      );
    });

    test('getAudioDir', () => {
      let fakeWc = new ConfigHelper(wc, new Map([['audioDir', null]]));
      let config = new PomodoroConfig(fakeWc);
      assert.strictEqual(config.getAudioDir('/tmp'), '/tmp/audio');

      fakeWc = new ConfigHelper(
        wc,
        new Map([['audioDir', '/usr/local/audio']]),
      );
      config = new PomodoroConfig(fakeWc);
      assert.strictEqual(config.getAudioDir('/tmp'), '/usr/local/audio');
    });

    test('getConfigValue', () => {
      const fakeWc = new ConfigHelper(
        wc,
        new Map([['statusbarAlignment', undefined]]),
      );
      let config = new PomodoroConfig(fakeWc);
      assert.throws(
        () => {
          config.statusbarAlignment;
        },
        {
          name: 'Error',
          message: '設定項目: statusbarAlignmentが定義されていません。',
        },
      );
    });
  });
});
