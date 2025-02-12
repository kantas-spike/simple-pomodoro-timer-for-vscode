import * as vscode from 'vscode';
import { PomodoroState } from './state';

interface StartTimerTaskDefinition extends vscode.TaskDefinition {
  taskName: string;

  projectName?: string;
}

export class StartTimerTaskProvider implements vscode.TaskProvider {
  static taskSource = 'Pomodoro Timer';
  static taskType = 'startPomodoroTimer';
  static taskName = 'Start Timer';
  private state: PomodoroState;
  private defaultTaskName: string = '@@@@@DUMMY@@@@@';

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
      type: StartTimerTaskProvider.taskType,
      taskName: this.defaultTaskName,
    };
    tasks.push(this.getTask(defaultDefinition));
    return tasks;
  }

  private getTask(definition: StartTimerTaskDefinition): vscode.Task {
    const task = new vscode.Task(
      definition,
      vscode.TaskScope.Workspace,
      StartTimerTaskProvider.taskName,
      StartTimerTaskProvider.taskSource,
      new vscode.CustomExecution(
        async (
          resolvedDefinition: vscode.TaskDefinition,
        ): Promise<vscode.Pseudoterminal> => {
          let taskName: string | undefined = undefined;
          if (resolvedDefinition.taskName === this.defaultTaskName) {
            taskName = await vscode.window.showInputBox({
              placeHolder: 'タスク名を入力してください',
              value: '無題',
              validateInput: (text) => {
                return text.trim().length > 0
                  ? null
                  : 'タスク名には1文字以上を入力してください';
              },
            });
          } else {
            taskName = resolvedDefinition.taskName;
          }
          return new StartTimerTaskTerminal(
            this.state,
            taskName,
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
  private taskName: string | undefined = undefined;
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
    taskName: string | undefined = undefined,
    projectName: string | undefined = undefined,
  ) {
    this.state = state;
    this.taskName = taskName;
    this.projectName = projectName;
  }

  open(initialDimensions: vscode.TerminalDimensions | undefined): void {
    if (!this.taskName) {
      this.dispose();
      return;
    }
    this.state.startTimer(this.taskName || '', this.projectName);
    // this.writeEmitter.fire('in open');
    this.dispose();
    this.close();
  }

  dispose(): void {
    this.closeEmitter.fire(0);
    this.writeEmitter.dispose();
    this.closeEmitter.dispose();
  }

  close(): void {}
}
