import { VideoService } from './Services/VideoService';
import { map, switchMap, tap, Observable, from } from 'rxjs';

(async function () {
    const pathname = window.location.pathname;
    if (!pathname.startsWith('/live_chat') && !pathname.startsWith('/watch')) {
        return;
    }

    // Wait for the page to load
    document.addEventListener('DOMContentLoaded', () => {
        if (pathname.startsWith('/live_chat')) {
            addButton();
        }
    });

    function addButton() {
        const container = document.getElementById('message-buttons');
        if (!container) return;

        document.getElementById('AIChatAssistant_button')?.remove();
        from(chrome.runtime.getURL('/contentScript.html'))
            .pipe(
                switchMap((url) => fetch(url)),
                switchMap((response) => response.text()),
                map((response) => {
                    container.insertAdjacentHTML('afterbegin', response);

                    const AIChatAssistant_button = document.getElementById(
                        'AIChatAssistant_button'
                    ) as HTMLButtonElement;

                    AIChatAssistant_button.addEventListener('click', buttonClick);
                })
            )
            .subscribe();
    }

    async function buttonClick() {
        const videoId = /chat~([^~]+)~/.exec(getYtInitialDataFromDOM())?.[1] ?? '';

        const videoService = new VideoService();
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.debug('Getting video page...', watchUrl);
        from(fetch(watchUrl))
            .pipe(
                switchMap((response) => response.text()),
                map((response) => {
                    const videoPageHtml = response;
                    const m3u8Url =
                        /hlsManifestUrl":"(.*\/file\/index\.m3u8)/.exec(videoPageHtml)?.[1] ?? '';
                    console.debug('Get m3u8...', m3u8Url);
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
    }

    const uploadFile = (file: File): Observable<string> => {
        const formData = new FormData();
        formData.set('file', file, file.name);
        formData.set('model', 'whisper-1');
        formData.set('response_format', 'text');
        formData.set('temperature', '0.4');
        formData.set('language', 'ja');

        return from(chrome.storage.sync.get('apiKey')).pipe(
            switchMap((apiKey) =>
                fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${apiKey.apiKey}`,
                    },
                    body: formData,
                })
            ),
            switchMap((response) => response.text())
        );
    };

    const getYtInitialDataFromDOM = () => {
        const text =
            [...document.getElementsByTagName('script')].find((p) =>
                p.innerHTML.includes('ytInitialData')
            )?.innerHTML ?? '';
        return /window\["ytInitialData"\]\s*=\s*(\{.+\})/.exec(text)?.[1] ?? '';
    };
})();
