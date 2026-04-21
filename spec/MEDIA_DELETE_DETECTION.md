# Media Delete Detection Guide

## Vấn đề (Problem)

Khi người dùng edit nội dung trong Rich Text Editor và xóa một media (img hoặc video) mà URL này đã được upload lên cloud storage, làm sao để nhận biết file nào bị xóa để có thể xóa file tương ứng trên server?

### Ngữ cảnh
- **Note HTML**: Lưu trữ dạng HTML với các thẻ `<img>` và `<video>` đã có URL cloud
- **fileStorages**: Array chứa metadata của tất cả files đã upload (id, folderPath, dropboxLink, isImage, etc.)
- **Vấn đề**: Khi user xóa media trong editor, không có cách nào để biết file nào cần xóa trên server

## Giải pháp (Solution)

### Chiến lược: So sánh HTML trước và sau khi edit

1. **Parse HTML hiện tại**: Extract tất cả URLs từ thẻ `<img>` và `<video>` trong note HTML
2. **So sánh với existingFiles**: Check xem URL nào từ `fileStorages` không còn xuất hiện trong HTML mới
3. **Tạo danh sách xóa**: Các file có URL không còn trong HTML sẽ được thêm vào `fileStoragesNeedRemove`
4. **Gửi lên server**: Server nhận list files cần xóa và thực hiện cleanup

## Implementation

### 1. Function Parse HTML URLs

```typescript
// Helper function to extract all media URLs from HTML content
const extractMediaUrlsFromHtml = useCallback((html: string): string[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const urls: string[] = [];

  // Extract from img tags
  const images = doc.querySelectorAll("img");
  images.forEach((img) => {
    const src = img.getAttribute("src");
    // Bỏ qua blob URLs và data URLs (temp preview URLs)
    if (src && !src.startsWith("blob:") && !src.startsWith("data:")) {
      urls.push(src);
    }
  });

  // Extract from video tags
  const videos = doc.querySelectorAll("video");
  videos.forEach((video) => {
    const src = video.getAttribute("src");
    if (src && !src.startsWith("blob:") && !src.startsWith("data:")) {
      urls.push(src);
    }
  });

  // Extract from source tags inside video
  const sources = doc.querySelectorAll("video source");
  sources.forEach((source) => {
    const src = source.getAttribute("src");
    if (src && !src.startsWith("blob:") && !src.startsWith("data:")) {
      urls.push(src);
    }
  });

  return urls;
}, []);
```

### 2. Detect Removed Files trong handleSubmit

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // ... existing code ...
  
  const { note } = formRef.current;
  
  // Detect removed files: So sánh URLs trong HTML với existingFiles
  let filesToRemove: FileStorage[] = [];
  if (isEditingRef.current && existingFiles.length > 0) {
    // Extract all media URLs from current note HTML
    const currentUrls = extractMediaUrlsFromHtml(note);
    console.log("Current URLs in HTML:", currentUrls);
    console.log("Existing files:", existingFiles);

    // Find files that are no longer in the HTML
    filesToRemove = existingFiles.filter((file) => {
      // Check if this file's URL is still in the HTML
      const fileUrl = file.dropboxLink;
      // Use flexible matching: check both directions
      const isStillInHtml = currentUrls.some((url) => 
        url.includes(fileUrl) || fileUrl.includes(url)
      );
      return !isStillInHtml;
    });

    console.log("Files to remove:", filesToRemove);

    // Merge with manually removed files (if any UI for manual removal)
    filesToRemove = [...filesToRemove, ...removedFileStorages];
  }
  
  // Pass filesToRemove to API
  onSubmit(
    {
      id: editingJob.id,
      // ... other fields ...
      fileStoragesNeedRemove: filesToRemove.length > 0 ? filesToRemove : undefined,
    },
    imageFiles,
    videoFiles,
    imageTempUrls,
    videoTempUrls
  );
};
```

### 3. State Management

```typescript
// State for existing fileStorages from server
const [existingFiles, setExistingFiles] = useState<FileStorage[]>([]);
// State for files that need to be removed
const [removedFileStorages, setRemovedFileStorages] = useState<FileStorage[]>([]);

// Load existing files when editing job
useEffect(() => {
  if (editingJob) {
    if (editingJob.fileStorages && editingJob.fileStorages.length > 0) {
      setExistingFiles(editingJob.fileStorages);
    } else {
      setExistingFiles([]);
    }
    setRemovedFileStorages([]);
  } else {
    setExistingFiles([]);
    setRemovedFileStorages([]);
  }
}, [editingJob, open]);
```

### 4. Type Definition

Đã có sẵn trong `jobs.tsx`:

```typescript
export interface FileStorage {
  id: number;
  folderPath: string;
  dropboxLink: string;
  isImage: boolean;
  isJobFile: boolean;
  jobId: number | null;
  videoId: number | null;
}

export interface JobRequest {
  // ... other fields ...
  fileStoragesNeedRemove?: FileStorage[];
}
```

### 5. API FormData

Đã implement trong `JobApi.tsx`:

```typescript
const buildJobFormData = (data: JobRequest, images?, videos?, imageTempUrls?, videoTempUrls?) => {
  const formData = new FormData();
  
  // ... append other fields ...
  
  // Append fileStoragesNeedRemove as JSON string
  if (data.fileStoragesNeedRemove && data.fileStoragesNeedRemove.length > 0) {
    formData.append("fileStoragesNeedRemove", JSON.stringify(data.fileStoragesNeedRemove));
  }
  
  return formData;
};
```

## Server-Side Implementation

### 1. Parse Request

```typescript
// Example Express.js/Node.js
app.put("/admin/jobs/update/:id", upload.fields([...]), async (req, res) => {
  const fileStoragesNeedRemove = req.body.fileStoragesNeedRemove 
    ? JSON.parse(req.body.fileStoragesNeedRemove) 
    : [];
  
  console.log("Files to remove:", fileStoragesNeedRemove);
  
  // ... rest of update logic ...
});
```

### 2. Delete Files from Cloud Storage

```typescript
// For each file to remove
for (const fileStorage of fileStoragesNeedRemove) {
  try {
    // Delete from Dropbox/S3/Cloud Storage
    await cloudStorage.deleteFile(fileStorage.folderPath);
    
    // Delete record from database
    await db.fileStorage.delete({ where: { id: fileStorage.id } });
    
    console.log(`Deleted file: ${fileStorage.dropboxLink}`);
  } catch (error) {
    console.error(`Failed to delete file ${fileStorage.id}:`, error);
  }
}
```

### 3. Update Note HTML

Server cũng cần:
1. Upload new media files (images, videos)
2. Replace temp URLs trong note HTML với cloud URLs
3. Delete các files không còn dùng
4. Update note HTML đã được replace vào database

```typescript
// 1. Upload new files
const uploadedImageUrls = await uploadFiles(req.files.images);
const uploadedVideoUrls = await uploadFiles(req.files.videos);

// 2. Replace temp URLs với cloud URLs
let updatedNoteHtml = req.body.note;
const imageTempUrls = JSON.parse(req.body.imageTempUrls || "[]");
const videoTempUrls = JSON.parse(req.body.videoTempUrls || "[]");

imageTempUrls.forEach((tempUrl, index) => {
  if (uploadedImageUrls[index]) {
    updatedNoteHtml = updatedNoteHtml.replace(
      new RegExp(escapeRegex(tempUrl), 'g'),
      uploadedImageUrls[index]
    );
  }
});

// 3. Delete unused files
for (const fileStorage of fileStoragesNeedRemove) {
  await deleteFileFromCloud(fileStorage);
}

// 4. Save updated note
await db.job.update({
  where: { id: jobId },
  data: { note: updatedNoteHtml }
});
```

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ User edits Rich Text Editor                                 │
│ - Adds new images/videos → stored in formRef with tempUrls  │
│ - Deletes existing images/videos → removed from HTML        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ handleSubmit triggered                                       │
│ 1. Extract new files: imageFiles[], videoFiles[]            │
│ 2. Extract tempUrls: imageTempUrls[], videoTempUrls[]       │
│ 3. Parse note HTML to find current URLs                     │
│ 4. Compare with existingFiles (fileStorages)                │
│ 5. Files not in HTML → filesToRemove[]                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FormData sent to server:                                    │
│ - note: HTML with temp URLs                                 │
│ - images: File[]                                             │
│ - videos: File[]                                             │
│ - imageTempUrls: string[] (JSON)                            │
│ - videoTempUrls: string[] (JSON)                            │
│ - fileStoragesNeedRemove: FileStorage[] (JSON)              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Server processing:                                           │
│ 1. Parse FormData                                            │
│ 2. Upload new files to cloud (images, videos)               │
│ 3. Get cloud URLs                                            │
│ 4. Replace tempUrls with cloud URLs in note HTML            │
│ 5. Delete files in fileStoragesNeedRemove from cloud        │
│ 6. Delete fileStorage records from database                 │
│ 7. Save updated note HTML to database                       │
└─────────────────────────────────────────────────────────────┘
```

## Ưu điểm (Advantages)

✅ **Tự động phát hiện**: Không cần user action, tự động detect khi submit
✅ **Chính xác**: So sánh URLs trong HTML với database records
✅ **An toàn**: Chỉ xóa files thực sự không còn dùng
✅ **Dễ maintain**: Logic rõ ràng, dễ debug với console.log
✅ **Flexible matching**: Hỗ trợ nhiều dạng URL (relative, absolute, with params)

## Lưu ý (Notes)

### URL Matching Strategy

```typescript
// Flexible matching vì URL có thể có dạng khác nhau:
// - fileUrl: "https://dropbox.com/s/abc123/image.jpg"
// - url trong HTML: "/api/files/abc123" hoặc full URL

const isStillInHtml = currentUrls.some((url) => 
  url.includes(fileUrl) || fileUrl.includes(url)
);
```

### Ignore Temporary URLs

```typescript
// Bỏ qua blob URLs (temp preview) và data URLs
if (src && !src.startsWith("blob:") && !src.startsWith("data:")) {
  urls.push(src);
}
```

### Console Logging

Để debug, đã thêm console.log ở các điểm quan trọng:
- Current URLs in HTML
- Existing files from database
- Files to remove

### Error Handling

Server nên handle errors khi delete fails:

```typescript
try {
  await cloudStorage.deleteFile(fileStorage.folderPath);
} catch (error) {
  // Log error nhưng không block việc update job
  console.error(`Failed to delete file ${fileStorage.id}:`, error);
  // Optional: Mark file for retry cleanup later
}
```

## Testing Checklist

- [ ] Test xóa 1 image từ editor → verify file bị xóa trên server
- [ ] Test xóa 1 video từ editor → verify file bị xóa trên server
- [ ] Test xóa multiple media → verify tất cả files bị xóa
- [ ] Test edit nhưng không xóa media nào → fileStoragesNeedRemove should be empty
- [ ] Test add new media + xóa old media → new files uploaded, old files deleted
- [ ] Test với URL có query params hoặc relative paths
- [ ] Test với media có special characters trong URL
- [ ] Check console logs để verify URLs được extract đúng
- [ ] Verify database records được cleanup sau khi xóa

## Related Files

- **job-form.tsx**: Client-side logic for detecting removed files
- **JobApi.tsx**: API calls with FormData containing fileStoragesNeedRemove
- **jobs.tsx** (types): FileStorage và JobRequest interfaces
- **Jobs.tsx** (Redux): UpdateJobAction passing fileStoragesNeedRemove
- **Server**: Backend logic to process fileStoragesNeedRemove and delete files

## Tham khảo

- [MEDIA_URL_REPLACEMENT_GUIDE.md](./MEDIA_URL_REPLACEMENT_GUIDE.md) - Hướng dẫn replace temp URLs with cloud URLs
- [JOB_FORM_GUIDE.md](./JOB_FORM_GUIDE.md) - Hướng dẫn tổng quan về Job Form
