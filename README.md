# simple-pomodoro-timer

シンプルなポモドーロタイマーです。(参考: [ポモドーロ・テクニック - Wikipedia](https://ja.wikipedia.org/wiki/%E3%83%9D%E3%83%A2%E3%83%89%E3%83%BC%E3%83%AD%E3%83%BB%E3%83%86%E3%82%AF%E3%83%8B%E3%83%83%E3%82%AF))

## install方法

本リポジトリをクローン後、以下を実行してください。

1. vscode extension のパッケージファイル(simple-pomodoro-timer-x.x.x.vsix [^1])の作成

   ```shell
   npm run package
   ```

2. パッケージファイル(simple-pomodoro-timer-x.x.x.vsix [^1]) をインストール

   ```shell
   code --install-extension ./simple-pomodoro-timer-x.x.x.vsix
   ```

3. すでに旧バージョンのパッケージをインストール済みの場合は、本拡張機能を再起動してください。

## Features

### タイマー開始、停止タスク

ポモドーロタイマーの開始タスク、停止タスクを提供します。

| タスク名           | 説明                         |
| ------------------ | ---------------------------- |
| startPomodoroTimer | ポモドーロタイマーの開始する |
| stopPomodoroTimer  | ポモドーロタイマーの開始する |

開始タスクを実行すると、vscodeのステータスバー(デフォルトでは右端)にタイマーが表示され、

1. 作業時間のカウントダウンが始まります。
2. 作業時間が終了するとベルがなり、次は短い休憩時間のカウントダウンが始まります。
3. 1,2のステップを繰り返し、4回目の作業時間が終了したら、次は長い休憩時間のカウントダウンが始まります。
4. 長い休憩時間が終了したら、再び1に戻ります。

停止タスクを実行すると、vscodeのステータスバーのタイマーが停止します。

タスクは、ワークスペースのtasks.jsonにも定義でき、以下の属性を設定できます。

| タスク             | 属性名      | 種別 | 属性の説明                     |
| ------------------ | ----------- | ---- | ------------------------------ |
| startPomodoroTimer | taskName    | 必須 | 達成しようとするタスクの名前   |
|                    | projectName | 任意 | タスクと関連するプロジェクト名 |
| stopPomodoroTimer  | reason      | 必須 | タイマーを停止する理由         |

例えば、[Input variables](https://code.visualstudio.com/docs/editor/variables-reference#_input-variables) を利用して、以下のように定義できます。

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Pomodoro Timer",
      "type": "startPomodoroTimer",
      "taskName": "${input:task_name}",
      "projectName": "${input:project_name}"
    },
    {
      "label": "Stop Pomodoro Timer",
      "type": "stopPomodoroTimer",
      "reason": "${input:stop_reason}"
    }
  ],
  "inputs": [
    {
      "id": "task_name",
      "type": "promptString",
      "description": "タスク名",
      "default": "無題"
    },
    {
      "id": "stop_reason",
      "type": "promptString",
      "description": "タイマー停止の理由",
      "default": "タスク完了"
    },
    {
      "id": "project_name",
      "type": "pickString",
      "description": "プロジェクト名",
      "default": "projectA",
      "options": ["projectA", "projectB", "projectC"]
    }
  ]
}
```

### 通知とログの記録

タイマーの開始と停止時に、通知メッセージが表示されます。

また、[出力]パネルの[Pomodoro Timer]にタイマーの開始、停止時の通知メッセージがログとして記録されます。

## Requirements

カウントダウン終了時のベル音の再生に以下のパッケージを使用しています。

- [sound-play - npm](https://www.npmjs.com/package/sound-play)

## Exxtension Settings

以下の設定項目があります。

| 設定名 ※1                    | 型     | デフォルト値                                                                                       | 説明                                                                                            |
| ---------------------------- | ------ | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| defaultWorkingTime           | number | 25 (分)                                                                                            | 作業時間                                                                                        |
| defaultShortBreakTime        | number | 5 (分)                                                                                             | 短い休憩時間                                                                                    |
| defaultLongBreakTime         | number | 15 (分)                                                                                            | 長い休憩時間                                                                                    |
| audioDir                     | string | null                                                                                               | ベル音の音声ファイルの格納ディレクトリ。nullの場合は拡張機能の`audio`ディレクトリが使用される。 |
| bellNameAtEndOfNormalWorking | string | marimba02.mp3                                                                                      | 作業時間終了のベルファイル名                                                                    |
| bellNameAtEndOfFourthWorking | string | pulse01.mp3                                                                                        | 4回目の作業時間終了のベルファイル名                                                             |
| bellNameAtEndOfBreak         | string | pulse01.mp3                                                                                        | 休憩時間終了のベルファイル名                                                                    |
| timerIconForWorking          | string | 🍅                                                                                                 | 作業時間中のタイマーに表示されるアイコン                                                        |
| timerIconForBreak            | string | 🥔                                                                                                 | 休憩時間中のタイマーに表示されるアイコン                                                        |
| statusbarAlignment           | string | right                                                                                              | タイマーをステータスバーに表示する位置(`left` or `right`)                                       |
| statusbarPriority            | number | -100                                                                                               | タイマーをステータスバーに表示する際の優先度。優先度が高いほど左側に表示される。                |
| delayTimeWhenSwitchTimer     | number | 3 (秒)                                                                                             | カウントダウンが終了してから、次のカウントダウンが始まるまでの待ち時間                          |
| startMessageFormat           | string | @time@ [start] @@projectName@ @taskName@                                                           | タイマー開始時に通知やログに出力するメッセージのフォーマット ※2                                 |
| stopMessageFormat            | string | @time@ [stop ] @@projectName@ @taskName@(@timerIconForWorking@x@cycleCount@ + @wipTime@) @message@ | タイマー開始時に通知やログに出力するメッセージのフォーマット ※2                                 |

- ※1: プレフィックス `simple-pomodoro-timer.` は省略
- ※2: 詳細は [メッセージフォーマット](#メッセージフォーマット)を参照

### メッセージフォーマット

タイマー開始時のメッセージフォーマットに利用できるプレイスフォルダーは以下になります。

| プレイスフォルダー    | 説明                                     |
| --------------------- | ---------------------------------------- |
| @time@                | 現在の年月日時分秒                       |
| @projectName@         | プロジェクト名                           |
| @taskName@            | タスク名                                 |
| @timerIconForWorking@ | 作業時間中のタイマーに表示されるアイコン |
| @timerIconForBreak@   | 休憩時間中のタイマーに表示されるアイコン |

タイマー終了時のメッセージフォーマットに利用できるプレイスフォルダーは以下になります。

| プレイスフォルダー    | 説明                                       |
| --------------------- | ------------------------------------------ |
| @time@                | 現在の年月日時分秒                         |
| @projectName@         | プロジェクト名                             |
| @taskName@            | タスク名                                   |
| @timerIconForWorking@ | 作業時間中のタイマーに表示されるアイコン   |
| @timerIconForBreak@   | 休憩時間中のタイマーに表示されるアイコン   |
| @cycleCount@          | 作業時間が終了した回数                     |
| @wipTime@             | 作業時間中にタイマーを停止した時の作業時間 |
| @message@             | タイマーを停止した理由                     |

## Release Notes

### 0.0.8

READMEを追加。

[^1]: `x.x.x`部分はバージョン番号
