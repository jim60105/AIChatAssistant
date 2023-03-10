import { from, Observable, switchMap } from 'rxjs';

export class YoutubeService {
    public static fetchWatchPage$(): Observable<string> {
        const videoId = /chat~([^~]+)~/.exec(this.getYtInitialDataFromDOM())?.[1] ?? '';

        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        console.debug('Getting video page...', watchUrl);

        return from(fetch(watchUrl)).pipe(switchMap((response) => response.text()));
    }

    public static getYtInitialDataFromDOM() {
        const text =
            [...document.getElementsByTagName('script')].find((p) =>
                p.innerHTML.includes('ytInitialData')
            )?.innerHTML ?? '';
        return /window\["ytInitialData"\]\s*=\s*(\{.+\})/.exec(text)?.[1] ?? '';
    }

    public static extractDashUrl(html: string): string {
        const videoPageHtml = html;
        const dashUrl = /dashManifestUrl":"(.+?)",/.exec(videoPageHtml)?.[1] ?? '';
        console.debug('Get dashUrl...', dashUrl);
        return dashUrl;
    }
}
