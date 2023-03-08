import { VideoService } from './Services/VideoService';
import { map, from, switchMap } from 'rxjs';
import { IYtInitialData } from './Models/YtInitialData';
import { IYtInitialPlayerResponse } from './Models/YtInitialPlayerResponse';

declare global {
    interface Window {
        ytInitialData: IYtInitialData;
        ytInitialPlayerResponse: IYtInitialPlayerResponse;
    }
}

(async function () {
    const pathname = window.location.pathname;
    if (!pathname.startsWith('/live_chat') && !pathname.startsWith('/watch')) {
        return;
    }

    let ytInitialData: IYtInitialData;
    let ytInitialPlayerResponse: IYtInitialPlayerResponse;

    // Wait for the page to load
    setTimeout(() => {
        if (pathname.startsWith('/watch')) {
            // setInterval(() => {
            //     const text =
            //         [...document.getElementsByTagName('script')].find((p) =>
            //             p.innerHTML.includes('ytInitialPlayerResponse')
            //         )?.innerHTML ?? '';
            //     const jsonString =
            //         /^.*?ytInitialPlayerResponse = (\{".*});var.*/.exec(text)?.[1] ?? '';
            //     ytInitialPlayerResponse = JSON.parse(jsonString);
            //     const videoId = /v=([^&]+)/.exec(window.location.search)?.[1] ?? '';
            //     chrome.runtime.sendMessage(
            //         new Message<{ videoId: string; url: string }>('RecordM3U8Url', {
            //             videoId,
            //             url: ytInitialPlayerResponse.streamingData.hlsManifestUrl,
            //         })
            //     );
            // }, 10000);
        }

        if (pathname.startsWith('/live_chat')) {
            const text =
                [...document.getElementsByTagName('script')].find((p) =>
                    p.innerHTML.includes('ytInitialData')
                )?.innerHTML ?? '';
            const jsonString = /window\["ytInitialData"\]\s*=\s*(\{.+\})/.exec(text)?.[1] ?? '';
            ytInitialData = JSON.parse(jsonString);

            addButton();
        }
    }, 1000);

    function addButton() {
        const container = document.getElementById('message-buttons');
        if (!container) return;

        document.getElementById('AIChatAssistant_button')?.remove();
        fetch(chrome.runtime.getURL('/contentScript.html'))
            .then((response) => response.text())
            .then((response) => {
                container.insertAdjacentHTML('afterbegin', response);

                const AIChatAssistant_button = document.getElementById(
                    'AIChatAssistant_button'
                ) as HTMLButtonElement;

                AIChatAssistant_button.addEventListener('click', async () => {
                    const topic =
                        ytInitialData.continuationContents.liveChatContinuation.continuations[0]
                            .invalidationContinuationData.invalidationId.topic;
                    const videoId = /chat~([^~]+)~/.exec(topic)?.[1] ?? '';

                    const videoService = new VideoService();
                    from(fetch(`https://www.youtube.com/watch?v=${videoId}`))
                        .pipe(
                            switchMap((response) => response.text()),
                            map((response) => {
                                console.debug('Getting video page...');
                                const videoPageHtml = response;
                                const m3u8Url = /([^"]+?\.m3u8)"/.exec(videoPageHtml)?.[1] ?? '';
                                console.debug('Get m3u8: ', m3u8Url);
                                return m3u8Url;
                            }),
                            switchMap((m3u8Url: string) => videoService.downloadAudio([m3u8Url]))
                        )
                        .subscribe((array) => {
                            const combinedBlob = new Blob(array, { type: 'video/mp4' });
                            const combinedUrl = URL.createObjectURL(combinedBlob);
                            // Download segments (just for testing)
                            const a = document.createElement('a');
                            a.href = combinedUrl;
                            a.download = 'merged-video.mp4';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(combinedUrl);
                        });
                });
            });
    }
})();
