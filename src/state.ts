import { PomodoroConfig } from './config';

type EventHandler = (state: PomodoroState, interval: number) => void;

export class PomodoroState {
  private timerIntervalMs = 1000;
  private timerDelayMs = 5 * 1000;

  cycleCount: number = 0;
  isWorking: boolean = false;
  taskDesc: string = '';
  timerIcon: '🍅' | '🍆' = '🍅';
  timerId: NodeJS.Timeout | null = null;
  targetEndTimeMs: number = 0;

  workingIntervalMs: number = 0;
  shortBreakIntervalMs: number = 0;
  longBreakIntervalMs: number = 0;

  onTimerFinished: EventHandler = () => {};
  onTiked: EventHandler = () => {};
  onStopped: EventHandler = () => {};

  constructor(
    workingIntervalMs: number,
    shortBreakIntervalMs: number,
    longBreakIntervalMs: number,
  ) {
    this.workingIntervalMs = workingIntervalMs;
    this.shortBreakIntervalMs = shortBreakIntervalMs;
    this.longBreakIntervalMs = longBreakIntervalMs;
  }

  reset(): void {
    this.cycleCount = 0;
    this.isWorking = false;
    this.timerIcon = '🍅';
    this.timerId = null;
    this.targetEndTimeMs = 0;
  }

  gotoBreak(): void {
    this.isWorking = false;
    this.timerIcon = '🍆';
  }

  gotoWorking(): void {
    this.isWorking = true;
    this.timerIcon = '🍅';
  }

  startInterval(): void {
    this.clearInterval();
    this.timerId = setInterval(
      this.intervalCallback,
      this.timerIntervalMs,
      this,
      this.targetEndTimeMs,
    );
  }

  clearInterval(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  intervalCallback(state: PomodoroState, endTime: number) {
    const now = new Date();
    const interval = endTime - now.getTime();
    if (interval <= 0) {
      state.timerFinished();
    }
    state.onTiked(state, interval);
  }

  incrementCycleCount() {
    if (this.isWorking) {
      this.cycleCount += 1;
    }
  }

  timerFinished() {
    this.clearInterval();
    this.incrementCycleCount();
    this.onTimerFinished(this, 0);
    setTimeout(() => {
      this.switchTimer();
    }, this.timerDelayMs);
  }

  getIntervalMs() {
    if (this.isWorking) {
      return this.workingIntervalMs;
    } else {
      return this.cycleCount % 4 === 0
        ? this.longBreakIntervalMs
        : this.shortBreakIntervalMs;
    }
  }

  switchTimer() {
    if (this.isWorking) {
      this.gotoBreak();
    } else {
      this.gotoWorking();
    }
    const intervalMs = this.getIntervalMs();
    this.targetEndTimeMs = new Date().getTime() + intervalMs;

    this.onTiked(this, intervalMs);

    this.startInterval();
  }

  stopTimer() {
    this.clearInterval();
    this.reset();
    this.onStopped(this, 0);
  }
}
