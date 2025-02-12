import * as vscode from 'vscode';
import { PomodoroConfig } from '../../config';
import { PomodoroState } from '../../state';
import { ClockHelper } from '../support/clockHelper';
import * as customAssert from '../support/customAssertions';

suite('PomodoroState Test Suite', () => {
  const wc = vscode.workspace.getConfiguration('simple-pomodoro-timer');
  const config = new PomodoroConfig(wc);

  test('initialize state object', () => {
    const state = new PomodoroState(config);

    customAssert.assertInitialState(state, config);
  });

  suite('startTimer', () => {
    // 2000-01-01
    const fakeNowDateTime = 946684800000;

    let clock: ClockHelper;
    const wc = vscode.workspace.getConfiguration('simple-pomodoro-timer');
    const config = new PomodoroConfig(wc);
    setup(() => {
      clock = new ClockHelper(fakeNowDateTime, config);
    });
    teardown(() => {
      if (clock) {
        clock.dispose();
      }
    });
    test('check state', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');
      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);

      onTickHelper.assertCallCountDiff(1);
      onTickHelper.assertLastCalledWith(state, config.workingTimeMs);
    });

    test('ontick', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');
      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);

      onTickHelper.assertCallCountDiff(1);
      onTickHelper.assertLastCalledWith(state, config.workingTimeMs);

      clock.advanceToOneSecLater();

      onTickHelper.assertCallCountDiff(1);
      onTickHelper.assertLastCalledWith(state, config.workingTimeMs - 1000);

      clock.advanceToOneSecLater();
      onTickHelper.assertCallCountDiff(1);
      onTickHelper.assertLastCalledWith(state, config.workingTimeMs - 1000 * 2);
    });

    test('first working time finished', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new customAssert.IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');
      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);
      onTickHelper.assertCallCountDiff(1);

      clock.advanceUntileEndOfWorking();

      customAssert.assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        1,
      );

      clock.advanceUtilDelayTime();

      customAssert.assertShortBreakStartedState(
        state,
        config,
        new Date().valueOf(),
        1,
      );
    });

    test('start timer twice', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new customAssert.IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');
      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);

      clock.advanceToNsecLater(2);

      state.startTimer('テストタスク2', 'プロジェクトB');
      customAssert.assertTaskName(state, 'テストタスク2', 'プロジェクトB');
      customAssert.assertWorkingStartedState(
        state,
        config,
        new Date().valueOf(),
      );
    });

    test('second working time started', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new customAssert.IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');
      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);
      onTickHelper.assertCallCountDiff(1);

      clock.advanceUntileEndOfWorking();

      customAssert.assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        1,
      );

      clock.advanceUtilDelayTime();

      customAssert.assertShortBreakStartedState(
        state,
        config,
        new Date().valueOf(),
        1,
      );

      clock.advanceUtilEndOfShortBreak();

      customAssert.assertBreakFinishedState(state, config, onFinishedHelper, 1);

      clock.advanceUtilDelayTime();
      customAssert.assertWorkingStartedState(
        state,
        config,
        new Date().valueOf(),
        1,
      );
    });

    test('second working time finished', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new customAssert.IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');
      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);
      onTickHelper.assertCallCountDiff(1);

      clock.advanceUntileEndOfWorking();

      customAssert.assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        1,
      );

      clock.advanceUtilDelayTime();

      customAssert.assertShortBreakStartedState(
        state,
        config,
        new Date().valueOf(),
        1,
      );

      clock.advanceUtilEndOfShortBreak();

      customAssert.assertBreakFinishedState(state, config, onFinishedHelper, 1);

      clock.advanceUtilDelayTime();
      customAssert.assertWorkingStartedState(
        state,
        config,
        new Date().valueOf(),
        1,
      );

      clock.advanceUntileEndOfWorking();

      customAssert.assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        2,
      );
    });

    test('forth working time finished', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new customAssert.IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');

      let cycle = 0;
      for (let i = 0; i < 4; i++) {
        cycle += 1;

        clock.advanceUntileEndOfWorking();

        customAssert.assertWorkingFinishedState(
          state,
          config,
          onTickHelper,
          onFinishedHelper,
          cycle,
        );

        clock.advanceUtilDelayTime();

        if (cycle !== 4) {
          customAssert.assertShortBreakStartedState(
            state,
            config,
            new Date().valueOf(),
            cycle,
          );
          clock.advanceUtilEndOfShortBreak();
          customAssert.assertBreakFinishedState(
            state,
            config,
            onFinishedHelper,
            cycle,
          );
          clock.advanceUtilDelayTime();
        }
      }
      customAssert.assertLongBreakStartedState(
        state,
        config,
        new Date().valueOf(),
        cycle,
      );

      clock.advanceUtilEndOfLongBreak();
      customAssert.assertBreakFinishedState(
        state,
        config,
        onFinishedHelper,
        cycle,
      );
      clock.advanceUtilDelayTime();

      customAssert.assertWorkingStartedState(
        state,
        config,
        new Date().valueOf(),
        cycle,
      );
    });
  });

  suite('stopTimer', () => {
    // 2000-01-01
    const fakeNowDateTime = 946684800000;

    let clock: ClockHelper;
    const wc = vscode.workspace.getConfiguration('simple-pomodoro-timer');
    const config = new PomodoroConfig(wc);
    setup(() => {
      clock = new ClockHelper(fakeNowDateTime, config);
    });
    teardown(() => {
      if (clock) {
        clock.dispose();
      }
    });
    test('stop timer at working', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onStopHelper = new customAssert.StoplHandlerHelper();
      state.onStopped = onStopHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');
      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);

      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);
      const orgEndTimeMs = state.targetEndTimeMs;
      const orgInterval = state.getIntervalMs();
      clock.advanceUntileEndOfWorking();

      state.stopTimer('タスク停止');
      customAssert.assertInitialState(state, config);
      onStopHelper.assertCallCountDiff(1);
      const wipTime = orgInterval - (orgEndTimeMs - new Date().valueOf());
      console.log(
        'wipTime: ',
        wipTime,
        ' targetEndTimeMs: ',
        state.targetEndTimeMs,
      );
      onStopHelper.assertLastCalledWith(state, wipTime, 'タスク停止');
    });

    test('stop timer at break', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new customAssert.IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new customAssert.IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;
      const onStopHelper = new customAssert.StoplHandlerHelper();
      state.onStopped = onStopHelper.handler;

      customAssert.assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      customAssert.assertTaskName(state, 'テストタスク', 'プロジェクトA');
      customAssert.assertWorkingStartedState(state, config, fakeNowDateTime);
      onTickHelper.assertCallCountDiff(1);

      clock.advanceUntileEndOfWorking();

      customAssert.assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        1,
      );

      clock.advanceUtilDelayTime();

      customAssert.assertShortBreakStartedState(
        state,
        config,
        new Date().valueOf(),
        1,
      );

      state.stopTimer('タスク完了');
      onStopHelper.assertLastCalledWith(state, 0, 'タスク完了');
    });
  });
});
