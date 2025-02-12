/* eslint-disable @typescript-eslint/naming-convention */
import * as assert from 'assert';
import * as utils from '../../utils';

suite('Utils Test Suite', () => {
  test('utils.millisecToHHMM', () => {
    assert.strictEqual('00:01', utils.millisecToHHMM(1 * 1000));
    assert.strictEqual('00:10', utils.millisecToHHMM(10 * 1000));
    assert.strictEqual('01:01', utils.millisecToHHMM(61 * 1000));
    assert.strictEqual('10:10', utils.millisecToHHMM(610 * 1000));

    assert.strictEqual('00:00', utils.millisecToHHMM(-1));
    assert.strictEqual('--:--', utils.millisecToHHMM(null));
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
          '@wipTime@': undefined,
          '@timerIconForWorking@': 'W',
          '@timerIconForBreak@': 'B',
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
          '@wipTime@': undefined,
          '@timerIconForWorking@': 'W',
          '@timerIconForBreak@': 'B',
          '@taskName@': undefined,
        },
      ),
      '2025/02/04 05:54:00 [テスト] () - ',
      '@time@: [@projectName@] @taskName@ - @message@',
    );
  });
});
