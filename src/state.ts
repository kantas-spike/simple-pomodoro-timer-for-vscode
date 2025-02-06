import { PomodoroConfig } from './config';

type EventHandler = (state: PomodoroState, reason?: string) => void;
type StopEventHandler = (
  state: PomodoroState,
  wipTimeMs: number,
  reason?: string,
) => void;
type IntervalEventHandler = (state: PomodoroState, interval: number) => void;
type StateName = 'Working' | 'Break';
interface InnerState {
  init(): void;
  incrementCycle(): void;
  getIntervalMs(): number;
  getWipTimeMs(): number;
  switch(): void;
  getBellName(): string;
}

class WorkingState implements InnerState {
  private state: PomodoroState;
  constructor(state: PomodoroState) {
    this.state = state;
  }
  getWipTimeMs(): number {
    const now = new Date();
    const intervalMs = this.getIntervalMs();
    const remainingTimeMs = this.state.targetEndTimeMs - now.getTime();
    return intervalMs - remainingTimeMs;
  }
  getBellName(): string {
    return this.state.cycleCount % 4 === 0
      ? this.state.bellNameAtEndOfFourthWorking
      : this.state.bellNameAtEndOfNormalWorking;
  }
  init(): void {
    this.state.timerIcon = this.state.timerIconForWorking;
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
  getWipTimeMs(): number {
    return 0;
  }
  getBellName(): string {
    return this.state.bellNameAtEndOfBreak;
  }
  init(): void {
    this.state.timerIcon = this.state.timerIconForBreak;
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
  private timerDelayMs = 0;
  private stateMap: Map<StateName, InnerState>;

  taskDesc: string = '';
  projectName: string | undefined = undefined;

  currentState: StateName = 'Break';
  cycleCount: number = 0;
  timerIcon: string = '';
  timerId: NodeJS.Timeout | null = null;
  targetEndTimeMs: number = 0;

  workingIntervalMs: number = 0;
  shortBreakIntervalMs: number = 0;
  longBreakIntervalMs: number = 0;

  bellNameAtEndOfNormalWorking: string = '';
  bellNameAtEndOfFourthWorking: string = '';
  bellNameAtEndOfBreak: string = '';

  timerIconForWorking = '';
  timerIconForBreak = '';

  onTimerFinished: IntervalEventHandler = () => {};
  onTiked: IntervalEventHandler = () => {};
  onStarted: EventHandler = () => {};
  onStopped: StopEventHandler = () => {};

  constructor(config: PomodoroConfig) {
    this.workingIntervalMs = config.workingTimeMs;
    this.shortBreakIntervalMs = config.shortBreakTimeMs;
    this.longBreakIntervalMs = config.longBreakTimeMs;

    this.bellNameAtEndOfNormalWorking = config.bellNameAtEndOfNormalWorking;
    this.bellNameAtEndOfFourthWorking = config.bellNameAtEndOfFourthWorking;
    this.bellNameAtEndOfBreak = config.bellNameAtEndOfBreak;

    this.timerIconForWorking = config.timerIconForWroking;
    this.timerIconForBreak = config.timerIconForBreak;

    this.timerDelayMs = config.delayTimeWhenSwitchTimer * 1000;

    this.reset();

    this.stateMap = new Map<StateName, InnerState>();
    this.stateMap.set('Working', new WorkingState(this));
    this.stateMap.set('Break', new BreakState(this));
  }

  reset(): void {
    this.currentState = 'Break';
    this.cycleCount = 0;
    this.timerIcon = this.timerIconForWorking;
    this.timerId = null;
    this.targetEndTimeMs = 0;
    this.taskDesc = '';
    this.projectName = undefined;
  }

  startInterval(): void {
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

  startTimer(taskName: string, projectName: string | undefined = undefined) {
    if (this.timerId) {
      this.stopTimer();
    }
    this.taskDesc = taskName;
    this.projectName = projectName;

    this.switchTimer();
    this.onStarted(this);
  }

  switchTimer(taskDesc: string | null = null) {
    this.getCurrentState().switch();
    this.getCurrentState().init();

    const intervalMs = this.getIntervalMs();
    this.targetEndTimeMs = new Date().getTime() + intervalMs;

    this.onTiked(this, intervalMs);

    this.startInterval();
  }

  stopTimer(reason: string | undefined = undefined) {
    this.clearInterval();

    const wipTimeMs = this.getCurrentState().getWipTimeMs();

    this.onStopped(this, wipTimeMs, reason);
    this.reset();
  }
}
