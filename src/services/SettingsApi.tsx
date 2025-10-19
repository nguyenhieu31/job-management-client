import type { SettingsRequest, SettingsResponse, SystemSettings } from "@/types/settings";

// Mock settings data
let mockSettings: SystemSettings = {
  id: 1,
  folderPath: "/home/user/jobs",
  maxFileSize: 500,
  allowedFileTypes: ["jpg", "png", "pdf", "xlsx", "docx"],
  updatedAt: new Date(),
  updatedBy: "admin@example.com",
};

export const getSettings = async (): Promise<SystemSettings> => {
  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockSettings;
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export const updateSettings = async (data: SettingsRequest): Promise<SettingsResponse> => {
  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    mockSettings = {
      ...mockSettings,
      ...data,
      updatedAt: new Date(),
      updatedBy: "manager@example.com",
    };

    return {
      success: true,
      message: "Cấu hình thư mục đã được cập nhật thành công",
      data: mockSettings,
    };
  } catch (err: any) {
    throw new Error(err.message);
  }
};
