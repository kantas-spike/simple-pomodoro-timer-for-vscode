import assert = require('assert');
import { PomodoroConfig } from '../../config';
import { PomodoroState } from '../../state';
import * as sinon from 'sinon';
import { ClockHelper } from '../support/clockHelper';
import {
  assertInitialState,
  assertTaskName,
  assertShortBreakStartedState,
  assertWorkingStartedState,
  assertWorkingFinishedState,
  IntervalHandlerHelper,
  assertBreakFinishedState,
  assertLongBreakStartedState,
  StoplHandlerHelper,
} from '../support/customAssertions';

suite('PomodoroState Test Suite', () => {
  const config = new PomodoroConfig();

  test('initialize state object', () => {
    const state = new PomodoroState(config);

    assertInitialState(state, config);
  });

  suite('startTimer', () => {
    // 2000-01-01
    const fakeNowDateTime = 946684800000;

    let clock: ClockHelper;
    const config = new PomodoroConfig();
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
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');
      assertWorkingStartedState(state, config, fakeNowDateTime);

      onTickHelper.assertCallCountDiff(1);
      onTickHelper.assertLastCalledWith(state, config.workingTimeMs);
    });

    test('ontick', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');
      assertWorkingStartedState(state, config, fakeNowDateTime);

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
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');
      assertWorkingStartedState(state, config, fakeNowDateTime);
      onTickHelper.assertCallCountDiff(1);

      clock.advanceUntileEndOfWorking();

      assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        1,
      );

      clock.advanceUtilDelayTime();

      assertShortBreakStartedState(state, config, new Date().valueOf(), 1);
    });

    test('start timer twice', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');
      assertWorkingStartedState(state, config, fakeNowDateTime);

      clock.advanceToNsecLater(2);

      state.startTimer('テストタスク2', 'プロジェクトB');
      assertTaskName(state, 'テストタスク2', 'プロジェクトB');
      assertWorkingStartedState(state, config, new Date().valueOf());
    });

    test('second working time started', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');
      assertWorkingStartedState(state, config, fakeNowDateTime);
      onTickHelper.assertCallCountDiff(1);

      clock.advanceUntileEndOfWorking();

      assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        1,
      );

      clock.advanceUtilDelayTime();

      assertShortBreakStartedState(state, config, new Date().valueOf(), 1);

      clock.advanceUtilEndOfShortBreak();

      assertBreakFinishedState(state, config, onFinishedHelper, 1);

      clock.advanceUtilDelayTime();
      assertWorkingStartedState(state, config, new Date().valueOf(), 1);
    });

    test('second working time finished', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');
      assertWorkingStartedState(state, config, fakeNowDateTime);
      onTickHelper.assertCallCountDiff(1);

      clock.advanceUntileEndOfWorking();

      assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        1,
      );

      clock.advanceUtilDelayTime();

      assertShortBreakStartedState(state, config, new Date().valueOf(), 1);

      clock.advanceUtilEndOfShortBreak();

      assertBreakFinishedState(state, config, onFinishedHelper, 1);

      clock.advanceUtilDelayTime();
      assertWorkingStartedState(state, config, new Date().valueOf(), 1);

      clock.advanceUntileEndOfWorking();

      assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        2,
      );
    });

    test('forth working time finished', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');

      let cycle = 0;
      for (let i = 0; i < 4; i++) {
        cycle += 1;

        clock.advanceUntileEndOfWorking();

        assertWorkingFinishedState(
          state,
          config,
          onTickHelper,
          onFinishedHelper,
          cycle,
        );

        clock.advanceUtilDelayTime();

        if (cycle !== 4) {
          assertShortBreakStartedState(
            state,
            config,
            new Date().valueOf(),
            cycle,
          );
          clock.advanceUtilEndOfShortBreak();
          assertBreakFinishedState(state, config, onFinishedHelper, cycle);
          clock.advanceUtilDelayTime();
        }
      }
      assertLongBreakStartedState(state, config, new Date().valueOf(), cycle);

      clock.advanceUtilEndOfLongBreak();
      assertBreakFinishedState(state, config, onFinishedHelper, cycle);
      clock.advanceUtilDelayTime();

      assertWorkingStartedState(state, config, new Date().valueOf(), cycle);
    });
  });

  suite('stopTimer', () => {
    // 2000-01-01
    const fakeNowDateTime = 946684800000;

    let clock: ClockHelper;
    const config = new PomodoroConfig();
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
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onStopHelper = new StoplHandlerHelper();
      state.onStopped = onStopHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');
      assertWorkingStartedState(state, config, fakeNowDateTime);

      assertWorkingStartedState(state, config, fakeNowDateTime);
      const orgEndTimeMs = state.targetEndTimeMs;
      const orgInterval = state.getIntervalMs();
      clock.advanceUntileEndOfWorking();

      state.stopTimer('タスク停止');
      assertInitialState(state, config);
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

    test('first working time finished', () => {
      const state = new PomodoroState(config);
      const onTickHelper = new IntervalHandlerHelper();
      state.onTiked = onTickHelper.handler;
      const onFinishedHelper = new IntervalHandlerHelper();
      state.onTimerFinished = onFinishedHelper.handler;
      const onStopHelper = new StoplHandlerHelper();
      state.onStopped = onStopHelper.handler;

      assertInitialState(state, config);

      state.startTimer('テストタスク', 'プロジェクトA');

      assertTaskName(state, 'テストタスク', 'プロジェクトA');
      assertWorkingStartedState(state, config, fakeNowDateTime);
      onTickHelper.assertCallCountDiff(1);

      clock.advanceUntileEndOfWorking();

      assertWorkingFinishedState(
        state,
        config,
        onTickHelper,
        onFinishedHelper,
        1,
      );

      clock.advanceUtilDelayTime();

      assertShortBreakStartedState(state, config, new Date().valueOf(), 1);

      state.stopTimer('タスク完了');
      onStopHelper.assertLastCalledWith(state, 0, 'タスク完了');
    });
  });
});
