/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'Mpd' {
    export class MPD {
        MPD: MPDClass;
    }

    interface MPDClass {
        '@xmlns:xsi': string;
        '@xmlns': string;
        '@xmlns:yt': string;
        '@xsi:schemaLocation': string;
        '@minBufferTime': string;
        '@profiles': string;
        '@type': string;
        '@availabilityStartTime': Date;
        '@timeShiftBufferDepth': string;
        '@minimumUpdatePeriod': string;
        '@yt:earliestMediaSequence': number;
        '@yt:mpdRequestTime': Date;
        '@yt:mpdResponseTime': Date;
        Period: Period[];
    }

    interface Period {
        '@start': string;
        '@yt:segmentIngestTime': Date;
        SegmentList: PeriodSegmentList;
        AdaptationSet: AdaptationSet[];
    }

    interface AdaptationSet {
        '@id': number;
        '@mimeType': string;
        '@subsegmentAlignment': boolean;
        Role: Role[];
        Representation: Representation[];
    }

    interface Representation {
        '@id': number;
        '@codecs': string;
        '@audioSamplingRate'?: number;
        '@startWithSAP': number;
        '@bandwidth': number;
        AudioChannelConfiguration?: AudioChannelConfiguration[];
        BaseURL: string[];
        SegmentList: RepresentationSegmentList;
        '@width'?: number;
        '@height'?: number;
        '@maxPlayoutRate'?: number;
        '@frameRate'?: number;
    }

    interface AudioChannelConfiguration {
        '@schemeIdUri': string;
        '@value': number;
    }

    interface RepresentationSegmentList {
        SegmentURL: SegmentURL[];
    }

    interface SegmentURL {
        '@media': string;
    }

    interface Role {
        '@schemeIdUri': string;
        '@value': string;
    }

    interface PeriodSegmentList {
        '@presentationTimeOffset': number;
        '@startNumber': number;
        '@timescale': number;
        SegmentTimeline: SegmentTimeline;
    }

    interface SegmentTimeline {
        S: Empty[];
    }

    interface Empty {
        '@d': number;
    }
}