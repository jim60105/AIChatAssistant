/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'muxjs' {
    namespace muxjs {
        namespace mp4 {
            export const tools: any;
            export const generator: any;
            export const probe: any;
            export class Transmuxer {
                flush(): void;
                constructor(initOptions?: any);
                on(event: string, callback: (segment: any) => void): void;
                off(event: string): void;
                push(data: ArrayBuffer): void;
            }
            export const CaptionParser: any;
        }

        namespace flv {
            export const tools: any;
            export const Transmuxer: any;
        }

        namespace mp2t {
            export const tools: any;
            export const CaptionStream: any;
        }

        namespace codecs {
            export const Adts: any;
            export const h264: any;
        }
    }
}
