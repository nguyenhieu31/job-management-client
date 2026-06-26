export interface ServiceOption {
  id: string;
  label: string;
  subtitle: string;
}

export interface AddServiceFormState {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderNotes: string;
  selectedServices: string[];
  turnaround: string;
  videoStyle: string;
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

export const TURNAROUND_OPTIONS = [
  { value: "6h", label: "6 giờ" },
  { value: "12h", label: "12 giờ" },
  { value: "24h", label: "24 giờ" },
  { value: "48h", label: "48 giờ" },
  { value: "custom", label: "Tùy chỉnh" },
];

export const VIDEO_STYLE_OPTIONS = [
  { value: "clean-simple", label: "Clean & Simple" },
  { value: "luxury-cinematic", label: "Luxury & Cinematic" },
  { value: "fast-paced-social", label: "Fast-paced Social Media" },
  { value: "advertising-marketing", label: "Advertising / Marketing" },
  { value: "editor-decides", label: "Để editor tự quyết định" },
];

export const ASPECT_RATIO_OPTIONS = [
  { value: "9:16", label: "Dọc 9:16 (Instagram Reels / TikTok)" },
  { value: "16:9", label: "Ngang 16:9 (YouTube)" },
  { value: "1:1", label: "Vuông 1:1" },
  { value: "both", label: "Cả hai" },
];

export const MUSIC_OPTIONS = [
  { value: "i-will-provide", label: "Tôi sẽ cung cấp nhạc" },
  { value: "editor-chooses", label: "Để editor chọn nhạc" },
  { value: "no-music", label: "Không có nhạc" },
];

export const REALTOR_AGENT_OPTIONS = [
  { value: "talking-on-camera", label: "Talking agent on camera" },
  { value: "start-with-agent", label: "Start with agent" },
  { value: "end-with-agent", label: "End with agent" },
  { value: "agent-voice-over", label: "Agent voice-over" },
  { value: "no-agent", label: "No agent appearance" },
];

export const TEXT_CAPTIONS_OPTIONS = [
  { value: "captions", label: "Captions" },
  { value: "property-info", label: "Property information" },
  { value: "agent-info", label: "Agent information" },
  { value: "logo", label: "Logo" },
  { value: "contact-info", label: "Contact information" },
  { value: "social-media", label: "Social media handles" },
];

export const TRANSITIONS_OPTIONS = [
  { value: "minimal", label: "Minimal" },
  { value: "smooth", label: "Smooth" },
  { value: "advanced", label: "Advanced" },
  { value: "speed-ramp", label: "Speed Ramp" },
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

export const VIRTUAL_STAGING_ROOMS = [
  { value: "living-room", label: "Living Room" },
  { value: "dining-room", label: "Dining Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "office", label: "Office" },
  { value: "patio", label: "Patio" },
  { value: "outdoor-space", label: "Outdoor Space" },
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

export function getInitialFormState(): AddServiceFormState {
  return {
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    orderNotes: "",
    selectedServices: [],
    turnaround: "",
    videoStyle: "",
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
