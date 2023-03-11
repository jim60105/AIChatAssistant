import { map, switchMap, from, tap } from 'rxjs';
import { IGenerateAIResponse } from './Models/GenerateAIResponse';
import { ISpeechToTextResponse } from './Models/OpenAIResponse';
import { VideoService } from './Services/VideoService';
import { OpenAIService } from './Services/OpenAIService';
import { YoutubeService } from './Services/YoutubeService';

(async function () {
    const pathname = window.location.pathname;
    if (!pathname.startsWith('/live_chat') && !pathname.startsWith('/watch')) {
        return;
    }

    await OpenAIService.checkApiKey();

    if (pathname.startsWith('/live_chat')) {
        addOpenButton();
        addContainer();
    }

    function addOpenButton() {
        const container = document.getElementById('picker-buttons');

        if (!container) return;

        from(fetch(chrome.runtime.getURL('/contentScript_button.html')))
            .pipe(
                switchMap((response) => response.text()),
                tap((response) => insertHtml(response)),
                tap(() => setupOpenButton())
            )
            .subscribe();
    }

    function insertHtml(html: string): void {
        const container = document.getElementById('picker-buttons');
        if (!container) return;
        container.insertAdjacentHTML('beforeend', html);
    }

    let isOpen = false;
    function setupOpenButton(): void {
        const openButton = document.getElementById(
            'AIChatAssistant_openButton'
        ) as HTMLButtonElement;
        if (!openButton) return;

        openButton.addEventListener('click', () => {
            UIDisplay(!isOpen);
        });
    }

    function UIDisplay(open: boolean): boolean {
        const chat = document.getElementById('chat');
        const container = document.getElementById('AIChatAssistant_container');

        if (!chat || !container) return false;

        container.style.height = open ? '70%' : '0';
        isOpen = open;
        return open;
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
                        ?.addEventListener('click', startMainFunction);
                })
            )
            .subscribe();
    }

    /**
     * Main function
     */
    async function startMainFunction() {
        const audioDuration =
            (document.getElementById('AIChatAssistant_AudioDuration') as HTMLInputElement).value ??
            60;
        YoutubeService.fetchWatchPage$()
            .pipe(
                map((watchPageHtml) => YoutubeService.extractDashUrl(watchPageHtml)),
                switchMap((dashUrl) => VideoService.downloadAudio$(dashUrl, Number(audioDuration))),
                // tap((url) => downloadAudioToLocal(url)),
                switchMap((array) =>
                    OpenAIService.speechToText$(new File(array, 'audio.mp4', { type: 'video/mp4' }))
                ),
                tap((speechToTextResponse) => updateSummary(speechToTextResponse)),
                switchMap((audioResponse) => OpenAIService.generateAIResponse$(audioResponse)),
                tap((res) => showUI(res))
            )
            .subscribe();
    }

    function updateSummary(speechToTextResponse: ISpeechToTextResponse): void {
        const summaryContainer = document.getElementById('AIChatAssistant_summary');
        if (!summaryContainer) return;
        summaryContainer.innerHTML = speechToTextResponse.text;
    }

    function showUI({ summary, responses, stream_language, same_language }: IGenerateAIResponse) {
        const summaryContainer = document.getElementById('AIChatAssistant_summary');
        if (!summaryContainer) return;
        const speechToText = summaryContainer.innerHTML;
        summaryContainer.innerHTML = `${summary} <br><br> ${speechToText}`;

        const responseContainer = document.getElementById('AIChatAssistant_responses');
        if (!responseContainer) return;
        responseContainer.innerHTML = '';

        const fragment = document.createDocumentFragment();
        const userLang = navigator.language;

        responses.forEach((r) => {
            const listItem = document.createElement('a');
            listItem.classList.add('list-group-item', 'list-group-item-action');
            const text = `${r[stream_language]}${same_language ? '' : ` | ${r[userLang]}`}`;
            listItem.textContent = text;
            listItem.addEventListener('click', () => responseClick(r[stream_language]));
            fragment.appendChild(listItem);
        });

        responseContainer.appendChild(fragment);
    }

    function responseClick(text: string) {
        fillResponse(text);
        UIDisplay(false);
    }

    function fillResponse(text: string): void {
        // NOTE: Be careful when refactoring!
        // Youtube uses same id multiple times in the page, so it is necessary to take the element like this
        // And also, the element is not a input element, but a div element!
        const input = document
            .getElementsByTagName('yt-live-chat-text-input-field-renderer')[0]
            ?.querySelector('#input') as HTMLDivElement;

        if (!input) {
            console.warn('Cannot find input element');
            return;
        }

        input.innerText = '';

        // NOTE: Be careful when refactoring!
        // This must be implemented in this way, or else the YouTube emoji (👏 :clap:) won't function properly.
        // While it's highly unlikely that we'll come across GPT using emojis, I believe there are sufficient reasons to retain this hack.
        // This code has been working without issue for months in my other project, so I'm confident it will work here.
        // https://gist.github.com/jim60105/43b2c53bb59fb588e351982c1a14e273#file-youtube-user-js-L169-L191
        const data = new DataTransfer();
        data.setData('text/plain', text);
        input.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, clipboardData: data }));
    }

    /**
     * Download audio (for testing)
     * @param array
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function downloadAudioToLocal(array: ArrayBuffer[]): void {
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
