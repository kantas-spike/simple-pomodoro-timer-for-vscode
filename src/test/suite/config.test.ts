import * as vscode from 'vscode';
import * as assert from 'assert';
import { PomodoroConfig } from '../../config';

suite('PomodoroConfig Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('test properties', () => {
    const config = new PomodoroConfig();
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

  test('test methods', () => {
    const config = new PomodoroConfig();
    assert.strictEqual('/tmp/audio', config.getAudioDir('/tmp'));
  });
});
