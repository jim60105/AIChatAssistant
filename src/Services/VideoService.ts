export class VideoService {
    async downloadLastMinuteFromM3u8(m3u8Url: string): Promise<void> {
        const segmentUrls = (await this.extractSegmentsUrls(m3u8Url)).slice(-40);

        console.log(`Downloading ${segmentUrls.length} segments...`);
        const segments = await Promise.all(
            segmentUrls.map((url) => fetch(url).then((response) => response.arrayBuffer()))
        );

        console.log(`Downloaded ${segments.length} segments.`);

        const combinedBlob = new Blob(segments, { type: 'video/mp2t' });
        const combinedUrl = URL.createObjectURL(combinedBlob);

        // Download segments (just for testing)
        const a = document.createElement('a');
        a.href = combinedUrl;
        a.download = 'merged-video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(combinedUrl);
    }

    private async extractSegmentsUrls(m3u8Url: string): Promise<string[]> {
        const m3u8Response = await fetch(m3u8Url);
        const m3u8Text = await m3u8Response.text();

        let result: string[] = [];
        const readUrls = m3u8Text
            .split('\n')
            .filter((line) => line.trim().length > 0 && !line.startsWith('#'));

        for (const url of readUrls) {
            if (url.endsWith('.ts')) {
                result.push(url);
            } else if (url.endsWith('.m3u8')) {
                result = result.concat(await this.extractSegmentsUrls(url));
            }
        }
        return result;
    }
}
