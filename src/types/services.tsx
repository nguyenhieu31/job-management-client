export interface ServiceOption {
  id: string;
  label: string;
  subtitle: string;
  price?: number;
}

export interface AddServiceFormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  zaloId: string;
  instagramHandle: string;
  websiteUrl: string;
  orderNotes: string;
  selectedServices: string[];
  videoStyle: string;
  videoDuration: string;
  customVideoDuration: string;
  aspectRatios: string[];
  music: string;
  realtorAgent: string[];
  textCaptions: string[];
  transitions: string;
  requiredShots: string;
  excludedShots: string;
  referenceVideos: string;
  creativeFreedom: string;
  uploadMethods: string[];
  dropboxLink: string;
  googleDriveLink: string;
  wetransferLink: string;
  virtualStagingRooms: string[];
  virtualStagingStyle: string;
  confirmRequirements: boolean;
  confirmExtraCharges: boolean;
}

export const PHOTO_SERVICES: ServiceOption[] = [
  { id: "hdr-editing", label: "HDR Editing", subtitle: "Xử lý ảnh HDR chuyên nghiệp" },
  { id: "flambient-editing", label: "Flambient Editing", subtitle: "Kết hợp flash và ánh sáng tự nhiên" },
  { id: "day-to-dusk", label: "Day to Dusk", subtitle: "Chuyển ảnh ngày sang hoàng hôn" },
  { id: "virtual-twilight", label: "Virtual Twilight", subtitle: "Tạo hiệu ứng chạng vạng" },
  { id: "sky-replacement", label: "Sky Replacement", subtitle: "Thay thế bầu trời" },
  { id: "grass-replacement", label: "Grass Replacement", subtitle: "Thay thế cỏ" },
  { id: "item-removal", label: "Item Removal", subtitle: "Xóa vật thể không mong muốn" },
  { id: "virtual-staging", label: "Virtual Staging", subtitle: "Dàn dựng nội thất ảo" },
  { id: "virtual-renovation", label: "Virtual Renovation", subtitle: "Cải tạo ảo" },
  { id: "floor-plan", label: "Floor Plan", subtitle: "Vẽ sơ đồ mặt bằng" },
  { id: "drone-photo-editing", label: "Drone Photo Editing", subtitle: "Chỉnh sửa ảnh flycam" },
];

export const VIDEO_SERVICES: ServiceOption[] = [
  { id: "property-tour-video", label: "Property Tour Video", subtitle: "Video tham quan bất động sản" },
  { id: "social-media-reel", label: "Social Media Reel", subtitle: "Video ngắn cho mạng xã hội" },
  { id: "luxury-cinematic-video", label: "Luxury Cinematic Video", subtitle: "Video điện ảnh cao cấp" },
  { id: "marketing-video", label: "Marketing Video", subtitle: "Video tiếp thị" },
  { id: "agent-introduction-video", label: "Agent Introduction Video", subtitle: "Video giới thiệu môi giới" },
  { id: "community-video", label: "Community Video", subtitle: "Video cộng đồng" },
  { id: "before-after-video", label: "Before & After Video", subtitle: "Video trước và sau" },
];

export const PHOTO_SERVICE_IDS = PHOTO_SERVICES.map((s) => s.id);
export const VIDEO_SERVICE_IDS = VIDEO_SERVICES.map((s) => s.id);

export const VIDEO_DURATION_OPTIONS = [
  { value: "15s", label: "15 giây" },
  { value: "30s", label: "30 giây" },
  { value: "60s", label: "60 giây" },
  { value: "custom", label: "Tùy chỉnh" },
];

export const VIDEO_STYLE_OPTIONS = [
  { value: "clean-simple", label: "Clean & Simple", price: 200000 },
  { value: "luxury-cinematic", label: "Luxury & Cinematic", price: 500000 },
  { value: "fast-paced-social", label: "Fast-paced Social Media", price: 300000 },
  { value: "advertising-marketing", label: "Advertising / Marketing", price: 400000 },
  { value: "editor-decides", label: "Để editor tự quyết định" },
];

export const ASPECT_RATIO_OPTIONS = [
  { value: "9:16", label: "Dọc 9:16 (Instagram Reels / TikTok)", price: 50000 },
  { value: "16:9", label: "Ngang 16:9 (YouTube)" },
  { value: "1:1", label: "Vuông 1:1", price: 50000 },
  { value: "both", label: "Cả hai", price: 100000 },
];

export const MUSIC_OPTIONS = [
  { value: "i-will-provide", label: "Tôi sẽ cung cấp nhạc" },
  { value: "editor-chooses", label: "Để editor chọn nhạc" },
  { value: "no-music", label: "Không có nhạc" },
];

export const REALTOR_AGENT_OPTIONS = [
  { value: "talking-on-camera", label: "Talking agent on camera", price: 300000 },
  { value: "start-with-agent", label: "Start with agent", price: 150000 },
  { value: "end-with-agent", label: "End with agent", price: 150000 },
  { value: "agent-voice-over", label: "Agent voice-over", price: 100000 },
  { value: "no-agent", label: "No agent appearance" },
];

export const TEXT_CAPTIONS_OPTIONS = [
  { value: "captions", label: "Captions", price: 100000 },
  { value: "property-info", label: "Property information", price: 50000 },
  { value: "agent-info", label: "Agent information", price: 50000 },
  { value: "logo", label: "Logo", price: 100000 },
  { value: "contact-info", label: "Contact information", price: 50000 },
  { value: "social-media", label: "Social media handles", price: 50000 },
];

export const TRANSITIONS_OPTIONS = [
  { value: "minimal", label: "Minimal" },
  { value: "smooth", label: "Smooth", price: 100000 },
  { value: "advanced", label: "Advanced", price: 200000 },
  { value: "speed-ramp", label: "Speed Ramp", price: 200000 },
  { value: "cinematic", label: "Cinematic effects", price: 300000 },
];

export const CREATIVE_FREEDOM_OPTIONS = [
  { value: "follow-exactly", label: "Follow my instructions exactly" },
  { value: "editor-judgment", label: "Use the editor's professional judgment" },
  { value: "full-freedom", label: "Full creative freedom" },
];

export const UPLOAD_METHOD_OPTIONS = [
  { value: "dropbox", label: "Dropbox link" },
  { value: "google-drive", label: "Google Drive link" },
  { value: "wetransfer", label: "WeTransfer link" },
  { value: "direct-upload", label: "Direct upload to the system" },
];

export const CONFIRMATION_OPTIONS = [
  {
    value: "confirmRequirements",
    label: "I confirm I have provided all requirements before editing begins.",
  },
  {
    value: "confirmExtraCharges",
    label: "Additional requests not included in the original brief may incur extra charges.",
  },
];

export const VIRTUAL_STAGING_ROOMS = [
  { value: "living-room", label: "Living Room", price: 200000 },
  { value: "dining-room", label: "Dining Room", price: 200000 },
  { value: "bedroom", label: "Bedroom", price: 200000 },
  { value: "office", label: "Office", price: 200000 },
  { value: "patio", label: "Patio", price: 250000 },
  { value: "outdoor-space", label: "Outdoor Space", price: 250000 },
];

export const VIRTUAL_STAGING_STYLES = [
  { value: "modern", label: "Modern" },
  { value: "luxury", label: "Luxury" },
  { value: "scandinavian", label: "Scandinavian" },
  { value: "contemporary", label: "Contemporary" },
  { value: "farmhouse", label: "Farmhouse" },
  { value: "coastal", label: "Coastal" },
  { value: "custom", label: "Custom based on client request" },
];

export function isVideoServiceSelected(selectedServices: string[]): boolean {
  return selectedServices.some((id) => VIDEO_SERVICE_IDS.includes(id));
}

export function isVirtualStagingSelected(selectedServices: string[]): boolean {
  return selectedServices.includes("virtual-staging");
}

type PriceLookupOption = { price?: number } & ({ value: string } | { id: string });

const getServicePrice = (services: ServiceOption[], id: string): number =>
  services.find((s) => s.id === id)?.price ?? 0;

const getOptionPrice = (
  options: { value: string; price?: number }[],
  value: string,
): number => options.find((o) => o.value === value)?.price ?? 0;

const sumArrayPrices = (
  options: { value: string; price?: number }[],
  values: string[],
): number =>
  values.reduce((sum, v) => sum + (options.find((o) => o.value === v)?.price ?? 0), 0);

export function computeEstimatedPrice(state: AddServiceFormState): number {
  let total = 0;

  total += [...PHOTO_SERVICES, ...VIDEO_SERVICES].reduce(
    (sum, s) => sum + (state.selectedServices.includes(s.id) ? (s.price ?? 0) : 0),
    0,
  );

  if (state.videoStyle) {
    total += getOptionPrice(VIDEO_STYLE_OPTIONS, state.videoStyle);
  }

  if (state.videoDuration && state.videoDuration !== "custom") {
    total += getOptionPrice(VIDEO_DURATION_OPTIONS, state.videoDuration);
  }

  total += sumArrayPrices(ASPECT_RATIO_OPTIONS, state.aspectRatios);

  if (state.music) {
    total += getOptionPrice(MUSIC_OPTIONS, state.music);
  }

  total += sumArrayPrices(REALTOR_AGENT_OPTIONS, state.realtorAgent);
  total += sumArrayPrices(TEXT_CAPTIONS_OPTIONS, state.textCaptions);

  if (state.transitions) {
    total += getOptionPrice(TRANSITIONS_OPTIONS, state.transitions);
  }

  if (state.creativeFreedom) {
    total += getOptionPrice(CREATIVE_FREEDOM_OPTIONS, state.creativeFreedom);
  }

  total += sumArrayPrices(VIRTUAL_STAGING_ROOMS, state.virtualStagingRooms);

  if (state.virtualStagingStyle) {
    total += getOptionPrice(VIRTUAL_STAGING_STYLES, state.virtualStagingStyle);
  }

  return total;
}

export function getInitialFormState(): AddServiceFormState {
  return {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    zaloId: "",
    instagramHandle: "",
    websiteUrl: "",
    orderNotes: "",
    selectedServices: [],
    videoStyle: "",
    videoDuration: "",
    customVideoDuration: "",
    aspectRatios: [],
    music: "",
    realtorAgent: [],
    textCaptions: [],
    transitions: "",
    requiredShots: "",
    excludedShots: "",
    referenceVideos: "",
    creativeFreedom: "",
    uploadMethods: [],
    dropboxLink: "",
    googleDriveLink: "",
    wetransferLink: "",
    virtualStagingRooms: [],
    virtualStagingStyle: "",
    confirmRequirements: false,
    confirmExtraCharges: false,
  };
}
