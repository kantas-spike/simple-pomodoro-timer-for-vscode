import { PomodoroConfig } from './config';

type EventHandler = (state: PomodoroState, interval: number) => void;
type StateName = 'Working' | 'Break';
interface InnerState {
  init(): void;
  incrementCycle(): void;
  getIntervalMs(): number;
  switch(): void;
  getBellName(): string;
}

class WorkingState implements InnerState {
  private state: PomodoroState;
  constructor(state: PomodoroState) {
    this.state = state;
  }
  getBellName(): string {
    return this.state.cycleCount % 4 === 0
      ? this.state.bellNameAtEndOfFourthWorking
      : this.state.bellNameAtEndOfNormalWorking;
  }
  init(): void {
    this.state.timerIcon = '🍅';
  }
  incrementCycle(): void {
    this.state.cycleCount += 1;
  }
  getIntervalMs(): number {
    return this.state.workingIntervalMs;
  }
  switch(): void {
    this.state.currentState = 'Break';
  }
}

class BreakState implements InnerState {
  private state: PomodoroState;
  constructor(state: PomodoroState) {
    this.state = state;
  }
  getBellName(): string {
    return this.state.bellNameAtEndOfBreak;
  }
  init(): void {
    this.state.timerIcon = '🍆';
  }
  incrementCycle(): void {
    return; // do nothing
  }
  getIntervalMs(): number {
    return this.state.cycleCount % 4 === 0
      ? this.state.longBreakIntervalMs
      : this.state.shortBreakIntervalMs;
  }
  switch(): void {
    this.state.currentState = 'Working';
  }
}

export class PomodoroState {
  private timerIntervalMs = 1000;
  private timerDelayMs = 5 * 1000;
  private stateMap: Map<StateName, InnerState>;

  taskDesc: string = '';

  currentState: StateName = 'Break';
  cycleCount: number = 0;
  timerIcon: '🍅' | '🍆' = '🍅';
  timerId: NodeJS.Timeout | null = null;
  targetEndTimeMs: number = 0;

  workingIntervalMs: number = 0;
  shortBreakIntervalMs: number = 0;
  longBreakIntervalMs: number = 0;

  bellNameAtEndOfNormalWorking: string = '';
  bellNameAtEndOfFourthWorking: string = '';
  bellNameAtEndOfBreak: string = '';

  onTimerFinished: EventHandler = () => {};
  onTiked: EventHandler = () => {};
  onStopped: EventHandler = () => {};

  constructor(
    workingIntervalMs: number,
    shortBreakIntervalMs: number,
    longBreakIntervalMs: number,
    bellNameAtEndOfNormalWorking: string,
    bellNameAtEndOfFourthWorking: string,
    bellNameAtEndOfBreak: string,
  ) {
    this.workingIntervalMs = workingIntervalMs;
    this.shortBreakIntervalMs = shortBreakIntervalMs;
    this.longBreakIntervalMs = longBreakIntervalMs;

    this.bellNameAtEndOfNormalWorking = bellNameAtEndOfNormalWorking;
    this.bellNameAtEndOfFourthWorking = bellNameAtEndOfFourthWorking;
    this.bellNameAtEndOfBreak = bellNameAtEndOfBreak;

    this.reset();

    this.stateMap = new Map<StateName, InnerState>();
    this.stateMap.set('Working', new WorkingState(this));
    this.stateMap.set('Break', new BreakState(this));
  }

  reset(): void {
    this.currentState = 'Break';
    this.cycleCount = 0;
    this.timerIcon = '🍅';
    this.timerId = null;
    this.targetEndTimeMs = 0;
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

  getCurrentState(): InnerState {
    return this.stateMap.get(this.currentState)!;
  }

  incrementCycleCount() {
    this.getCurrentState().incrementCycle();
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
    return this.getCurrentState().getIntervalMs();
  }

  getBellName() {
    return this.getCurrentState().getBellName();
  }

  switchTimer() {
    this.getCurrentState().switch();
    this.getCurrentState().init();

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
