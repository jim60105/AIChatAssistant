/* eslint-disable @typescript-eslint/no-explicit-any */
declare const FFmpeg: any;

export class ffmpeg {
    private _ffmpeg: any;
    constructor() {
        const { createFFmpeg } = FFmpeg;
        this._ffmpeg = createFFmpeg({
            log: true,
            corePath: chrome.runtime.getURL('assets/ffmpeg/ffmpeg-core.js'),
            wasmPath: chrome.runtime.getURL('assets/ffmpeg/ffmpeg-core.wasm'),
            workerPath: chrome.runtime.getURL('assets/ffmpeg/ffmpeg-core.worker.js'),
        });
    }

    async downloadLastMinuteFromM3u8(m3u8Url: string) {
        if (!this._ffmpeg.isLoaded()) {
            await this._ffmpeg.load();
        }
        await this._ffmpeg.run(
            '-i',
            m3u8Url,
            '-map',
            '0:a:0',
            '-c',
            'copy',
            '-f',
            'segment',
            '-segment_time',
            '60',
            'audio.mp4'
        );
    }
}
