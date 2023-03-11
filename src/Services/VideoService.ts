import { switchMap, map, from, Observable, concatMap, range, toArray } from 'rxjs';
import { DashMPD } from '@liveinstantly/dash-mpd-parser';
import { MPD } from 'Mpd';

export class VideoService {
    public static downloadAudio$(dashUrl: string, duration: number): Observable<ArrayBuffer[]> {
        return from(fetch(dashUrl)).pipe(
            switchMap((response) => response.text()),
            map((manifest) => this.extractDashResponse(manifest)),
            switchMap((mpd) => this.extractSegmentsUrls$(mpd, duration)),
            concatMap((url) => fetch(url)),
            switchMap((response) => from(response.arrayBuffer())),
            toArray()
        );
    }

    private static extractDashResponse(manifest: string): MPD {
        const mpd = new DashMPD();
        mpd.parse(manifest);
        return mpd.getJSON() as MPD;
    }

    private static extractSegmentsUrls$(manifest: MPD, duration: number): Observable<string> {
        const representation = manifest.MPD.Period[0].AdaptationSet.filter(
            (p) => p['@mimeType'] === 'audio/mp4'
        )[0].Representation.at(-1);
        if (!representation) throw new Error('No audio found in manifest');

        const baseUrl = representation.BaseURL[0];

        const sqString = representation.SegmentList.SegmentURL.at(-1)?.['@media'] ?? 'sq/0/';
        const currentSeq = Number(/sq\/(\d+)\//.exec(sqString)?.[1]);
        // const earliestSeq = manifest.MPD['@yt:earliestMediaSequence'];

        let lengthEverySegment = Number(/dur\/(\d+(\.\d+)?)/.exec(baseUrl)?.[1]);
        if (!lengthEverySegment || lengthEverySegment === 0) lengthEverySegment = 5;

        const count = Math.ceil(duration / lengthEverySegment); // 60s
        const startSeq = Math.max(currentSeq - count, 0);
        return range(startSeq, currentSeq - startSeq).pipe(map((i) => `${baseUrl}sq/${i}/`));
    }
}
