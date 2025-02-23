import * as path from 'path';

const MIN = 60 * 1000;

function dateToYYYYMMDDhhmmss(date: Date) {
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

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

type NotificationMessageSupportedKey =
  | '@time@'
  | '@taskName@'
  | '@projectName@'
  | '@cycleCount@'
  | '@wipTime@'
  | '@timerIconForWorking@'
  | '@timerIconForBreak@'
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
    // console.log(result, k, v);
    result = result.replace(k, v || '');
  }
  return result;
}

export { millisecToHHMM, getNotificationMessage, dateToYYYYMMDDhhmmss };
