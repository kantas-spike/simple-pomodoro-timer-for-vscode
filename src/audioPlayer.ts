import * as path from 'path';
const sound = require('sound-play');

export class AudioPlayer {
  private baseDir = '';
  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  play(audioFileName: string) {
    const audioPath = this.getAudioDirPath(audioFileName);
    sound.play(audioPath);
  }

  private getAudioDirPath(audioFileName: string) {
    const fileName = path.basename(audioFileName);
    return path.join(this.baseDir, fileName);
  }
}
