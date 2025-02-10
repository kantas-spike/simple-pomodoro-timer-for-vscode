import * as sinon from 'sinon';
import { PomodoroConfig } from '../../config';

export class ClockHelper {
  private clock: sinon.SinonFakeTimers;
  private workingIntervalMs: number;
  private longBreakIntervalMs: number;
  private shortBreakIntervalMs: number;
  private timerDelayMs: number;

  constructor(now: number, config: PomodoroConfig) {
    this.clock = sinon.useFakeTimers({ now });
    this.workingIntervalMs = config.workingTimeMs;
    this.longBreakIntervalMs = config.longBreakTimeMs;
    this.shortBreakIntervalMs = config.shortBreakTimeMs;
    this.timerDelayMs = config.delayTimeWhenSwitchTimer * 1000;
  }

  dispose() {
    this.clock.restore();
  }

  advanceUntileEndOfWorking() {
    this.clock.tick(this.workingIntervalMs);
  }

  advanceUtilEndOfLongBreak() {
    this.clock.tick(this.longBreakIntervalMs);
  }

  advanceUtilEndOfShortBreak() {
    this.clock.tick(this.shortBreakIntervalMs);
  }

  advanceUtilDelayTime() {
    this.clock.tick(this.timerDelayMs);
  }

  advanceToNsecLater(n: number) {
    this.clock.tick(n * 1000);
  }

  advanceToOneSecLater() {
    this.clock.tick(1000);
  }
}
