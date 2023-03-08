import { muxjs } from 'muxjs';
import { switchMap, map, from, last, Subject, Observable, concatMap } from 'rxjs';

declare global {
    interface Window {
        muxjs: typeof muxjs;
    }
}

export class VideoService {
    public downloadAudio(m3u8Urls: string[]): Observable<ArrayBuffer[]> {
        const segmentUrls: string[] = [];
        return from(m3u8Urls).pipe(
            switchMap((url) => this.extractSegmentsUrls(url)),
            map((urls) => segmentUrls.push(...urls)),
            last(),
            switchMap(() => this.combineSegmentsToMp4(segmentUrls))
        );
    }

    private async extractSegmentsUrls(m3u8Url: string): Promise<string[]> {
        const m3u8Response = await fetch(m3u8Url);
        const m3u8Text = await m3u8Response.text();

        // Get the last segment url (best quality)
        const url = m3u8Text
            .split('\n')
            .filter((line) => line.trim().length > 0 && !line.startsWith('#'))
            .at(-1);

        if (!url) throw new Error('No segment found in m3u8 file.');

        const response = await fetch(url);
        const text = await response.text();

        return text.split('\n').filter((line) => line.trim().length > 0 && !line.startsWith('#'));
    }

    // Modify from https://github.com/videojs/mux.js#readme
    private combineSegmentsToMp4(segmentUrls: string[]): Observable<ArrayBuffer[]> {
        const totalSegments = segmentUrls.length;
        const sub = new Subject<ArrayBuffer>();
        const result: ArrayBuffer[] = [];
        const result$ = sub.asObservable().pipe(
            map((arrayBuffer) => {
                result.push(arrayBuffer);
                if (result.length === totalSegments) {
                    sub.complete();
                }
                return result;
            })
        );
        if (segmentUrls.length === 0) {
            sub.complete();
            return result$;
        }

        const transmuxer = new window.muxjs.mp4.Transmuxer({
            remux: false,
        });
        // First segment
        transmuxer.on('data', (segment: any) => {
            if (segment.type !== 'audio') return;

            const data = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
            data.set(segment.initSegment, 0);
            data.set(segment.data, segment.initSegment.byteLength);
            // console.log(window.muxjs.mp4.tools.inspect(data));
            sub.next(data);
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        from(fetch(segmentUrls.shift()!))
            .pipe(
                switchMap((response) => from(response.arrayBuffer())),
                map((response) => {
                    transmuxer.push(new Uint8Array(response));
                    transmuxer.flush();
                    transmuxer.off('data');
                    transmuxer.on('data', (segment: any) => {
                        if (segment.type !== 'audio') return;
                        sub.next(segment.data);
                    });
                }),
                switchMap(() => from(segmentUrls)),
                concatMap((url) => fetch(url)),
                switchMap((response) => response.arrayBuffer()),
                map((response) => {
                    transmuxer.push(new Uint8Array(response));
                    transmuxer.flush();
                })
            )
            .subscribe();
        return result$;
    }
}
