import * as vscode from 'vscode';
import { PomodoroState } from './state';

interface StopTimerTaskDefinition extends vscode.TaskDefinition {
  reason?: string;
}

export class StopTimerTaskProvider implements vscode.TaskProvider {
  static TaskType = 'stopPomodoroTimer';
  private state: PomodoroState;

  constructor(state: PomodoroState) {
    this.state = state;
  }

  public async provideTasks(): Promise<vscode.Task[]> {
    return this.getTasks();
  }
  resolveTask(_task: vscode.Task): vscode.Task {
    const definition: StopTimerTaskDefinition = <any>_task.definition;
    return this.getTask(definition);
  }

  private getTasks(): vscode.Task[] {
    const tasks: vscode.Task[] = [];
    const defaultDefinition: StopTimerTaskDefinition = {
      type: StopTimerTaskProvider.TaskType,
      reason: 'タスク完了',
    };
    tasks.push(this.getTask(defaultDefinition));
    return tasks;
  }

  private getTask(definition: StopTimerTaskDefinition): vscode.Task {
    const task = new vscode.Task(
      definition,
      vscode.TaskScope.Workspace,
      'Start Timer',
      StopTimerTaskProvider.TaskType,
      new vscode.CustomExecution(
        async (
          resolvedDefinition: vscode.TaskDefinition,
        ): Promise<vscode.Pseudoterminal> => {
          return new StopTimerTaskTerminal(
            this.state,
            resolvedDefinition.reason,
          );
        },
      ),
      [],
    );
    task.presentationOptions = {
      echo: true,
      focus: false,
      showReuseMessage: true,
      clear: false,
      close: true,
    };
    return task;
  }
}

class StopTimerTaskTerminal implements vscode.Pseudoterminal {
  private state: PomodoroState;
  private reason: string | undefined = undefined;
  private writeEmitter = new vscode.EventEmitter<string>();
  onDidWrite: vscode.Event<string> = this.writeEmitter.event;
  onDidOverrideDimensions?:
    | vscode.Event<vscode.TerminalDimensions | undefined>
    | undefined;
  private closeEmitter = new vscode.EventEmitter<number>();
  onDidClose?: vscode.Event<number | void> | undefined =
    this.closeEmitter.event;
  onDidChangeName?: vscode.Event<string> | undefined;

  constructor(state: PomodoroState, reason: string | undefined = undefined) {
    this.state = state;
    this.reason = reason;
  }

  open(initialDimensions: vscode.TerminalDimensions | undefined): void {
    this.state.stopTimer(this.reason);
    // this.writeEmitter.fire('in open');
    this.closeEmitter.fire(0);
    this.writeEmitter.dispose();
    this.closeEmitter.dispose();
    this.close();
  }
  close(): void {}
}
