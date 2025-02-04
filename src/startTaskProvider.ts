import * as vscode from 'vscode';
import { PomodoroState } from './state';

interface StartTimerTaskDefinition extends vscode.TaskDefinition {
  taskName: string;

  projectName?: string;
}

export class StartTimerTaskProvider implements vscode.TaskProvider {
  static TaskType = 'startPomodoroTimer';
  private state: PomodoroState;

  constructor(state: PomodoroState) {
    this.state = state;
  }

  public async provideTasks(): Promise<vscode.Task[]> {
    return this.getTasks();
  }
  resolveTask(_task: vscode.Task): vscode.Task {
    const definition: StartTimerTaskDefinition = <any>_task.definition;
    return this.getTask(definition);
  }

  private getTasks(): vscode.Task[] {
    const tasks: vscode.Task[] = [];
    const defaultDefinition: StartTimerTaskDefinition = {
      type: StartTimerTaskProvider.TaskType,
      taskName: 'タスク名',
    };
    tasks.push(this.getTask(defaultDefinition));
    return tasks;
  }

  private getTask(definition: StartTimerTaskDefinition): vscode.Task {
    const task = new vscode.Task(
      definition,
      vscode.TaskScope.Workspace,
      'Start Timer',
      StartTimerTaskProvider.TaskType,
      new vscode.CustomExecution(
        async (
          resolvedDefinition: vscode.TaskDefinition,
        ): Promise<vscode.Pseudoterminal> => {
          return new StartTimerTaskTerminal(
            this.state,
            resolvedDefinition.taskName,
            resolvedDefinition.projectName,
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

class StartTimerTaskTerminal implements vscode.Pseudoterminal {
  private state: PomodoroState;
  private taskName: string = '';
  private projectName: string | undefined = undefined;
  private writeEmitter = new vscode.EventEmitter<string>();
  onDidWrite: vscode.Event<string> = this.writeEmitter.event;
  onDidOverrideDimensions?:
    | vscode.Event<vscode.TerminalDimensions | undefined>
    | undefined;
  private closeEmitter = new vscode.EventEmitter<number>();
  onDidClose?: vscode.Event<number | void> | undefined =
    this.closeEmitter.event;
  onDidChangeName?: vscode.Event<string> | undefined;

  constructor(
    state: PomodoroState,
    taskName: string,
    projectName: string | undefined = undefined,
  ) {
    this.state = state;
    this.taskName = taskName;
    this.projectName = projectName;
  }

  open(initialDimensions: vscode.TerminalDimensions | undefined): void {
    this.state.startTimer(this.taskName, this.projectName);
    // this.writeEmitter.fire('in open');
    this.closeEmitter.fire(0);
    this.writeEmitter.dispose();
    this.closeEmitter.dispose();
    this.close();
  }
  close(): void {}
}
