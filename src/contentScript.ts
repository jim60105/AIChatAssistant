// import { Message } from './Models/Message';
import './contentScript.scss';
import { IYtInitialData } from './Models/YtInitialData';
import { from, map, switchMap } from 'rxjs';
import { ffmpeg } from './transcode';

(async function () {
    if (!window.location.pathname.includes('/live_chat')) {
        return;
    }

    document.addEventListener('DOMContentLoaded', addButton);

    async function addButton() {
        const container = document.getElementById('message-buttons');
        if (!container) return;

        document.getElementById('AIChatAssistant_button')?.remove();
        await fetch(chrome.runtime.getURL('/contentScript.html'))
            .then((response) => response.text())
            .then((response) => {
                container.insertAdjacentHTML('afterbegin', response);
            });

        const AIChatAssistant_button = document.getElementById(
            'AIChatAssistant_button'
        ) as HTMLButtonElement;

        AIChatAssistant_button.addEventListener('click', () => {
            const text = [...document.getElementsByTagName('script')].filter((p) =>
                p.innerHTML.includes('ytInitialData')
            )[0].innerHTML;
            const jsonString = /window\["ytInitialData"\]\s*=\s*(\{.+\})/.exec(text)?.[1] ?? '';
            const ytInitialData: IYtInitialData = JSON.parse(jsonString);

            const topic =
                ytInitialData.continuationContents.liveChatContinuation.continuations[0]
                    .invalidationContinuationData.invalidationId.topic;
            const videoId = /chat~([^~]+)~/.exec(topic)?.[1] ?? '';

            from(fetch(`https://www.youtube.com/watch?v=${videoId}`))
                .pipe(
                    switchMap((response) => response.text()),
                    map((response) => {
                        console.log('Get video page');
                        const videoPageHtml = response;
                        const m3u8Url = /([^"]+?\.m3u8)"/.exec(videoPageHtml)?.[1] ?? '';
                        console.log(m3u8Url);
                        return m3u8Url;
                    }),
                    switchMap((m3u8Url: string) =>
                        from(new ffmpeg().downloadLastMinuteFromM3u8(m3u8Url))
                    )
                )
                .subscribe();
            // chrome.runtime.sendMessage(new Message('click', videoId));
        });
    }
})();
