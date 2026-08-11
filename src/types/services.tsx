export interface ServiceOption {
  id: string;
  label: string;
  subtitle: string;
  price?: number;
  samplesAvailable?: boolean;
}

export interface PhotoQuantities {
  singleExposure: number;
  blendedBrackets: number;
  flambient: number;
}

export interface PhotoAddOns {
  skyReplacement: boolean;
  tvScreenReplacement: boolean;
  grassReplacement: boolean;
  grassReplacementCount: number;
  skyReplacementNote: string;
  tvScreenReplacementNote: string;
  grassReplacementNote: string;
}

export interface AddServiceFormState {
  customerName: string;
  customerEmail: string;
  realEstateAddress: string;
  instagramHandle: string;
  websiteUrl: string;
  orderNotes: string;
  selectedServices: string[];
  photoQuantity: number;
  photoQuantities: PhotoQuantities;
  photoServiceNote: string;
  photoAddOns: PhotoAddOns;
  videoServiceNote: string;
  videoStyle: string;
  videoDuration: string;
  customVideoDuration: string;
  videoDurationExtended: number;
  aspectRatios: string;
  music: string;
  musicNote: string;
  textCaptions: string[];
  textCaptionsNote: string;
  transitions: string;
  transitionsNote: string;
  aiOption: boolean;
  aiNote: string;
  aiSceneCount: number;
  aiSceneNote: string;
  text2d3dCount: number;
  text2d3dNote: string;
  boundaryDrawOption: boolean;
  boundaryDrawNote: string;
  uploadMethods: string[];
  dropboxLink: string;
  googleDriveLink: string;
  wetransferLink: string;
  /** @deprecated legacy multi-select; new orders use virtualStagingRoomCounts */
  virtualStagingRooms: string[];
  virtualStagingRoomCounts: Record<string, number>;
  virtualStagingRoomNotes: Record<string, string>;
  virtualStagingStyle: string;
  virtualStagingStyleNote: string;
  virtualStagingRoomsNote: string;
  confirmRequirements: boolean;
  confirmExtraCharges: boolean;
}

export const PHOTO_SERVICES: ServiceOption[] = [
  { id: "hdr-editing", label: "Blended Brackets (HDR)", subtitle: "Kết hợp nhiều khung hình HDR chuyên nghiệp", price: 0.75, samplesAvailable: true },
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
  { id: "video-basic", label: "Video Basic", subtitle: "Video cơ bản", price: 40, samplesAvailable: true },
  { id: "social-media-reel", label: "Social Media Reel", subtitle: "Video ngắn cho mạng xã hội", price: 40, samplesAvailable: true },
  { id: "luxury-cinematic-video", label: "Luxury Cinematic Video", subtitle: "Video điện ảnh cao cấp", price: 55, samplesAvailable: true },
  { id: "agent-introduction-video", label: "Agent Introduction Video", subtitle: "Video giới thiệu môi giới", price: 55, samplesAvailable: true },
  { id: "property-tour-video", label: "Property Tour Video", subtitle: "Video tham quan bất động sản", price: 40, samplesAvailable: true },
];

export const PHOTO_SERVICE_IDS = PHOTO_SERVICES.map((s) => s.id);
export const VIDEO_SERVICE_IDS = VIDEO_SERVICES.map((s) => s.id);

export const VIDEO_DURATION_OPTIONS = [
  { value: "15s", label: "15 seconds" },
  { value: "30s", label: "30 seconds" },
  { value: "60s", label: "60 seconds" },
  { value: "custom", label: "Custom" },
];

export const AGENT_INTRO_VIDEO_DURATION_OPTIONS = [
  { value: "30s", label: "30 seconds" },
  { value: "60s", label: "60 seconds", price: 30 },
  { value: "custom", label: "Custom" },
];

export const DURATION_EXTEND_PRICE = 10;
export const DURATION_EXTEND_UNIT_SECONDS = 15;
export const AGENT_INTRO_DURATION_EXTEND_UNIT_SECONDS = 10;
export const AI_SCENE_PRICE = 20;
export const TEXT_2D_3D_PRICE = 10;

export const VIDEO_STYLE_OPTIONS = [
  { value: "clean-simple", label: "Clean & Simple" },
  { value: "luxury-cinematic", label: "Luxury & Cinematic" },
  { value: "fast-paced-social", label: "Fast-paced Social Media"},
  { value: "advertising-marketing", label: "Advertising / Marketing" },
  { value: "editor-decides", label: "Let the editor decide for himself" },
];

export const ASPECT_RATIO_OPTIONS = [
  { value: "9:16", label: "Vertical 9:16 (Instagram Reels / TikTok)" },
  { value: "16:9", label: "Horizontal 16:9 (YouTube)" },
  { value: "both", label: "Both", price: 15 },
];

export const MUSIC_OPTIONS = [
  { value: "i-will-provide", label: "I will provide music" },
  { value: "editor-chooses", label: "Let editor choose" },
  { value: "no-music", label: "No music" },
];

export const REALTOR_AGENT_OPTIONS = [
  { value: "talking-on-camera", label: "Talking agent on camera", price: 3 },
  { value: "start-with-agent", label: "Start with agent", price: 1.5 },
  { value: "end-with-agent", label: "End with agent", price: 1.5 },
  { value: "agent-voice-over", label: "Agent voice-over", price: 1 },
  { value: "no-agent", label: "No agent appearance" },
];

export const TEXT_CAPTIONS_OPTIONS = [
  { value: "captions", label: "Captions"},
  { value: "property-info", label: "Property information" },
  { value: "agent-info", label: "Agent information"},
  { value: "logo", label: "Logo"},
  { value: "contact-info", label: "Contact information" },
  { value: "social-media", label: "Social media handles"},
];

export const TRANSITIONS_OPTIONS = [
  { value: "minimal", label: "Minimal" },
  { value: "smooth", label: "Smooth" },
  { value: "advanced", label: "Advanced"},
  { value: "speed-ramp", label: "Speed Ramp"},
  { value: "cinematic", label: "Cinematic effects" },
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

export const PHOTO_QUANTITY_FIELDS = [] as const;

export const PHOTO_ADDON_OPTIONS: Array<{
  key: "skyReplacement" | "tvScreenReplacement" | "grassReplacement";
  noteKey: "skyReplacementNote" | "tvScreenReplacementNote" | "grassReplacementNote";
  label: string;
  price?: number;
  helper: string;
}> = [
  {
    key: "skyReplacement",
    noteKey: "skyReplacementNote",
    label: "Sky Replacement",
    helper: "Preferred sky style / time of day…",
  },
  {
    key: "tvScreenReplacement",
    noteKey: "tvScreenReplacementNote",
    label: "TV Screen Replacement",
    helper: "Screen content or color preference…",
  },
  {
    key: "grassReplacement",
    noteKey: "grassReplacementNote",
    label: "Grass Replacement",
    price: 1,
    helper: "Per-photo grass fix on this order — different from the Lawn Replacement service.",
  },
];

export const PHOTO_ADDON_ELIGIBLE_IDS = [
  "hdr-editing",
  "single-photo",
  "flash",
  "flambient-editing",
  "day-to-dusk",
] as const;

export const PHOTO_QTY_MAX = 500;

export const VIRTUAL_STAGING_ROOMS = [
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "dining-room", label: "Dining Room" },
  { value: "home-office", label: "Home Office" },
  { value: "outdoor-patio", label: "Outdoor / Patio" },
];

/** Labels for legacy room values stored on older orders */
export const VIRTUAL_STAGING_LEGACY_ROOM_LABELS: Record<string, string> = {
  "living-room": "Living Room",
  "dining-room": "Dining Room",
  bedroom: "Bedroom",
  office: "Office",
  patio: "Patio",
  "outdoor-space": "Outdoor Space",
  kitchen: "Kitchen",
  "home-office": "Home Office",
  "outdoor-patio": "Outdoor / Patio",
};

export const VIRTUAL_STAGING_STYLES = [
  { value: "modern", label: "Modern" },
  { value: "luxury", label: "Luxury" },
  { value: "scandinavian", label: "Scandinavian" },
  { value: "modern-farmhouse", label: "Modern Farmhouse" },
  { value: "minimalist", label: "Minimalist" },
];

export function isVideoServiceSelected(selectedServices: string[]): boolean {
  return selectedServices.some((id) => VIDEO_SERVICE_IDS.includes(id));
}

export function isVideoBasicSelected(selectedServices: string[]): boolean {
  return selectedServices.includes("video-basic");
}

export function isAgentIntroVideoSelected(selectedServices: string[]): boolean {
  return selectedServices.includes("agent-introduction-video");
}

export function isPhotoServiceSelected(selectedServices: string[]): boolean {
  return selectedServices.some((id) => PHOTO_SERVICE_IDS.includes(id));
}

export function isVirtualStagingSelected(selectedServices: string[]): boolean {
  return selectedServices.includes("virtual-staging");
}

export function isNonVirtualStagingPhotoSelected(
  selectedServices: string[],
): boolean {
  return (
    isPhotoServiceSelected(selectedServices) &&
    !isVirtualStagingSelected(selectedServices)
  );
}

export function isPhotoAddonEligible(selectedServices: string[]): boolean {
  return selectedServices.some((id) =>
    (PHOTO_ADDON_ELIGIBLE_IDS as readonly string[]).includes(id),
  );
}

export function getTotalPhotoQuantity(state: AddServiceFormState): number {
  return Number.isFinite(state.photoQuantity) ? Math.max(0, state.photoQuantity) : 0;
}

export function getVirtualStagingPhotoTotal(state: AddServiceFormState): number {
  const counts = state.virtualStagingRoomCounts;
  if (!counts || typeof counts !== "object") return 0;
  return Object.values(counts).reduce(
    (sum, n) => sum + (Number.isFinite(n) ? Math.max(0, Number(n)) : 0),
    0,
  );
}

export function emptyVirtualStagingRoomCounts(): Record<string, number> {
  return Object.fromEntries(
    VIRTUAL_STAGING_ROOMS.map((r) => [r.value, 0]),
  );
}

export function emptyPhotoAddOns(): PhotoAddOns {
  return {
    skyReplacement: false,
    tvScreenReplacement: false,
    grassReplacement: false,
    grassReplacementCount: 0,
    skyReplacementNote: "",
    tvScreenReplacementNote: "",
    grassReplacementNote: "",
  };
}

export function getPhotoAddOnPrice(state: AddServiceFormState, key: keyof PhotoAddOns): number {
  if (key === "grassReplacement") {
    return (state.photoAddOns?.grassReplacementCount ?? 0) * 1.0;
  }
  const opt = PHOTO_ADDON_OPTIONS.find((o) => o.key === key);
  return opt?.price ?? 0;
}

export function emptyPhotoQuantities(): PhotoQuantities {
  return { singleExposure: 0, blendedBrackets: 0, flambient: 0 };
}

export function clampPhotoQty(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(PHOTO_QTY_MAX, Math.max(0, Math.floor(value)));
}

type PriceLookupOption = { price?: number } & ({ value: string } | { id: string });

export interface SampleImagePair {
  before?: string;
  after?: string;
  video?: string;
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
  ],
  "video-basic": [
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786199460/co_ban_3_ce3xkg.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786199348/c%C6%A1_ban_2_wzqtsz.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786198783/coban1_jxbjpc.mp4",
    },
  ],
  "property-tour-video": [
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786197243/tham_quan_3_zmpqhu.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786197506/socal_1_u1a02e.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786197163/%C4%91%C3%A3_xu%E1%BA%A5t_tham_quan_ymy5zj.mp4",
    },
  ],
  "social-media-reel": [
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786199529/mang_xa_hoi_3_qljfsd.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786197506/socal_1_u1a02e.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1784388671/VIDEO_Social_Media_Reel_ygwyqk.mp4",
    },
  ],
  "luxury-cinematic-video": [
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1784387976/reelsvideo.io_1784387876267_qpieh6.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1784389024/reelsvideo.io_1784388910644_jxuos7.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1784388033/reelsvideo.io_1784388008169_kawu0l.mp4",
    },
  ],
  "agent-introduction-video": [
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786198452/nii_2_k6g6sw.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786198442/noi30725_bkpfff.mp4",
    },
    {
      video: "https://res.cloudinary.com/dri9qx6pb/video/upload/v1786198406/n%C3%B3i_1_pzd9cc.mp4",
    },
  ],
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
  const selected = state.selectedServices ?? [];
  const hasVS = isVirtualStagingSelected(selected);
  const hasNonVSPhoto = isNonVirtualStagingPhotoSelected(selected);
  const hasVideo = isVideoServiceSelected(selected);

  if (hasNonVSPhoto) {
    const totalQty = getTotalPhotoQuantity(state);
    for (const id of selected) {
      if (!PHOTO_SERVICE_IDS.includes(id) || id === "virtual-staging") continue;
      const unit = getServicePrice(PHOTO_SERVICES, id);
      total += unit * totalQty;
    }
    if (isPhotoAddonEligible(selected) && totalQty > 0) {
      const addOns = state.photoAddOns;
      for (const opt of PHOTO_ADDON_OPTIONS) {
        if (addOns?.[opt.key]) {
          if (opt.key === "grassReplacement") {
            total += (addOns.grassReplacementCount ?? 0) * 1.0;
          } else if (opt.price) {
            total += opt.price * totalQty;
          }
        }
      }
    }
  }

  if (hasVS) {
    const roomTotal = getVirtualStagingPhotoTotal(state);
    total += getServicePrice(PHOTO_SERVICES, "virtual-staging") * roomTotal;
  }

  if (hasVideo) {
    total += VIDEO_SERVICES.reduce(
      (sum, s) => sum + (selected.includes(s.id) ? (s.price ?? 0) : 0),
      0,
    );

    const isVideoBasic = isVideoBasicSelected(selected);
    const isAgentIntro = isAgentIntroVideoSelected(selected);

    if (!isVideoBasic && state.videoStyle) {
      total += getOptionPrice(VIDEO_STYLE_OPTIONS, state.videoStyle);
    }

    if (state.videoDuration === "custom") {
      const secs = parseInt(state.customVideoDuration, 10);
      const baseSecs = isAgentIntro ? 30 : 60;
      const unitSecs = isAgentIntro ? AGENT_INTRO_DURATION_EXTEND_UNIT_SECONDS : DURATION_EXTEND_UNIT_SECONDS;
      if (Number.isFinite(secs) && secs >= baseSecs) {
        const extra = Math.floor((secs - baseSecs) / unitSecs);
        total += extra * DURATION_EXTEND_PRICE;
      }
    } else if (isAgentIntro) {
      if (state.videoDuration === "30s" && state.videoDurationExtended > 0) {
        total += state.videoDurationExtended * DURATION_EXTEND_PRICE;
      } else if (state.videoDuration === "60s") {
        total += 30 + (state.videoDurationExtended > 0 ? state.videoDurationExtended * DURATION_EXTEND_PRICE : 0);
      }
    } else if (state.videoDuration === "60s" && state.videoDurationExtended > 0) {
      total += state.videoDurationExtended * DURATION_EXTEND_PRICE;
    }

    total += getOptionPrice(ASPECT_RATIO_OPTIONS, state.aspectRatios);

    if (state.music) {
      total += getOptionPrice(MUSIC_OPTIONS, state.music);
    }

    if (!isVideoBasic) {
      if (state.aiOption) total += 20;
      if (state.aiSceneCount > 0) total += state.aiSceneCount * AI_SCENE_PRICE;
      if (state.text2d3dCount > 0) total += state.text2d3dCount * TEXT_2D_3D_PRICE;
      if (state.boundaryDrawOption) total += 10;

      total += sumArrayPrices(TEXT_CAPTIONS_OPTIONS, state.textCaptions);

      if (state.transitions) {
        total += getOptionPrice(TRANSITIONS_OPTIONS, state.transitions);
      }
    }
  }

  return total;
}

export function getInitialFormState(): AddServiceFormState {
  return {
    customerName: "",
    customerEmail: "",
    realEstateAddress: "",
    instagramHandle: "",
    websiteUrl: "",
    orderNotes: "",
    selectedServices: [],
    photoQuantity: 0,
    photoQuantities: emptyPhotoQuantities(),
    photoServiceNote: "",
    photoAddOns: emptyPhotoAddOns(),
    videoServiceNote: "",
    videoStyle: "",
    videoDuration: "",
    customVideoDuration: "",
    videoDurationExtended: 0,
    aspectRatios: "",
    music: "",
    musicNote: "",
    textCaptions: [],
    textCaptionsNote: "",
    transitions: "",
    transitionsNote: "",
    aiOption: false,
    aiNote: "",
    aiSceneCount: 0,
    aiSceneNote: "",
    text2d3dCount: 0,
    text2d3dNote: "",
    boundaryDrawOption: false,
    boundaryDrawNote: "",
    uploadMethods: [],
    dropboxLink: "",
    googleDriveLink: "",
    wetransferLink: "",
    virtualStagingRooms: [],
    virtualStagingRoomCounts: emptyVirtualStagingRoomCounts(),
    virtualStagingRoomNotes: {},
    virtualStagingStyle: "",
    virtualStagingStyleNote: "",
    virtualStagingRoomsNote: "",
    confirmRequirements: false,
    confirmExtraCharges: false,
  };
}
