import assert = require('assert');
import { PomodoroState } from '../../state';
import { PomodoroConfig } from '../../config';
import sinon = require('sinon');

export function assertTaskName(
  state: PomodoroState,
  taskName: string,
  projectName: string | undefined,
) {
  assert.strictEqual(state.taskName, taskName);
  assert.strictEqual(state.projectName, projectName);
}

export function assertInitialState(
  state: PomodoroState,
  config: PomodoroConfig,
) {
  assert.strictEqual(state.workingIntervalMs, config.workingTimeMs);
  assert.strictEqual(state.longBreakIntervalMs, config.longBreakTimeMs);
  assert.strictEqual(state.shortBreakIntervalMs, config.shortBreakTimeMs);
  assert.strictEqual(state.timerIconForWorking, config.timerIconForWroking);
  assert.strictEqual(state.timerIconForBreak, config.timerIconForBreak);
  assert.strictEqual(state.timerIcon, config.timerIconForWroking);
  assert.strictEqual(state.cycleCount, 0);
  assert.strictEqual(state.currentState, 'Stopped');
  assert.strictEqual(state.timerId, null);
}

export function assertWorkingStartedState(
  state: PomodoroState,
  config: PomodoroConfig,
  fakeNowDateTime: number,
  cycleCount: number = 0,
) {
  assert.strictEqual(state.currentState, 'Working');
  assert.strictEqual(state.getIntervalMs(), config.workingTimeMs);
  assert.strictEqual(
    state.targetEndTimeMs,
    fakeNowDateTime + config.workingTimeMs,
  );
  assert.notStrictEqual(state.timerId, null);
  assert.strictEqual(state.cycleCount, cycleCount);
}

export function assertWorkingFinishedState(
  state: PomodoroState,
  config: PomodoroConfig,
  onTickHelper: IntervalHandlerHelper,
  onFinishedHelper: IntervalHandlerHelper,
  cycleCount: number,
) {
  // onTickHelper.assertCallCountDiff(config.workingTimeMs / 1000);
  onFinishedHelper.assertCallCountDiff(1);
  assert.strictEqual(state.cycleCount, cycleCount);
  assert.strictEqual(state.currentState, 'Working');
  assert.strictEqual(state.timerId, null);
  if (cycleCount === 0 || cycleCount % 4 !== 0) {
    assert.strictEqual(
      state.getBellName(),
      config.bellFileNameAtEndOfNormalWorking,
    );
  } else {
    assert.strictEqual(
      state.getBellName(),
      config.bellFileNameAtEndOfFourthWorking,
    );
  }
}

export function assertBreakFinishedState(
  state: PomodoroState,
  config: PomodoroConfig,
  onFinishedHelper: IntervalHandlerHelper,
  cycleCount: number,
) {
  onFinishedHelper.assertCallCountDiff(1);
  assert.strictEqual(state.cycleCount, cycleCount);
  assert.strictEqual(state.currentState, 'Break');
  assert.strictEqual(state.timerId, null);
  assert.strictEqual(state.getBellName(), config.bellFileNameAtEndOfBreak);
}

export function assertBreakStartedState(
  state: PomodoroState,
  breakTimeMs: number,
  fakeNowDateTime: number,
  cycleCount: number,
) {
  assert.strictEqual(state.currentState, 'Break');
  assert.strictEqual(state.getIntervalMs(), breakTimeMs);
  assert.strictEqual(state.targetEndTimeMs, fakeNowDateTime + breakTimeMs);
  assert.notStrictEqual(state.timerId, null);
  assert.strictEqual(state.cycleCount, cycleCount);
}

export function assertShortBreakStartedState(
  state: PomodoroState,
  config: PomodoroConfig,
  fakeNowDateTime: number,
  cycleCount: number,
) {
  assertBreakStartedState(
    state,
    config.shortBreakTimeMs,
    fakeNowDateTime,
    cycleCount,
  );
}

export function assertLongBreakStartedState(
  state: PomodoroState,
  config: PomodoroConfig,
  fakeNowDateTime: number,
  cycleCount: number,
) {
  assertBreakStartedState(
    state,
    config.longBreakTimeMs,
    fakeNowDateTime,
    cycleCount,
  );
}

export class IntervalHandlerHelper {
  handler: sinon.SinonSpy<any[], any>;
  private lastCallCount = 0;

  constructor() {
    this.handler = sinon.fake();
  }

  assertCallCountDiff(count: number) {
    const newCount = this.handler.callCount;
    const diff = newCount - this.lastCallCount;
    this.lastCallCount = newCount;
    assert.strictEqual(diff, count);
  }

  assertLastCalledWith(state: PomodoroState, interval: number) {
    sinon.assert.calledWith(this.handler.lastCall, state, interval);
  }
}

export class StoplHandlerHelper {
  handler: sinon.SinonSpy<any[], any>;
  private lastCallCount = 0;

  constructor() {
    this.handler = sinon.fake();
  }

  assertCallCountDiff(count: number) {
    const newCount = this.handler.callCount;
    const diff = newCount - this.lastCallCount;
    this.lastCallCount = newCount;
    assert.strictEqual(diff, count);
  }

  assertLastCalledWith(
    state: PomodoroState,
    wipTimeMs: number,
    reason: string | undefined,
  ) {
    sinon.assert.calledWith(this.handler.lastCall, state, wipTimeMs, reason);
  }
}
