import * as path from 'path';

const MIN = 60 * 1000;

function millisecToHHMM(ms: number | null): string {
  if (ms === null) {
    return '--:--';
  } else if (ms <= 0) {
    return '00:00';
  }
  const min = String(Math.floor(ms / MIN));
  const sec = String(Math.floor((ms % MIN) / 1000));
  return `${min.padStart(2, '0')}:${sec.padStart(2, '0')}`;
}

function taskNameFromTodoLineText(lineText: string): string {
  const trimedText = lineText.trim();
  const regex = /^([-\+\*]|\d+\.)\s*(\[\s*\])\s*(.+)$/;
  if (trimedText.match(regex)) {
    return trimedText.replace(regex, '$1 $3');
  } else {
    return trimedText;
  }
}

function taskNameFromTitleLineText(lineText: string): string {
  const trimedText = lineText.trim();
  /* ex) title = 'コマンド改善' */
  const regex = /^\s*title\s*=\s*['"](.+)['"]\s*$/;
  if (trimedText.match(regex)) {
    return trimedText.replace(regex, '$1');
  } else {
    return trimedText;
  }
}

type NotificationMessageSupportedKey =
  | '@time@'
  | '@taskName@'
  | '@projectName@'
  | '@message@';
type NotificationMessageKV = {
  [key in NotificationMessageSupportedKey]: string | undefined;
};

function getNotificationMessage(
  formatString: string,
  obj: NotificationMessageKV,
) {
  /*
  @time@: 時刻
  @taskName@: タスク名
  @projectName@: プロジェクト名
  @message@: 通知メッセージ
   */
  let result = formatString;
  for (const [k, v] of Object.entries(obj)) {
    console.log(result, k, v);
    result = result.replace(k, v || '');
  }
  return result;
}

export {
  millisecToHHMM,
  taskNameFromTodoLineText,
  taskNameFromTitleLineText,
  getNotificationMessage,
};
