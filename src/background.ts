// import { lastValueFrom } from 'rxjs';
// import { IMessage } from './Models/Message';
// import { VideoService } from './Services/VideoService';

// addListeners();

// const m3u8Dict: { [key: string]: string[] } = {};
// const videoService = new VideoService();

// function addListeners() {
//     function _addListener<T>(
//         _name: string,
//         callback: (
//             message: IMessage<T>,
//             sender: chrome.runtime.MessageSender,
//             sendResponse: (response?: unknown) => void
//         ) => void
//     ) {
//         chrome.runtime.onMessage.addListener(function (message: IMessage<T>, sender, sendResponse) {
//             if (!message || message.Name !== _name) return;
//             console.debug('Message received from Content Script: %o', message);

//             callback(message, sender, sendResponse);
//             return true;
//         });
//     }

//     _addListener<{ videoId: string; url: string }>(
//         'RecordM3U8Url',
//         async (message, sender, sendResponse) => {
//             sendResponse(RecordM3U8Url(message.Data));
//         }
//     );
//     _addListener<string>('DownloadAudio', async (message, sender, sendResponse) => {
//         const array = await lastValueFrom(DownloadAudio(message.Data));
//         array.forEach((element) => {
//             console.log(element.byteLength);
//         });
//         sendResponse(array);
//     });
// }

// function RecordM3U8Url(Data: { videoId: string; url: string }): void {
//     const array = m3u8Dict[Data.videoId] ?? [];
//     if (array.includes(Data.url)) return;

//     array.push(Data.url);
//     m3u8Dict[Data.videoId] = array.slice(-10);
// }

// function DownloadAudio(videoId: string) {
//     return videoService.downloadAudio(m3u8Dict[videoId]);
// }
