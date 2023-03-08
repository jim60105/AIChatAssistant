import { VideoService } from './Services/VideoService';
import { map, from, switchMap, tap } from 'rxjs';
import { IYtInitialPlayerResponse } from './Models/YtInitialPlayerResponse';
import { Message } from './Models/Message';

declare global {
    interface Window {
        ytInitialPlayerResponse: IYtInitialPlayerResponse;
    }
}

(async function () {
    const pathname = window.location.pathname;
    if (!pathname.startsWith('/live_chat') && !pathname.startsWith('/watch')) {
        return;
    }

    let ytInitialPlayerResponse: IYtInitialPlayerResponse;

    // Wait for the page to load
    setTimeout(() => {
        // if (pathname.startsWith('/watch')) {
        //     setInterval(() => {
        //         const text =
        //             [...document.getElementsByTagName('script')].find((p) =>
        //                 p.innerHTML.includes('ytInitialPlayerResponse')
        //             )?.innerHTML ?? '';
        //         const jsonString =
        //             /^.*?ytInitialPlayerResponse = (\{".*});var.*/.exec(text)?.[1] ?? '';
        //         ytInitialPlayerResponse = JSON.parse(jsonString);
        //         const videoId = /v=([^&]+)/.exec(window.location.search)?.[1] ?? '';
        //         chrome.runtime.sendMessage(
        //             new Message<{ videoId: string; url: string }>('RecordM3U8Url', {
        //                 videoId,
        //                 url: ytInitialPlayerResponse.streamingData.hlsManifestUrl,
        //             })
        //         );
        //     }, 10000);
        // }

        if (pathname.startsWith('/live_chat')) {
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
                    const videoId = /chat~([^~]+)~/.exec(getYtInitialData())?.[1] ?? '';

                    const videoService = new VideoService();
                    from(fetch(`https://www.youtube.com/watch?v=${videoId}`))
                        .pipe(
                            switchMap((response) => response.text()),
                            map((response) => {
                                console.debug('Getting video page...');
                                const videoPageHtml = response;
                                const m3u8Url =
                                    /hlsManifestUrl":"(.*\/file\/index\.m3u8)/.exec(
                                        videoPageHtml
                                    )?.[1] ?? '';
                                console.debug('Get m3u8: ', m3u8Url);
                                return m3u8Url;
                            }),
                            switchMap((m3u8Url: string) => videoService.downloadAudio([m3u8Url])),
                            tap((array: ArrayBuffer[]) => {
                                // Download segments (just for testing)
                                const combinedBlob = new Blob(array, { type: 'video/mp4' });
                                const combinedUrl = URL.createObjectURL(combinedBlob);
                                const a = document.createElement('a');
                                a.href = combinedUrl;
                                a.download = 'audio.mp4';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(combinedUrl);
                            }),
                            switchMap((array: ArrayBuffer[]) =>
                                uploadFile(new File(array, 'audio.mp4', { type: 'video/mp4' }))
                            ),
                            map((response) => {
                                console.debug('Get transcription: %o', response);
                                alert(response);
                                return response;
                            })
                        )
                        .subscribe();
                });
            });
    }

    const uploadFile = async (file: File): Promise<string> => {
        const apiKey = await chrome.storage.sync.get('apiKey');

        const formData = new FormData();
        formData.set('file', file, file.name);
        formData.set('model', 'whisper-1');
        formData.set('response_format', 'text');
        formData.set('temperature', '0.4');
        formData.set('language', 'ja');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey.apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.status}`);
        }

        return response.text();
    };

    const getYtInitialData = () => {
        const text =
            [...document.getElementsByTagName('script')].find((p) =>
                p.innerHTML.includes('ytInitialData')
            )?.innerHTML ?? '';
        return /window\["ytInitialData"\]\s*=\s*(\{.+\})/.exec(text)?.[1] ?? '';
    };
})();
