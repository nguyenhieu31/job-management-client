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
  { id: "social-media-reel", label: "Social Media Reel", subtitle: "Video ngắn cho mạng xã hội", price: 50, samplesAvailable: true },
  { id: "luxury-cinematic-video", label: "Luxury Cinematic Video", subtitle: "Video điện ảnh cao cấp", price: 55, samplesAvailable: true },
  { id: "agent-introduction-video", label: "Agent Introduction Video", subtitle: "Video giới thiệu môi giới", price: 60, samplesAvailable: true },
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
  return (
    selectedServices.includes("video-basic") ||
    selectedServices.includes("property-tour-video")
  );
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
      before: "https://dl.dropboxusercontent.com/scl/fi/wuqteva5x8xq4adctnecn/GQ2A5499.jpg?rlkey=aigo22r2ywf1egdsozfkod9bc&st=a3ct9lzv&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/6vsmpc1jb1yoil25n5m1d/GQ2A5499_1.jpg?rlkey=4k50cappg8tzs1l6wcpvv9j4o&st=lrcv8rc3&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/ka3qyyfekkl7acbuh7706/GQ2A5595.jpg?rlkey=szox0lpu6806tjhmi2xipkcst&st=0zrji6ig&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/p8p6sx60ahh8qs33ncktj/GQ2A5595_1.jpg?rlkey=833grof15yr6b51xyt0tv7enj&st=60yf7fmi&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/m1b6poao8kwei68eq6zks/GQ2A5679.jpg?rlkey=x357imkep0hpd02yityh1armd&st=1sq7zvzg&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/p6hc9plguw3swe9c1boyt/GQ2A5679_1.jpg?rlkey=ta5kak7nnmvrt78ufqd805j9q&st=dmy6tafa&dl=0",
    },
  ],
  "single-photo": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/c5i5v7aqdgtdbkyvlv22f/_MKY9486_1.jpg?rlkey=5d6jgd9z4iocrg4i4qxtk6uup&st=jun9yq7i&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/p6ny8x3ipzy6j40ndyg3o/_MKY9486.jpg?rlkey=g4i5p1vmbtxeoy2hc32dhndbk&st=0juuh5zg&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/vdzclrnbn4do2dptes29m/IMG_2240.jpg?rlkey=2trwxl4eup4ctae2ebw444dhk&st=pcn2indm&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/44awskdtfjgupa0uf5lwc/IMG_2241.jpg?rlkey=jd8lr3jix8sj7rxkvol9h9i1x&st=9vhv3y5s&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/b9mn54jgwq8q2njmf1tbd/IMG_2267.jpg?rlkey=0pwgrsn66gv9jfvm10qsq0o2s&st=kb2kafik&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/w8qmxmmpej269tqtrdhdb/IMG_2268.jpg?rlkey=hb57pzz046r2hse5qh14im74u&st=qcio3zaj&dl=0",
    },
  ],
  "flash": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/kx9cymdjm4wjas60lzw4b/C51A0710.jpg?rlkey=qbg0ln9hb4083sg1wmfpo8xrq&st=rwec1mzp&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/2h1po89u2x3ppdvln9ogz/C51A0709.jpg?rlkey=h9nzsta0m0may08mdqdpnoa9i&st=1xett3wn&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/4vvb1dlgj96e9mu9qjcp4/C51A0722.jpg?rlkey=9i7qkx6z1iwl45ihom2eadl7r&st=3tbeyyrm&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/z3h32b10ex4uld82z7nim/C51A0721.jpg?rlkey=rh3erjp1tqiqihqz1e10nytwa&st=fosc0mek&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/934f66agsz06jbxcdtyl7/C51A0726.jpg?rlkey=909n3ub9fp890ks4p6vswkvx8&st=avmzo0ac&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/fwx153jnju3n3u5b6oqu9/C51A0725.jpg?rlkey=tw678yls8rpno2fwcogxsqtls&st=m9kb38vz&dl=0",
    },
  ],
  "flambient-editing": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/lwqwb14r46clrfmi3ek1q/DSC08537.jpg?rlkey=wywd6js5dchznlw1qd8i8qc4c&st=isbezddc&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/5p0ptotbc509ozgq9k1zk/DSC08538.jpg?rlkey=ueozsr9y4vhr0b2lcbe0690fg&st=j44aggfr&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/m84slz56ihlqs8h52fgd0/DSC08564.jpg?rlkey=xwf0kzrmibro4ul4mb09igg0w&st=y5hxx91g&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/16t1otu9tnjf83q995557/DSC08562.jpg?rlkey=byxfg2n8ga8cev9ln8p30jyte&st=7a3zi1cj&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/xoubyrnalv52ogatgsohy/DSC08576.jpg?rlkey=7nqckupjrpkhwxo1pe2xf8xp1&st=bmryx5vm&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/wvscev7uz6byi1q3f8ufy/DSC08571.jpg?rlkey=x8wm9kii3u0qyu6eoc4yy0mco&st=ae9p2fok&dl=0",
    },
  ],
  "day-to-dusk": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/0id4pzv3b24mw1m66w62m/DJI_20260721193421_0120_D.jpg?rlkey=velud3m8nht6ommuvuhd595o8&st=di5z6bpb&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/ip5e0odqkagzz5hs6usrq/DJI_20260721193421_0120_D_1.jpg?rlkey=j0qmddftftjbp4fg7x0oikovj&st=y73imi7v&dl=0",
    },
  ],
  "virtual-twilight": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/ucfcmzp84da06kx9hfadu/721-Kephard-Cir-2.jpg?rlkey=o4waze6jg7xf8d0t52ql501mm&st=stdno3dd&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/hj9gqzqyxxynkljeiwjw7/721-Kephard-Cir-2.jpg?rlkey=3y6pi36hcbcjovyy0ldinq6ip&st=vlgt2xav&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/dlez6ier2jzswyzd1bghg/721-Kephard-Cir-4.jpg?rlkey=hdchd9hz5srdc533n8a8so66m&st=oxgrbs3c&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/o8chqu56gnqywgljb2do5/721-Kephard-Cir-4.jpg?rlkey=oh212eyzayf0glp1cyu1scvjp&st=jw4j7575&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/pxwwqlbhc6gjo09m060fe/1910-E-Broadway-1.jpg?rlkey=8lmub9ljz0w4q6cil31mpqrmn&st=3hsuki6p&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/bgyuiatico4ibc1gi748x/1910-E-Broadway-1.jpg?rlkey=jh3zmr7eg6tsfyq11orpselgd&st=if8emzdz&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/yr6c66ijwl76i8hkp0c73/1910-E-Broadway-2.jpg?rlkey=2fakp38dhu4owiwbk0coym2mo&st=ek693j09&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/xab0jltqo1fwj3hv7mmur/1910-E-Broadway-2.jpg?rlkey=53afb66qgpxckrqham3ctpnis&st=zfkizh59&dl=0",
    },
  ],
  "virtual-staging": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/jt30jmu6njj9to8cl9klk/9-Sao-ch-p.jpg?rlkey=acdcq7gc0nd0pah82dsh870sa&st=1dy40oqm&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/bzm38e3hj2emvogjtcaxn/9.jpg?rlkey=awzp44blhhitu08tym4ut2pfw&st=bj1m647l&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/nzu1l6p4u53x27axbvxt3/26-Sao-ch-p.jpg?rlkey=lingvj3y2spp566t5zkoat4ie&st=5xmynwiu&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/dx2oppm7spoxgdc9043ol/26.jpg?rlkey=uv9ia8paqtwymhhbpjpie2dhw&st=5znbt7oj&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/ke166bsci92y1ip5tfrfr/27-Sao-ch-p.jpg?rlkey=2l3g6sminzqsl9hbfrjslksuj&st=xy0q32u2&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/a5o4qvqd2ud07q3dzgouh/27.jpg?rlkey=samakbcpzlzo48at5z4z7x639&st=5i0kid7s&dl=0",
    },
  ],
  "object-removal-1-4": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/xy93kxta95sn5qgaamjsi/IMG_4702.jpg?rlkey=beo6g53gq7lbqr1l4p9udfs74&st=mdoku82e&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/s95tjq089ckfip7tjkak5/IMG_4702_1.jpg?rlkey=43sh0ezbmv4yb3uutyp2rdhai&st=gxptowpn&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/dkqhdc25k38rmtcgioe8x/IMG_4814.jpg?rlkey=gb3ef4m86r72kbbgbh0hq8h9q&st=f6rm6h78&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/5un9pjh16jm6wy5dvk9om/IMG_4814_1.jpg?rlkey=9w8c9zqv9o6oci35q3cibp8yz&st=z9ybfjan&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/wlwisb26edo8obioe6dmg/IMG_4820.jpg?rlkey=k5hgklemoh80fl0t4k3w5sbda&st=400zl0qz&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/ye0ykndi1legacuwjl4cu/IMG_4820_1.jpg?rlkey=89n0pdqyyl6rlhvugvsr1y9d3&st=aawp34yo&dl=0",
    },
  ],
  "object-removal-clear-room": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/efu31x0new957c5p2o3b9/GQ2A9366.jpg?rlkey=4z891uaawjnfk8zr06q037cfs&st=dh6magxx&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/0ea8nayb2g40dx3u1mu2i/GQ2A9366_rt.jpg?rlkey=8ftd0tjrv7zkj6ri26dve51mh&st=s6w7dk1n&dl=0",
    },
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/fgrmamixj5sp8lu90c6sn/GQ2A9652.jpg?rlkey=2votqhn4fmvem4h78sazhm36q&st=k1l4nzxp&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/i4zlvq8ff02iktyv6gpge/GQ2A9652_rt.jpg?rlkey=7jal3my1rduwu3qgm11k0h89t&st=umqs28y2&dl=0",
    },
  ],
  "lawn-replacement": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/2bw6ab0wukt4l4j76lv8i/P1114971.jpg?rlkey=bm0y82glkaqv5q7hzm1saa2ti&st=t6hziq84&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/c28q7jnn3t87kn44wbd30/P1114971_v2.jpg?rlkey=ah5bif44ee2muk9urkddlurr0&st=ihz7wlij&dl=0",
    },
  ],
  "water-in-pool": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/ondcnyybu8v5x97i880cu/3.jpg?rlkey=e14y384idqobrgfuh704dtcgr&st=dlem0ew0&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/9in0jdjgjokqml3akvqhq/3_final.jpg?rlkey=0ok5u06ozde9d3fkjvlx8nqyx&st=7givjdrm&dl=0",
    },
  ],
  "virtual-renovation": [
    {
      before: "https://dl.dropboxusercontent.com/scl/fi/nfb4bpvli2bz9s4x2fd2l/Arbeitszimmer-Sao-ch-p.jpg?rlkey=ltebuwwt37u3x75c4975nps5s&st=797fgu7z&dl=0",
      after: "https://dl.dropboxusercontent.com/scl/fi/p5ao5dj4br21vpvzzjn5w/Arbeitszimmer.jpg?rlkey=x6d11vdljdycko9xxfe3vefbx&st=ngtroktg&dl=0",
    },
  ],
  "video-basic": [
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/xe2agkz8xmgjeh78fecoq/1920-canadiana-ct-video-v12313422.mp4?rlkey=adaeyby5d0f964239kbv6cyti&st=8425gnqe&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/nrbk5ca1fbmyejcq5yh2v/2607-Ken-Smith-1660-Mont-Rue-Dr-SE-Grand-Rapids-MI-49546.mp4?rlkey=ocerf1d1idtkjtsfctbrw7bcr&st=adbbh81w&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/7dyuylw6ttnqh2a8fsg72/2594-Laurie-Zwiers-3016-Fransworth-Dr-Holland-MI-49424.mp4?rlkey=ulax6o73y3gv5wyk5w5z1w9ie&st=im5u4ajj&dl=0",
    },
  ],
  "property-tour-video": [
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/boy6rcmi6yhk8twiihwou/Speed-Ramp-6048-Bella-Terra-Ln.mp4?rlkey=07q5fp4v0mxzjilamu5d0ur1d&st=y6ral34n&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/6si7wd9f0aizf02way0hr/8304-Silver-Fox-Ct-Williamsville-NY.mp4?rlkey=wzdbv24bjk7iv3oyxbt5y971a&st=mshjdjx1&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/zf1oe23mbfo910s3wrl9x/3222-Greathouse-Rd.mp4?rlkey=qtq0nc2ridsms9a483rxw6n06&st=zcxryjf7&dl=0",
    },
  ],
  "social-media-reel": [
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/7spcnmjwhxbaj6xb4m3d4/Sean-Bayway-Reel-fix-v1.mp4?rlkey=83b9xa8va7fuv0ant3q7tdneh&st=1k5v4bwq&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/aimix182i22dz9csamyu8/Footage-premium.mp4?rlkey=34ww8mm7f137i3a5rukcve7s3&st=98459oko&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/sycp07t2ax80i28demh0s/2633-Travis-DeHaan-6700-N-Woodland-Rd-Woodland-MI-48897-1.mp4?rlkey=12g5qwjhlpj81onuaaps7bk0z&st=2d35moa1&dl=0",
    },
  ],
  "luxury-cinematic-video": [
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/ptxsm9y960urtplyh1h6n/3.mp4?rlkey=a89nziiauq96ybogc40sixz4q&st=bi4nq8vr&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/lstdd2mpjse1b5r2qn9p1/2.mp4?rlkey=bwy7wwtmnt12wwktjrp7ff4xj&st=l0u1r4nm&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/tbk51vp3q7oigu0f43mgh/1.mp4?rlkey=2at6tyacfxun32prarpl2gnny&st=pk98rxmx&dl=0",
    },
  ],
  "agent-introduction-video": [
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/m28ust06rn1rrr9cmdxtr/Roman-Reel-3-Editor.mp4?rlkey=yvl6mhlbkhbg9t05mtrra5ao8&st=ewnqat8f&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/j6e29023creosu6jkmtg8/Roman-Reel-1-Editor.mp4?rlkey=xyfgrnwkvq153mhgj8qswp7og&st=y42sf8m7&dl=0",
    },
    {
      video: "https://dl.dropboxusercontent.com/scl/fi/p1i75s12rf1od9oetnbbb/Afil-Reel-1-Editor.mp4?rlkey=z2xpmlfyqvw81rtvhnrksfuvv&st=6mz2zl16&dl=0",
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
