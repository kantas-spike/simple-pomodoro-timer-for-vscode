import * as vscode from 'vscode';

export class ConfigHelper implements vscode.WorkspaceConfiguration {
  private wc: vscode.WorkspaceConfiguration;
  private valuesToOverwrite: Map<string, any>;

  constructor(
    wc: vscode.WorkspaceConfiguration,
    valuesToOverwrite: Map<string, any>,
  ) {
    this.wc = wc;
    this.valuesToOverwrite = valuesToOverwrite;
  }

  updateValuesToOverwrite(valuesToOverwrite: Map<string, any>) {
    this.valuesToOverwrite.clear();
    for (const [k, v] of valuesToOverwrite.entries()) {
      this.valuesToOverwrite.set(k, v);
    }
  }

  readonly [key: string]: any;
  get<T>(section: string, defaultValue?: unknown): T | undefined {
    if (this.valuesToOverwrite.has(section)) {
      return this.valuesToOverwrite.get(section);
    }
    return this.wc.get(section);
  }
  has(section: string): boolean {
    throw new Error('Method not implemented.');
  }
  inspect<T>(section: string):
    | {
        key: string;
        defaultValue?: T;
        globalValue?: T;
        workspaceValue?: T;
        workspaceFolderValue?: T;
        defaultLanguageValue?: T;
        globalLanguageValue?: T;
        workspaceLanguageValue?: T;
        workspaceFolderLanguageValue?: T;
        languageIds?: string[];
      }
    | undefined {
    throw new Error('Method not implemented.');
  }
  update(
    section: string,
    value: any,
    configurationTarget?: vscode.ConfigurationTarget | boolean | null,
    overrideInLanguage?: boolean,
  ): Thenable<void> {
    throw new Error('Method not implemented.');
  }
}
