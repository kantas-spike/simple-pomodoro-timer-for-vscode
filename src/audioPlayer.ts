import * as path from 'path';
const sound = require('sound-play');

export class AudioPlayer {
  private audioDirname = 'audio';
  private baseDir = '';
  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  play(audioFileName: string) {
    const audioPath = this.getAudioDirPath(audioFileName);
    sound.play(audioPath);
  }

  private getAudioDirPath(audioFileName: string) {
    return path.join(this.baseDir, this.audioDirname, audioFileName);
  }
}
