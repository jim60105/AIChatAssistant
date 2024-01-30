import { map, switchMap, tap, interval, takeWhile, filter, catchError, of, from } from 'rxjs';
import ISO6391 from 'iso-639-1';
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

        interval(3000)
            .pipe(
                filter(() => parentElementExisted()),
                filter(() => notInSubscribersOnlyMode()),
                takeWhile(() => !openButtonExisted()),
                switchMap(() => from(fetch(chrome.runtime.getURL('/contentScript_button.html')))),
                switchMap((response) => response.text()),
                tap((html) => insertOpenButton(html)),
                tap(() => setupOpenButton())
            )
            .subscribe();
    }

    function parentElementExisted(): boolean {
        return !!document.getElementById('picker-buttons');
    }

    function notInSubscribersOnlyMode(): boolean {
        return !document
            .getElementById('picker-buttons')
            ?.classList.contains('yt-live-chat-restricted-participation-renderer');
    }

    function openButtonExisted() {
        return document.getElementById('AIChatAssistant_openButton');
    }

    function insertOpenButton(html: string): void {
        // Youtube is 💩 that they're reusing the same ID
        const buttons = document.querySelectorAll('#picker-buttons');
        buttons.forEach((b) => b.insertAdjacentHTML('beforeend', html));
    }

    let isOpen = false;
    function setupOpenButton(): void {
        const openButtons = document.querySelectorAll('#AIChatAssistant_openButton');
        if (openButtons.length === 0) return;

        openButtons.forEach((b) =>
            b.addEventListener('click', () => {
                UIDisplay(!isOpen);
            })
        );

        // Close our container when other buttons are clicked
        document
            .querySelectorAll('#picker-buttons')
            ?.forEach((pb) =>
                pb.querySelector('#emoji')?.addEventListener('click', () => UIDisplay(false))
            );
    }

    function UIDisplay(open: boolean): boolean {
        const chat = document.getElementById('chat');
        const container = document.getElementById('AIChatAssistant_container');

        if (!chat || !container) return false;

        if (open) {
            container.classList.add('open');

            // Close emoji panel when our container is opened
            // Actually, it won't change the state in YouTube's code, which means it'll cause state mismatch. But it's fine.
            const emojiContainer = document.getElementById('pickers')?.children;
            if (!emojiContainer) return false;
            for (const item of emojiContainer) {
                item.classList.remove('iron-selected');
            }
        } else {
            container.classList.remove('open');
        }
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
        await OpenAIService.checkApiKey();
        const audioDuration =
            (document.getElementById('AIChatAssistant_AudioDuration') as HTMLInputElement).value ??
            30;
        YoutubeService.fetchWatchPage$()
            .pipe(
                map((watchPageHtml) => YoutubeService.extractDashUrl(watchPageHtml)),
                switchMap((dashUrl) => VideoService.downloadAudio$(dashUrl, Number(audioDuration))),
                // tap((url) => downloadAudioToLocal(url)),
                switchMap((array) =>
                    OpenAIService.speechToText$(new File(array, 'audio.mp4', { type: 'video/mp4' }))
                ),
                tap((speechToText) => updateSummary(speechToText)),
                switchMap((speechToText) => OpenAIService.generateAIResponse$(speechToText)),
                tap((res) => showUI(res)),
                catchError((err) => {
                    console.error(err);
                    alert('【AI Chat Assistant】\n' + err.message);
                    return of(null);
                })
            )
            .subscribe();
    }

    function updateSummary(speechToTextResponse: ISpeechToTextResponse): void {
        const summaryContainer = document.getElementById('AIChatAssistant_summary');
        if (!summaryContainer) return;
        if (!speechToTextResponse.text) {
            console.error('Speech to text failed');
            summaryContainer.innerHTML = 'Speech to text failed! Please try again.';
            throw new Error('Speech to text failed!');
        }
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
            // https://developer.mozilla.org/zh-TW/docs/Web/HTML/Element/template#%E7%A4%BA%E4%BE%8B
            if ('content' in document.createElement('template')) {
                const t = document.querySelector('#responseRow') as HTMLTemplateElement;
                const clone = document.importNode(t.content, true);
                const a = clone.querySelectorAll('a')[0] as HTMLAnchorElement;
                a.textContent = `${r[stream_language]}${same_language ? '' : ` | ${r[userLang]}`}`;
                a.addEventListener('click', () => responseClick(r[stream_language]));

                const b = clone.querySelectorAll('button')[0] as HTMLButtonElement;
                b.addEventListener('click', () => {
                    const utterance = new SpeechSynthesisUtterance(r[stream_language]);
                    utterance.lang = ISO6391.getCode(stream_language);
                    utterance.rate = 0.7;
                    utterance.volume = 0.7;
                    speechSynthesis.speak(utterance);
                });

                const responseBox = document.querySelector(
                    '#AIChatAssistant_responses'
                ) as HTMLDivElement;
                responseBox.appendChild(clone);
            } else {
                // 因為 HTML template 不被支援，所以要用其他方法在表格增加新行
            }
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
