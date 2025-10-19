export interface SystemSettings {
  id: number;
  folderPath: string;
  maxFileSize: number; // in MB
  allowedFileTypes: string[]; // e.g., ['jpg', 'png', 'pdf']
  updatedAt: Date;
  updatedBy: string;
}

export interface SettingsRequest {
  folderPath: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data?: SystemSettings;
}
