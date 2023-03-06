import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
const ffmpeg = createFFmpeg({
    log: true,
    corePath: chrome.runtime.getURL('vendor/ffmpeg-core.js'),
});

const transcode = async (file: File) => {
    const name = 'video';
    if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
    }

    ffmpeg.FS('writeFile', name, await fetchFile(file));
    await ffmpeg.run('-i', name, 'output.mp4');
    const data = ffmpeg.FS('readFile', 'output.mp4');
};
