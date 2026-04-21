/**
 * EXAMPLE: Helper function để upload media files từ Rich Text Editor lên cloud storage
 * 
 * File này chứa code mẫu để bạn tham khảo và customize theo backend API của bạn.
 * Uncomment và chỉnh sửa theo nhu cầu thực tế.
 */

import { axiosInstance } from "@/lib/utils/axios-instance";

/**
 * Upload một file media (image hoặc video) lên server/cloud
 * 
 * @param file - File object từ browser (image hoặc video)
 * @param type - Loại file ('image' | 'video')
 * @returns Promise<string> - URL của file sau khi upload thành công
 * 
 * @example
 * ```tsx
 * <RichTextEditor
 *   value={note}
 *   onChange={setNote}
 *   onMediaUpload={uploadRichEditorMedia}
 * />
 * ```
 */
export async function uploadRichEditorMedia(
  file: File,
  type: 'image' | 'video'
): Promise<string> {
  try {
    // 1. Tạo FormData để gửi file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('source', 'rich-editor'); // để server biết file từ đâu

    // 2. Gọi API upload (THAY ĐỔI ENDPOINT THEO BACKEND CỦA BẠN)
    const response = await axiosInstance.post<{
      success: boolean;
      data: {
        url: string;          // URL công khai của file
        fileName: string;     // Tên file trên server
        fileSize: number;     // Kích thước file
        fileType: string;     // MIME type
      };
    }>('/api/upload-rich-editor-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Có thể thêm progress tracking
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    // 3. Kiểm tra response và trả về URL
    if (response.data.success && response.data.data.url) {
      return response.data.data.url;
    } else {
      throw new Error('Upload response không hợp lệ');
    }
  } catch (error: any) {
    console.error('Upload media failed:', error);
    
    // Có thể customize error message
    if (error.response?.status === 413) {
      throw new Error('File quá lớn. Vui lòng chọn file nhỏ hơn.');
    } else if (error.response?.status === 415) {
      throw new Error('Định dạng file không được hỗ trợ.');
    } else {
      throw new Error('Không thể tải file lên. Vui lòng thử lại.');
    }
  }
}

/**
 * ALTERNATIVE: Upload với validation trước khi gửi
 */
export async function uploadRichEditorMediaWithValidation(
  file: File,
  type: 'image' | 'video'
): Promise<string> {
  // Validate file size (ví dụ: max 10MB cho image, 50MB cho video)
  const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(
      `File quá lớn. ${type === 'image' ? 'Ảnh' : 'Video'} tối đa ${maxSize / (1024 * 1024)}MB`
    );
  }

  // Validate file type
  const allowedTypes = type === 'image' 
    ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    : ['video/mp4', 'video/webm', 'video/quicktime'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Định dạng ${file.type} không được hỗ trợ`);
  }

  // Proceed with upload
  return uploadRichEditorMedia(file, type);
}

/**
 * BACKEND API EXAMPLE (Node.js/Express):
 * 
 * ```javascript
 * // routes/upload.js
 * const multer = require('multer');
 * const { Dropbox } = require('dropbox');
 * 
 * const upload = multer({ storage: multer.memoryStorage() });
 * 
 * router.post('/upload-rich-editor-media', upload.single('file'), async (req, res) => {
 *   try {
 *     const file = req.file;
 *     const type = req.body.type;
 *     
 *     // Upload to Dropbox (hoặc S3, Azure Blob, etc.)
 *     const dbx = new Dropbox({ accessToken: process.env.DROPBOX_TOKEN });
 *     
 *     const timestamp = Date.now();
 *     const fileName = `${type}s/${timestamp}_${file.originalname}`;
 *     
 *     const uploadResponse = await dbx.filesUpload({
 *       path: `/${fileName}`,
 *       contents: file.buffer,
 *     });
 *     
 *     // Tạo shared link
 *     const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
 *       path: uploadResponse.result.path_display,
 *     });
 *     
 *     // Convert sang direct link
 *     const url = sharedLinkResponse.result.url.replace('?dl=0', '?raw=1');
 *     
 *     res.json({
 *       success: true,
 *       data: {
 *         url,
 *         fileName: file.originalname,
 *         fileSize: file.size,
 *         fileType: file.mimetype,
 *       },
 *     });
 *   } catch (error) {
 *     console.error('Upload error:', error);
 *     res.status(500).json({ success: false, error: error.message });
 *   }
 * });
 * ```
 */

/**
 * USAGE TRONG JOB FORM:
 * 
 * ```tsx
 * import { uploadRichEditorMedia } from '@/lib/rich-editor-media-upload';
 * 
 * function JobForm() {
 *   const [note, setNote] = useState('');
 *   
 *   return (
 *     <RichTextEditor
 *       value={note}
 *       onChange={setNote}
 *       onMediaUpload={uploadRichEditorMedia}
 *       placeholder="Nhập ghi chú với ảnh, video..."
 *     />
 *   );
 * }
 * ```
 * 
 * SAU KHI SUBMIT FORM:
 * - HTML trong `note` sẽ chứa URLs: <img src="https://dropbox.com/...">
 * - Lưu HTML này vào database như bình thường
 * - Khi hiển thị, browser sẽ load ảnh/video từ URL
 */
