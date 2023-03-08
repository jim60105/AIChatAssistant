export interface IYtInitialPlayerResponse {
    responseContext: ResponseContext;
    playabilityStatus: PlayabilityStatus;
    streamingData: StreamingData;
    heartbeatParams: HeartbeatParams;
    playbackTracking: PlaybackTracking;
    videoDetails: VideoDetails;
    playerConfig: PlayerConfig;
    storyboards: Storyboards;
    microformat: Microformat;
    cards: Cards;
    trackingParams: string;
    attestation: Attestation;
    messages: Message[];
    frameworkUpdates: FrameworkUpdates;
}

interface Attestation {
    playerAttestationRenderer: PlayerAttestationRenderer;
}

interface PlayerAttestationRenderer {
    challenge: string;
    botguardData: BotguardData;
}

interface BotguardData {
    program: string;
    interpreterSafeUrl: InterpreterSafeURL;
    serverEnvironment: number;
}

interface InterpreterSafeURL {
    privateDoNotAccessOrElseTrustedResourceUrlWrappedValue: string;
}

interface Cards {
    cardCollectionRenderer: CardCollectionRenderer;
}

interface CardCollectionRenderer {
    cards: Card[];
    icon: CloseButton;
    closeButton: CloseButton;
    trackingParams: string;
    allowTeaserDismiss: boolean;
    logIconVisibilityUpdates: boolean;
}

interface Card {
    cardRenderer: CardRenderer;
}

interface CardRenderer {
    teaser: Teaser;
    cueRanges: CueRange[];
    trackingParams: string;
}

interface CueRange {
    startCardActiveMs: string;
    endCardActiveMs: string;
    teaserDurationMs: string;
    iconAfterTeaserMs: string;
}

interface Teaser {
    simpleCardTeaserRenderer: SimpleCardTeaserRenderer;
}

interface SimpleCardTeaserRenderer {
    message: Description;
    trackingParams: string;
    prominent: boolean;
    logVisibilityUpdates: boolean;
    onTapCommand: OnTapCommand;
}

interface Description {
    simpleText: string;
}

interface OnTapCommand {
    clickTrackingParams: string;
    changeEngagementPanelVisibilityAction: ChangeEngagementPanelVisibilityAction;
}

interface ChangeEngagementPanelVisibilityAction {
    targetId: string;
    visibility: string;
}

interface CloseButton {
    infoCardIconRenderer: InfoCardIconRenderer;
}

interface InfoCardIconRenderer {
    trackingParams: string;
}

interface FrameworkUpdates {
    entityBatchUpdate: EntityBatchUpdate;
}

interface EntityBatchUpdate {
    mutations: any[];
    timestamp: Timestamp;
}

interface Timestamp {
    seconds: string;
    nanos: number;
}

interface HeartbeatParams {
    intervalMilliseconds: string;
    softFailOnError: boolean;
    heartbeatServerData: string;
}

interface Message {
    mealbarPromoRenderer: MealbarPromoRenderer;
}

interface MealbarPromoRenderer {
    messageTexts: MessageTitle[];
    actionButton: ActionButton;
    dismissButton: DismissButton;
    triggerCondition: string;
    style: string;
    trackingParams: string;
    impressionEndpoints: ImpressionEndpoint[];
    isVisible: boolean;
    messageTitle: MessageTitle;
    enableSharedFeatureForImpressionHandling: boolean;
}

interface ActionButton {
    buttonRenderer: ActionButtonButtonRenderer;
}

interface ActionButtonButtonRenderer {
    style: string;
    size: string;
    text: MessageTitle;
    trackingParams: string;
    command: PurpleCommand;
}

interface PurpleCommand {
    clickTrackingParams: string;
    commandExecutorCommand: PurpleCommandExecutorCommand;
}

interface PurpleCommandExecutorCommand {
    commands: CommandElement[];
}

interface CommandElement {
    clickTrackingParams?: string;
    commandMetadata: PurpleCommandMetadata;
    browseEndpoint?: BrowseEndpoint;
    feedbackEndpoint?: FeedbackEndpoint;
}

interface BrowseEndpoint {
    browseId: string;
    params: string;
}

interface PurpleCommandMetadata {
    webCommandMetadata: PurpleWebCommandMetadata;
}

interface PurpleWebCommandMetadata {
    url?: string;
    webPageType?: string;
    rootVe?: number;
    apiUrl: string;
    sendPost?: boolean;
}

interface FeedbackEndpoint {
    feedbackToken: string;
    uiActions: UIActions;
}

interface UIActions {
    hideEnclosingContainer: boolean;
}

interface MessageTitle {
    runs: Run[];
}

interface Run {
    text: string;
}

interface DismissButton {
    buttonRenderer: DismissButtonButtonRenderer;
}

interface DismissButtonButtonRenderer {
    style: string;
    size: string;
    text: MessageTitle;
    trackingParams: string;
    command: FluffyCommand;
}

interface FluffyCommand {
    clickTrackingParams: string;
    commandExecutorCommand: FluffyCommandExecutorCommand;
}

interface FluffyCommandExecutorCommand {
    commands: ImpressionEndpoint[];
}

interface ImpressionEndpoint {
    clickTrackingParams: string;
    commandMetadata: ImpressionEndpointCommandMetadata;
    feedbackEndpoint: FeedbackEndpoint;
}

interface ImpressionEndpointCommandMetadata {
    webCommandMetadata: FluffyWebCommandMetadata;
}

interface FluffyWebCommandMetadata {
    sendPost: boolean;
    apiUrl: string;
}

interface Microformat {
    playerMicroformatRenderer: PlayerMicroformatRenderer;
}

interface PlayerMicroformatRenderer {
    thumbnail: PlayerMicroformatRendererThumbnail;
    embed: Embed;
    title: Description;
    description: Description;
    lengthSeconds: string;
    ownerProfileUrl: string;
    externalChannelId: string;
    isFamilySafe: boolean;
    availableCountries: string[];
    isUnlisted: boolean;
    hasYpcMetadata: boolean;
    viewCount: string;
    category: string;
    publishDate: Date;
    ownerChannelName: string;
    liveBroadcastDetails: LiveBroadcastDetails;
    uploadDate: Date;
}

interface Embed {
    iframeUrl: string;
    flashUrl: string;
    width: number;
    height: number;
    flashSecureUrl: string;
}

interface LiveBroadcastDetails {
    isLiveNow: boolean;
    startTimestamp: Date;
}

interface PlayerMicroformatRendererThumbnail {
    thumbnails: ThumbnailElement[];
}

interface ThumbnailElement {
    url: string;
    width: number;
    height: number;
}

interface PlayabilityStatus {
    status: string;
    playableInEmbed: boolean;
    liveStreamability: LiveStreamability;
    miniplayer: Miniplayer;
    contextParams: string;
}

interface LiveStreamability {
    liveStreamabilityRenderer: LiveStreamabilityRenderer;
}

interface LiveStreamabilityRenderer {
    videoId: string;
    broadcastId: string;
    pollDelayMs: string;
}

interface Miniplayer {
    miniplayerRenderer: MiniplayerRenderer;
}

interface MiniplayerRenderer {
    playbackMode: string;
}

interface PlaybackTracking {
    videostatsPlaybackUrl: PtrackingURLClass;
    videostatsDelayplayUrl: AtrURLClass;
    videostatsWatchtimeUrl: PtrackingURLClass;
    ptrackingUrl: PtrackingURLClass;
    qoeUrl: PtrackingURLClass;
    atrUrl: AtrURLClass;
    videostatsScheduledFlushWalltimeSeconds: number[];
    videostatsDefaultFlushIntervalSeconds: number;
    youtubeRemarketingUrl: AtrURLClass;
}

interface AtrURLClass {
    baseUrl: string;
    elapsedMediaTimeSeconds: number;
}

interface PtrackingURLClass {
    baseUrl: string;
}

interface PlayerConfig {
    audioConfig: AudioConfig;
    streamSelectionConfig: StreamSelectionConfig;
    livePlayerConfig: LivePlayerConfig;
    mediaCommonConfig: MediaCommonConfig;
    webPlayerConfig: WebPlayerConfig;
}

interface AudioConfig {
    enablePerFormatLoudness: boolean;
}

interface LivePlayerConfig {
    liveReadaheadSeconds: number;
    isLiveHeadPlayable: boolean;
}

interface MediaCommonConfig {
    dynamicReadaheadConfig: DynamicReadaheadConfig;
}

interface DynamicReadaheadConfig {
    maxReadAheadMediaTimeMs: number;
    minReadAheadMediaTimeMs: number;
    readAheadGrowthRateMs: number;
}

interface StreamSelectionConfig {
    maxBitrate: string;
}

interface WebPlayerConfig {
    useCobaltTvosDash: boolean;
    webPlayerActionsPorting: WebPlayerActionsPorting;
}

interface WebPlayerActionsPorting {
    getSharePanelCommand: GetSharePanelCommand;
    subscribeCommand: SubscribeCommand;
    unsubscribeCommand: UnsubscribeCommand;
    addToWatchLaterCommand: AddToWatchLaterCommand;
    removeFromWatchLaterCommand: RemoveFromWatchLaterCommand;
}

interface AddToWatchLaterCommand {
    clickTrackingParams: string;
    commandMetadata: ImpressionEndpointCommandMetadata;
    playlistEditEndpoint: AddToWatchLaterCommandPlaylistEditEndpoint;
}

interface AddToWatchLaterCommandPlaylistEditEndpoint {
    playlistId: string;
    actions: PurpleAction[];
}

interface PurpleAction {
    addedVideoId: string;
    action: string;
}

interface GetSharePanelCommand {
    clickTrackingParams: string;
    commandMetadata: ImpressionEndpointCommandMetadata;
    webPlayerShareEntityServiceEndpoint: WebPlayerShareEntityServiceEndpoint;
}

interface WebPlayerShareEntityServiceEndpoint {
    serializedShareEntity: string;
}

interface RemoveFromWatchLaterCommand {
    clickTrackingParams: string;
    commandMetadata: ImpressionEndpointCommandMetadata;
    playlistEditEndpoint: RemoveFromWatchLaterCommandPlaylistEditEndpoint;
}

interface RemoveFromWatchLaterCommandPlaylistEditEndpoint {
    playlistId: string;
    actions: FluffyAction[];
}

interface FluffyAction {
    action: string;
    removedVideoId: string;
}

interface SubscribeCommand {
    clickTrackingParams: string;
    commandMetadata: ImpressionEndpointCommandMetadata;
    subscribeEndpoint: SubscribeEndpoint;
}

interface SubscribeEndpoint {
    channelIds: string[];
    params: string;
}

interface UnsubscribeCommand {
    clickTrackingParams: string;
    commandMetadata: ImpressionEndpointCommandMetadata;
    unsubscribeEndpoint: SubscribeEndpoint;
}

interface ResponseContext {
    serviceTrackingParams: ServiceTrackingParam[];
    mainAppWebResponseContext: MainAppWebResponseContext;
    webResponseContextExtensionData: WebResponseContextExtensionData;
}

interface MainAppWebResponseContext {
    datasyncId: string;
    loggedOut: boolean;
}

interface ServiceTrackingParam {
    service: string;
    params: Param[];
}

interface Param {
    key: string;
    value: string;
}

interface WebResponseContextExtensionData {
    hasDecorated: boolean;
}

interface Storyboards {
    playerLiveStoryboardSpecRenderer: PlayerLiveStoryboardSpecRenderer;
}

interface PlayerLiveStoryboardSpecRenderer {
    spec: string;
}

interface StreamingData {
    expiresInSeconds: string;
    adaptiveFormats: AdaptiveFormat[];
    dashManifestUrl: string;
    hlsManifestUrl: string;
}

interface AdaptiveFormat {
    itag: number;
    url: string;
    mimeType: string;
    bitrate: number;
    width?: number;
    height?: number;
    quality: string;
    fps?: number;
    qualityLabel?: string;
    projectionType: ProjectionType;
    targetDurationSec: number;
    maxDvrDurationSec: number;
    highReplication?: boolean;
    audioQuality?: string;
    audioSampleRate?: string;
    audioChannels?: number;
}

enum ProjectionType {
    Rectangular = 'RECTANGULAR',
}

interface VideoDetails {
    videoId: string;
    title: string;
    lengthSeconds: string;
    isLive: boolean;
    keywords: string[];
    channelId: string;
    isOwnerViewing: boolean;
    shortDescription: string;
    isCrawlable: boolean;
    isLiveDvrEnabled: boolean;
    thumbnail: PlayerMicroformatRendererThumbnail;
    liveChunkReadahead: number;
    allowRatings: boolean;
    viewCount: string;
    author: string;
    isLowLatencyLiveStream: boolean;
    isPrivate: boolean;
    isUnpluggedCorpus: boolean;
    latencyClass: string;
    isLiveContent: boolean;
}
