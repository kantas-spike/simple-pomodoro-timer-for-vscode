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

export { millisecToHHMM };
