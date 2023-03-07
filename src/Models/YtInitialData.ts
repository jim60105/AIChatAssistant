export interface IYtInitialData {
    responseContext: ResponseContext;
    continuationContents: ContinuationContents;
    trackingParams: string;
}

interface ContinuationContents {
    liveChatContinuation: LiveChatContinuation;
}

interface LiveChatContinuation {
    continuations: ContinuationElement[];
    actions: LiveChatContinuationAction[];
    actionPanel: ActionPanel;
    itemList: ItemList;
    header: LiveChatContinuationHeader;
    ticker: Ticker;
    trackingParams: string;
    participantsList: ParticipantsList;
    popoutMessage: PopoutMessage;
    emojis: Emoji[];
    clientMessages: ClientMessages;
    viewerName: string;
}

interface ActionPanel {
    liveChatMessageInputRenderer: LiveChatMessageInputRenderer;
}

interface LiveChatMessageInputRenderer {
    authorName: AuthorName;
    inputField: InputField;
    sendButton: SendButton;
    pickers: Picker[];
    pickerButtons: PickerButton[];
    authorPhoto: AuthorPhoto;
    targetId: string;
}

interface AuthorName {
    simpleText: string;
}

interface AuthorPhoto {
    thumbnails: AuthorPhotoThumbnail[];
}

interface AuthorPhotoThumbnail {
    url: string;
    width: number;
    height: number;
}

interface InputField {
    liveChatTextInputFieldRenderer: LiveChatTextInputFieldRenderer;
}

interface LiveChatTextInputFieldRenderer {
    placeholder: FatalError;
    maxCharacterLimit: number;
    emojiCharacterCount: number;
    unselectedPlaceholder: FatalError;
}

interface FatalError {
    runs: Run[];
}

interface Run {
    text: string;
}

interface PickerButton {
    liveChatIconToggleButtonRenderer: LiveChatIconToggleButtonRenderer;
}

interface LiveChatIconToggleButtonRenderer {
    targetId: string;
    icon: Icon;
    tooltip: string;
    accessibility: ContextMenuAccessibilityClass;
    toggledIcon?: Icon;
    trackingParams: string;
}

interface ContextMenuAccessibilityClass {
    accessibilityData: AccessibilityAccessibility;
}

interface AccessibilityAccessibility {
    label: string;
}

interface Icon {
    iconType: string;
}

interface Picker {
    emojiPickerRenderer?: EmojiPickerRenderer;
    liveChatProductPickerRenderer?: LiveChatProductPickerRenderer;
}

interface EmojiPickerRenderer {
    id: string;
    categories: Category[];
    categoryButtons: CategoryButton[];
    searchPlaceholderText: FatalError;
    searchNoResultsText: FatalError;
    pickSkinToneText: FatalError;
    trackingParams: string;
    clearSearchLabel: string;
    skinToneGenericLabel: string;
    skinToneLightLabel: string;
    skinToneMediumLightLabel: string;
    skinToneMediumLabel: string;
    skinToneMediumDarkLabel: string;
    skinToneDarkLabel: string;
}

interface Category {
    emojiPickerCategoryRenderer: EmojiPickerCategoryRenderer;
}

interface EmojiPickerCategoryRenderer {
    categoryId: string;
    title: AuthorName;
    emojiIds?: string[];
    trackingParams: string;
    categoryType?: string;
    emojiData?: EmojiDatum[];
    imageLoadingLazy?: boolean;
    usePngImages?: boolean;
}

interface EmojiDatum {
    emojiId: string;
    variantIds?: string[];
    multiSelectorThumbnailRow?: MultiSelectorThumbnailRow[];
}

interface MultiSelectorThumbnailRow {
    thumbnails: MultiSelectorThumbnailRowThumbnail[];
}

interface MultiSelectorThumbnailRowThumbnail {
    thumbnails: PopoutLiveChatEndpoint[];
}

interface PopoutLiveChatEndpoint {
    url: string;
}

interface CategoryButton {
    emojiPickerCategoryButtonRenderer: EmojiPickerCategoryButtonRenderer;
}

interface EmojiPickerCategoryButtonRenderer {
    categoryId: string;
    icon: Icon;
    tooltip: string;
    accessibility: ContextMenuAccessibilityClass;
    targetId?: string;
}

interface LiveChatProductPickerRenderer {
    id: string;
    buttons: ButtonElement[];
    closeButton: CloseButton;
    trackingParams: string;
    productPickerHeaderTitle: FatalError;
}

interface ButtonElement {
    liveChatProductButtonRenderer: LiveChatProductButtonRenderer;
}

interface LiveChatProductButtonRenderer {
    text: FatalError;
    subtext: FatalError;
    icon: Icon;
    command: Command;
    trackingParams: string;
}

interface Command {
    clickTrackingParams: string;
    commandMetadata: CommandCommandMetadata;
    openSuperStickerBuyFlowCommand?: LiveChatItemContextMenuEndpoint;
    liveChatPurchaseMessageEndpoint?: LiveChatItemContextMenuEndpoint;
}

interface CommandCommandMetadata {
    webCommandMetadata: PurpleWebCommandMetadata;
}

interface PurpleWebCommandMetadata {
    ignoreNavigation: boolean;
}

interface LiveChatItemContextMenuEndpoint {
    params: string;
}

interface CloseButton {
    liveChatProductButtonRenderer: Renderer;
}

interface Renderer {
    text: FatalError;
    icon: Icon;
    trackingParams: string;
    navigationEndpoint?: LiveChatProductButtonRendererNavigationEndpoint;
    serviceEndpoint?: LiveChatProductButtonRendererServiceEndpoint;
}

interface LiveChatProductButtonRendererNavigationEndpoint {
    clickTrackingParams: string;
    commandMetadata: CommandCommandMetadata;
    userFeedbackEndpoint: UserFeedbackEndpoint;
}

interface UserFeedbackEndpoint {
    hack: boolean;
    bucketIdentifier: string;
}

interface LiveChatProductButtonRendererServiceEndpoint {
    clickTrackingParams: string;
    showLiveChatParticipantsEndpoint?: SEndpoint;
    popoutLiveChatEndpoint?: PopoutLiveChatEndpoint;
    toggleLiveChatTimestampsEndpoint?: SEndpoint;
}

interface SEndpoint {
    hack: boolean;
}

interface SendButton {
    buttonRenderer: SendButtonButtonRenderer;
}

interface SendButtonButtonRenderer {
    style: string;
    size: string;
    isDisabled: boolean;
    serviceEndpoint: PurpleServiceEndpoint;
    icon: Icon;
    accessibility: AccessibilityAccessibility;
    trackingParams: string;
    accessibilityData: ContextMenuAccessibilityClass;
}

interface PurpleServiceEndpoint {
    clickTrackingParams: string;
    commandMetadata: ServiceEndpointCommandMetadata;
    sendLiveChatMessageEndpoint: SendLiveChatMessageEndpoint;
}

interface ServiceEndpointCommandMetadata {
    webCommandMetadata: FluffyWebCommandMetadata;
}

interface FluffyWebCommandMetadata {
    sendPost: boolean;
    apiUrl: string;
}

interface SendLiveChatMessageEndpoint {
    params: string;
    actions: SendLiveChatMessageEndpointAction[];
    clientIdPrefix: string;
}

interface SendLiveChatMessageEndpointAction {
    clickTrackingParams: string;
    addLiveChatTextMessageFromTemplateAction: AddLiveChatTextMessageFromTemplateAction;
}

interface AddLiveChatTextMessageFromTemplateAction {
    template: Template;
}

interface Template {
    liveChatTextMessageRenderer: TemplateLiveChatTextMessageRenderer;
}

interface TemplateLiveChatTextMessageRenderer {
    authorName: AuthorName;
    authorPhoto: AuthorPhoto;
    authorExternalChannelId: string;
    trackingParams: string;
}

interface LiveChatContinuationAction {
    clickTrackingParams: string;
    addBannerToLiveChatCommand?: AddBannerToLiveChatCommand;
    addChatItemAction?: AddChatItemAction;
}

interface AddBannerToLiveChatCommand {
    bannerRenderer: BannerRenderer;
}

interface BannerRenderer {
    liveChatBannerRenderer: LiveChatBannerRenderer;
}

interface LiveChatBannerRenderer {
    header: LiveChatBannerRendererHeader;
    contents: Contents;
    actionId: string;
    viewerIsCreator: boolean;
    targetId: string;
    isStackable: boolean;
    backgroundType: string;
    bannerProperties: BannerProperties;
}

interface BannerProperties {
    autoCollapseDelay: AutoCollapseDelay;
}

interface AutoCollapseDelay {
    seconds: string;
}

interface Contents {
    liveChatTextMessageRenderer: ContentsLiveChatTextMessageRenderer;
}

interface ContentsLiveChatTextMessageRenderer {
    message: FatalError;
    authorName: AuthorName;
    authorPhoto: AuthorPhoto;
    id: string;
    timestampUsec: string;
    authorBadges?: AuthorBadge[];
    authorExternalChannelId: string;
    trackingParams: string;
    contextMenuEndpoint?: ContextMenuEndpoint;
    contextMenuAccessibility?: ContextMenuAccessibilityClass;
}

interface AuthorBadge {
    liveChatAuthorBadgeRenderer: LiveChatAuthorBadgeRenderer;
}

interface LiveChatAuthorBadgeRenderer {
    icon: Icon;
    tooltip: string;
    accessibility: ContextMenuAccessibilityClass;
}

interface ContextMenuEndpoint {
    clickTrackingParams: string;
    commandMetadata: CommandCommandMetadata;
    liveChatItemContextMenuEndpoint: LiveChatItemContextMenuEndpoint;
}

interface LiveChatBannerRendererHeader {
    liveChatBannerHeaderRenderer: LiveChatBannerHeaderRenderer;
}

interface LiveChatBannerHeaderRenderer {
    icon: Icon;
    text: FatalError;
    contextMenuButton: ContextMenuButton;
}

interface ContextMenuButton {
    buttonRenderer: ContextMenuButtonButtonRenderer;
}

interface ContextMenuButtonButtonRenderer {
    icon: Icon;
    accessibility: AccessibilityAccessibility;
    trackingParams: string;
    accessibilityData: ContextMenuAccessibilityClass;
    command: ContextMenuEndpoint;
}

interface AddChatItemAction {
    item: AddChatItemActionItem;
    clientId?: string;
}

interface AddChatItemActionItem {
    liveChatTextMessageRenderer?: ContentsLiveChatTextMessageRenderer;
    liveChatViewerEngagementMessageRenderer?: LiveChatViewerEngagementMessageRenderer;
}

interface LiveChatViewerEngagementMessageRenderer {
    id: string;
    timestampUsec: string;
    icon: Icon;
    message: FatalError;
    actionButton: ActionButton;
    trackingParams: string;
}

interface ActionButton {
    buttonRenderer: ActionButtonButtonRenderer;
}

interface ActionButtonButtonRenderer {
    style: string;
    size: string;
    isDisabled: boolean;
    text: AuthorName;
    navigationEndpoint: ButtonRendererNavigationEndpoint;
    trackingParams: string;
    accessibilityData: ContextMenuAccessibilityClass;
}

interface ButtonRendererNavigationEndpoint {
    clickTrackingParams: string;
    commandMetadata: PurpleCommandMetadata;
    urlEndpoint: URLEndpoint;
}

interface PurpleCommandMetadata {
    webCommandMetadata: TentacledWebCommandMetadata;
}

interface TentacledWebCommandMetadata {
    url: string;
    webPageType: string;
    rootVe: number;
}

interface URLEndpoint {
    url: string;
    target: string;
}

interface ClientMessages {
    reconnectMessage: FatalError;
    unableToReconnectMessage: FatalError;
    fatalError: FatalError;
    reconnectedMessage: FatalError;
    genericError: FatalError;
}

interface ContinuationElement {
    invalidationContinuationData: InvalidationContinuationData;
}

interface InvalidationContinuationData {
    invalidationId: InvalidationID;
    timeoutMs: number;
    continuation: string;
    clickTrackingParams: string;
}

interface InvalidationID {
    objectSource: number;
    objectId: string;
    topic: string;
    subscribeToGcmTopics: boolean;
    protoCreationTimestampMs: string;
}

interface Emoji {
    emojiId: string;
    shortcuts: string[];
    searchTerms: string[];
    image: Image;
    isCustomEmoji: boolean;
}

interface Image {
    thumbnails: AuthorPhotoThumbnail[];
    accessibility: ContextMenuAccessibilityClass;
}

interface LiveChatContinuationHeader {
    liveChatHeaderRenderer: LiveChatHeaderRenderer;
}

interface LiveChatHeaderRenderer {
    overflowMenu: OverflowMenu;
    collapseButton: CollapseButton;
    viewSelector: ViewSelector;
}

interface CollapseButton {
    buttonRenderer: CollapseButtonButtonRenderer;
}

interface CollapseButtonButtonRenderer {
    style: string;
    size: string;
    isDisabled: boolean;
    accessibility: AccessibilityAccessibility;
    trackingParams: string;
}

interface OverflowMenu {
    menuRenderer: MenuRenderer;
}

interface MenuRenderer {
    items: ItemElement[];
    trackingParams: string;
    accessibility: ContextMenuAccessibilityClass;
}

interface ItemElement {
    menuServiceItemRenderer?: Renderer;
    menuNavigationItemRenderer?: Renderer;
}

interface ViewSelector {
    sortFilterSubMenuRenderer: SortFilterSubMenuRenderer;
}

interface SortFilterSubMenuRenderer {
    subMenuItems: SubMenuItem[];
    accessibility: ContextMenuAccessibilityClass;
    trackingParams: string;
    targetId: string;
}

interface SubMenuItem {
    title: string;
    selected: boolean;
    continuation: SubMenuItemContinuation;
    accessibility: ContextMenuAccessibilityClass;
    subtitle: string;
    trackingParams: string;
}

interface SubMenuItemContinuation {
    reloadContinuationData: ReloadContinuationData;
}

interface ReloadContinuationData {
    continuation: string;
    clickTrackingParams: string;
}

interface ItemList {
    liveChatItemListRenderer: LiveChatItemListRenderer;
}

interface LiveChatItemListRenderer {
    maxItemsToDisplay: number;
    moreCommentsBelowButton: Button;
    enablePauseChatKeyboardShortcuts: boolean;
    targetId: string;
}

interface Button {
    buttonRenderer: MoreCommentsBelowButtonButtonRenderer;
}

interface MoreCommentsBelowButtonButtonRenderer {
    style?: string;
    icon: Icon;
    trackingParams: string;
    accessibilityData: ContextMenuAccessibilityClass;
}

interface ParticipantsList {
    liveChatParticipantsListRenderer: LiveChatParticipantsListRenderer;
}

interface LiveChatParticipantsListRenderer {
    title: FatalError;
    backButton: Button;
    participants: Participant[];
}

interface Participant {
    liveChatParticipantRenderer: LiveChatParticipantRenderer;
}

interface LiveChatParticipantRenderer {
    authorName: AuthorName;
    authorPhoto: AuthorPhoto;
    authorBadges: AuthorBadge[];
}

interface PopoutMessage {
    messageRenderer: MessageRenderer;
}

interface MessageRenderer {
    text: FatalError;
    trackingParams: string;
    button: MessageRendererButton;
}

interface MessageRendererButton {
    buttonRenderer: ButtonButtonRenderer;
}

interface ButtonButtonRenderer {
    style: string;
    text: FatalError;
    serviceEndpoint: FluffyServiceEndpoint;
    trackingParams: string;
}

interface FluffyServiceEndpoint {
    clickTrackingParams: string;
    popoutLiveChatEndpoint: PopoutLiveChatEndpoint;
}

interface Ticker {
    liveChatTickerRenderer: LiveChatTickerRenderer;
}

interface LiveChatTickerRenderer {
    sentinel: boolean;
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
