import { map, switchMap, tap, Observable, from, catchError } from 'rxjs';
import { VideoService } from './Services/VideoService';

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
        from(fetch(chrome.runtime.getURL('/contentScript.html')))
            .pipe(
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

        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.debug('Getting video page...', watchUrl);
        from(fetch(watchUrl))
            .pipe(
                switchMap((response) => response.text()),
                map((response) => extractDashUrl(response)),
                switchMap((dashUrl: string) => VideoService.downloadAudio$(dashUrl)),
                tap((url) => downloadVideo(url)),
                switchMap((array: ArrayBuffer[]) =>
                    uploadFile$(new File(array, 'audio.mp4', { type: 'video/mp4' }))
                ),
                map((response) => {
                    console.debug('Get transcription: %o', response);
                    alert(response);
                    return response;
                })
            )
            .subscribe();
    }

    function getYtInitialDataFromDOM() {
        const text =
            [...document.getElementsByTagName('script')].find((p) =>
                p.innerHTML.includes('ytInitialData')
            )?.innerHTML ?? '';
        return /window\["ytInitialData"\]\s*=\s*(\{.+\})/.exec(text)?.[1] ?? '';
    }

    function extractDashUrl(html: string): string {
        const videoPageHtml = html;
        const dashUrl = /dashManifestUrl":"(.+?)",/.exec(videoPageHtml)?.[1] ?? '';
        console.debug('Get dashUrl...', dashUrl);
        return dashUrl;
    }

    function uploadFile$(file: File): Observable<string> {
        const formData = new FormData();
        formData.set('file', file, file.name);
        formData.set('model', 'whisper-1');
        formData.set('response_format', 'text');
        formData.set('temperature', '0.4');
        // formData.set('language', 'zh');

        return from(chrome.storage.sync.get('apiKey')).pipe(
            tap((apiKey) => {
                if (!apiKey.apiKey) {
                    throw new Error('API Key is not set');
                }
            }),
            switchMap((apiKey) =>
                fetch('https://api.openai.com/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${apiKey.apiKey}`,
                    },
                    body: formData,
                })
            ),
            switchMap((response) => response.text()),
            catchError((error) => {
                alert(error);
                return '';
            })
        );
    }

    // Download video (for testing)
    function downloadVideo(array: ArrayBuffer[]): void {
        const combinedBlob = new Blob(array, { type: 'video/mp4' });
        const combinedUrl = URL.createObjectURL(combinedBlob);
        const a = document.createElement('a');
        a.href = combinedUrl;
        a.download = 'audio.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(combinedUrl);
    }
})();
