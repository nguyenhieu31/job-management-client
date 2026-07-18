export interface ServiceOption {
  id: string;
  label: string;
  subtitle: string;
  price?: number;
  samplesAvailable?: boolean;
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
  { id: "hdr-editing", label: "HDR Editing", subtitle: "Xử lý ảnh HDR chuyên nghiệp", price: 0.75, samplesAvailable: true },
  { id: "single-photo", label: "Single Photo Editing", subtitle: "Chỉnh sửa ảnh đơn lẻ", price: 0.6, samplesAvailable: true },
  { id: "flash", label: "Flash Editing", subtitle: "Chỉnh sửa ảnh flash", price: 1, samplesAvailable: true },
  { id: "flambient-editing", label: "Flambient Editing", subtitle: "Kết hợp flash và ánh sáng tự nhiên", price: 1.2, samplesAvailable: true },
  { id: "day-to-dusk", label: "Natural Twilight", subtitle: "Hiệu ứng chạng vạng tự nhiên", price: 1, samplesAvailable: true },
  { id: "virtual-twilight", label: "Virtual Twilight", subtitle: "Tạo hiệu ứng chạng vạng", price: 5, samplesAvailable: true },
  { id: "virtual-staging", label: "Virtual Staging", subtitle: "Dàn dựng nội thất ảo", price: 13, samplesAvailable: true },
  { id: "object-removal-1-4", label: "Object Removal: 1–4 Items", subtitle: "Xóa 1–4 vật thể", price: 4, samplesAvailable: true },
  { id: "object-removal-clear-room", label: "Object Removal: Clear Room", subtitle: "Dọn sạch phòng", price: 10, samplesAvailable: true },
  { id: "lawn-replacement", label: "Lawn Replacement", subtitle: "Thay thế thảm cỏ", price: 1, samplesAvailable: true },
  { id: "water-in-pool", label: "Water in Pool", subtitle: "Thêm nước vào hồ bơi", price: 7, samplesAvailable: true },
  { id: "virtual-renovation", label: "Virtual Renovation", subtitle: "Cải tạo ảo", price: 19, samplesAvailable: true },
];

export const VIDEO_SERVICES: ServiceOption[] = [
  { id: "property-tour-video", label: "Property Tour Video", subtitle: "Video tham quan bất động sản", price: 40 },
  { id: "social-media-reel", label: "Social Media Reel", subtitle: "Video ngắn cho mạng xã hội", price: 40 },
  { id: "luxury-cinematic-video", label: "Luxury Cinematic Video", subtitle: "Video điện ảnh cao cấp", price: 45 },
  // { id: "marketing-video", label: "Marketing Video", subtitle: "Video tiếp thị", price: 8 },
  { id: "agent-introduction-video", label: "Agent Introduction Video", subtitle: "Video giới thiệu môi giới", price: 60 },
  // { id: "community-video", label: "Community Video", subtitle: "Video cộng đồng", price: 6 },
  // { id: "before-after-video", label: "Before & After Video", subtitle: "Video trước và sau", price: 4 },
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
  { value: "clean-simple", label: "Clean & Simple", price: 2 },
  { value: "luxury-cinematic", label: "Luxury & Cinematic", price: 5 },
  { value: "fast-paced-social", label: "Fast-paced Social Media", price: 3 },
  { value: "advertising-marketing", label: "Advertising / Marketing", price: 4 },
  { value: "editor-decides", label: "Để editor tự quyết định" },
];

export const ASPECT_RATIO_OPTIONS = [
  { value: "9:16", label: "Dọc 9:16 (Instagram Reels / TikTok)", price: 0.5 },
  { value: "16:9", label: "Ngang 16:9 (YouTube)" },
  { value: "1:1", label: "Vuông 1:1", price: 0.5 },
  { value: "both", label: "Cả hai", price: 1 },
];

export const MUSIC_OPTIONS = [
  { value: "i-will-provide", label: "Tôi sẽ cung cấp nhạc" },
  { value: "editor-chooses", label: "Để editor chọn nhạc" },
  { value: "no-music", label: "Không có nhạc" },
];

export const REALTOR_AGENT_OPTIONS = [
  { value: "talking-on-camera", label: "Talking agent on camera", price: 3 },
  { value: "start-with-agent", label: "Start with agent", price: 1.5 },
  { value: "end-with-agent", label: "End with agent", price: 1.5 },
  { value: "agent-voice-over", label: "Agent voice-over", price: 1 },
  { value: "no-agent", label: "No agent appearance" },
];

export const TEXT_CAPTIONS_OPTIONS = [
  { value: "captions", label: "Captions", price: 1 },
  { value: "property-info", label: "Property information", price: 0.5 },
  { value: "agent-info", label: "Agent information", price: 0.5 },
  { value: "logo", label: "Logo", price: 1 },
  { value: "contact-info", label: "Contact information", price: 0.5 },
  { value: "social-media", label: "Social media handles", price: 0.5 },
];

export const TRANSITIONS_OPTIONS = [
  { value: "minimal", label: "Minimal" },
  { value: "smooth", label: "Smooth", price: 1 },
  { value: "advanced", label: "Advanced", price: 2 },
  { value: "speed-ramp", label: "Speed Ramp", price: 2 },
  { value: "cinematic", label: "Cinematic effects", price: 3 },
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
  { value: "living-room", label: "Living Room", price: 2 },
  { value: "dining-room", label: "Dining Room", price: 2 },
  { value: "bedroom", label: "Bedroom", price: 2 },
  { value: "office", label: "Office", price: 2 },
  { value: "patio", label: "Patio", price: 2.5 },
  { value: "outdoor-space", label: "Outdoor Space", price: 2.5 },
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

export interface SampleImagePair {
  before: string;
  after: string;
}

export const SERVICE_SAMPLE_IMAGES: Record<string, SampleImagePair[]> = {
  "hdr-editing": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934253/2025.12.06_ViaDeiMarchetti_00024_exuvpw.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934269/2025.12.06_VIDSOL-ViaDeiMarchetti_00025_tqppg5.jpg",
    },
  ],
  "single-photo": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935136/IMG_5726_gczv9n.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935146/IMG_5725_nadupl.jpg",
    },
  ],
  "flash": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934178/IMG_6824_tafdld.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783936273/IMG_6824_1_uipb2c.jpg",
    },
  ],
  "flambient-editing": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783933541/1775_NW_93rd_Pl_019_qbj7rv.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783931754/1775_NW_93rd_Pl_023_umeozb.jpg",
    },
  ],
  "day-to-dusk": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934727/IMG_8096_s6dpky.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934735/IMG_8095_rjffif.jpg",
    },
  ],
  "virtual-twilight": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935248/DSC00869_bbgfgv.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935261/DSC00870_1_grtwll.jpg",
    },
  ],
  "virtual-staging": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935585/BB6A2956_1_nqqtbu.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935230/BB6A2956_final_rbcjbc.jpg",
    },
  ],
  "object-removal-1-4": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934772/DSC05073_ygajnm.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934791/DSC05073_final_tbwvya.jpg",
    },
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934769/DSC01515_s9qpnm.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934786/DSC01515_fo4prq.jpg",
    },
  ],
  "object-removal-clear-room": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934851/OESR8114_nxofy0.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934861/OESR8114_nermlb.jpg",
    },
  ],
  "lawn-replacement": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934580/P1114971_gjis2n.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934593/P1114971_v2_fpo8zi.jpg",
    },
  ],
  "water-in-pool": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935366/72ba6ebe-8dda-4639-b8fc-94da4b631782_qgtdw8.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935346/2bf59ea4-2854-4d2c-9447-0b6e9f8d3285_jwa2ca.jpg",
    },
  ],
  "virtual-renovation": [
    {
      before: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783934895/DJI_0278_ugmj7z.jpg",
      after: "https://res.cloudinary.com/dri9qx6pb/image/upload/v1783935060/DJI_0278_1_loqqyg.jpg",
    },
  ]
};

export const SERVICE_SAMPLE_ALT: Record<string, { before: string; after: string }> = {
  "hdr-editing": { before: "Ảnh gốc chưa qua xử lý HDR", after: "Ảnh đã qua xử lý HDR chuyên nghiệp" },
  "single-photo": { before: "Ảnh gốc chưa chỉnh sửa", after: "Ảnh đã chỉnh sửa hoàn thiện" },
  "flash": { before: "Ảnh chụp với ánh sáng tự nhiên", after: "Ảnh đã qua xử lý flash" },
  "flambient-editing": { before: "Ảnh gốc chụp thực tế", after: "Ảnh đã kết hợp flash và ánh sáng tự nhiên" },
  "day-to-dusk": { before: "Ảnh chụp ban ngày", after: "Hiệu ứng chạng vạng tự nhiên" },
  "virtual-twilight": { before: "Ảnh gốc ban ngày", after: "Hiệu ứng hoàng hôn ảo" },
  "virtual-staging": { before: "Phòng trống chưa có nội thất", after: "Phòng đã được dàn dựng nội thất ảo" },
  "object-removal-1-4": { before: "Ảnh gốc có vật thể cần xóa", after: "Ảnh đã xóa vật thể không mong muốn" },
  "object-removal-clear-room": { before: "Phòng còn đồ đạc", after: "Phòng đã được dọn sạch" },
  "lawn-replacement": { before: "Thảm cỏ cũ kém chất lượng", after: "Thảm cỏ mới xanh tươi" },
  "water-in-pool": { before: "Hồ bơi không có nước", after: "Hồ bơi đã có nước" },
  "virtual-renovation": { before: "Công trình trước khi cải tạo", after: "Công trình sau khi cải tạo ảo" },
};

export function getServiceSampleImages(serviceId: string): SampleImagePair[] {
  return SERVICE_SAMPLE_IMAGES[serviceId] ?? [];
}

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
