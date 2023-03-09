import { IGenerateAIResponse, IResponseViewModel } from './Models/GenerateAIResponse';
import { map, switchMap, Observable, from, tap } from 'rxjs';
import { VideoService } from './Services/VideoService';
import { IAudioResponse, IOpenaiResponse } from './Models/OpenaiResponse';

(async function () {
    const pathname = window.location.pathname;
    if (!pathname.startsWith('/live_chat') && !pathname.startsWith('/watch')) {
        return;
    }

    const apiKey = await chrome.storage.sync.get('apiKey');
    if (!apiKey.apiKey) {
        throw new Error('API Key is not set');
    }

    // Wait for the page to load
    document.addEventListener('DOMContentLoaded', () => {
        if (pathname.startsWith('/live_chat')) {
            addOpenButton();
            addContainer();
        }
    });

    function addOpenButton() {
        const container = document.getElementById('message-buttons');

        if (!container) return;
        document.getElementById('AIChatAssistant_button')?.remove();
        container.insertAdjacentHTML(
            'afterbegin',
            '<button id="AIChatAssistant_openButton">AI</button>'
        );

        const AIChatAssistant_openButton = document.getElementById(
            'AIChatAssistant_openButton'
        ) as HTMLButtonElement;

        AIChatAssistant_openButton.addEventListener('click', openButtonClick);
    }

    let isOpen = false;
    function openButtonClick() {
        const chat = document.getElementById('chat');
        const container = document.getElementById('AIChatAssistant_container');
        if (!chat || !container) return;

        if (!isOpen) {
            container.style.height = '75%';
        } else {
            container.style.height = '0';
        }
        isOpen = !isOpen;
    }

    function addContainer() {
        from(fetch(chrome.runtime.getURL('/contentScript.html')))
            .pipe(
                switchMap((response) => response.text()),
                map((response) => {
                    const chat = document.getElementById('chat');
                    if (chat) chat.insertAdjacentHTML('afterend', response);
                    document
                        .getElementById('AIChatAssistant_startBtn')
                        ?.addEventListener('click', startFunction);
                })
            )
            .subscribe();
    }

    async function startFunction() {
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
                    speechToText$(new File(array, 'audio.mp4', { type: 'video/mp4' }))
                ),
                tap(
                    (audioResponse) =>
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        (document.getElementById('AIChatAssistant_summary')!.innerText =
                            audioResponse.text)
                ),
                switchMap((audioResponse) => generateAIResponse$(audioResponse)),
                tap((responses: IResponseViewModel[]) => {
                    const response_container = document.getElementById('AIChatAssistant_responses');
                    if (!response_container) return;
                    response_container.innerHTML = '';
                    responses.forEach((r) => {
                        const aElement = document.createElement('a');
                        aElement.className = 'list-group-item list-group-item-action';
                        aElement.innerText = `${r.stream_language} | ${r.user_language}`;
                        aElement.addEventListener('click', () => fillResponse(r.stream_language));

                        response_container.appendChild(aElement);
                    });
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

    function speechToText$(file: File): Observable<IAudioResponse> {
        const formData = new FormData();
        formData.set('file', file, file.name);
        formData.set('model', 'whisper-1');
        formData.set('response_format', 'verbose_json');
        formData.set('temperature', '0.4');

        return from(
            fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey.apiKey}`,
                },
                body: formData,
            })
        ).pipe(
            switchMap((response) => response.json()),
            map((response: IAudioResponse) => {
                console.debug(
                    'Get %o transcription: %o',
                    response.language,
                    response.text,
                    response
                );
                return response;
            })
        );
    }

    function generateAIResponse$(audioResponse: IAudioResponse): Observable<IResponseViewModel[]> {
        const browser_language = navigator.language;
        const raw = JSON.stringify({
            model: 'text-davinci-003',
            prompt: `This passage is a speech-to-text input, there may be inaccuracies, so please make your own guesses about the possible near-sounding words. Please use ${browser_language} to summarize the main idea of the passage. And then Generate 5 responses in ${browser_language} and ${audioResponse.language}. The tone should be casual and use popular internet slang as much as possible. Each response should not exceed 30 tokens. The \`original_language\` field is the language of the speech to text input. Responses are strictly required in the following json format! \`\`\` { "original_language": "${audioResponse.language}",  "summary": "這篇文章的總結",   "responses": [     {       "${audioResponse.language}": "これが最初の可能な返信です",       "${browser_language}": "這是第一個可能的回覆"     },     {       "${audioResponse.language}": "問題ない",       "${browser_language}": "沒問題"     },     {       "${audioResponse.language}": "草",       "${browser_language}": "草"     }   ] } \`\`\`  Please read this passage and answer: """${audioResponse.text}"""`,
            temperature: 0.4,
            max_tokens: 2000,
        });

        return from(
            fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: raw,
                redirect: 'follow',
            })
        ).pipe(
            switchMap((response) => response.json()),
            map((response: IOpenaiResponse) => {
                console.debug('Get response: %o', response);
                return JSON.parse(
                    response.choices[0].text?.replaceAll('\n', '').replaceAll('`', '') ?? ''
                );
            }),
            map((response: IGenerateAIResponse) => {
                console.debug('Parse response: %o', response);
                const result = response.responses.map((p) => {
                    return {
                        stream_language: p[audioResponse.language],
                        user_language: p[browser_language],
                    } as IResponseViewModel;
                });
                console.debug('Parse responses to ViewModel: %o', result);
                return result;
            })
        );
    }

    function fillResponse(text: string): void {
        console.debug('Fill response: %o', text);
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
