# Hướng dẫn xử lý Media URLs trong Rich Text Editor (Server-side)

## Cơ chế hoạt động

Khi user thêm ảnh/video vào Rich Text Editor:
1. File được lưu vào `formRef.current.images/videos` dưới dạng `{file: File, tempUrl: string}`
2. Temporary object URL (blob URL) được hiển thị trong editor
3. Note HTML chứa các temp URLs này: `blob:http://localhost:3000/abc123`

Khi submit form:
1. Client gửi lên server:
   - `note` HTML (chứa temp URLs)
   - `imageFiles[]` - array các File objects
   - `videoFiles[]` - array các File objects  
   - `imageTempUrls[]` - array các temp URLs tương ứng
   - `videoTempUrls[]` - array các temp URLs tương ứng

2. Server xử lý:
   - Upload từng file lên cloud (Dropbox, S3, etc.)
   - Map cloud URL với temp URL (theo thứ tự)
   - Replace tất cả temp URLs trong note HTML bằng cloud URLs
   - Lưu note HTML đã được replace vào database

## Cấu trúc dữ liệu gửi lên server

```typescript
// FormData structure
const formData = new FormData();

// 1. Job data (JSON)
formData.append('job', JSON.stringify({
  caseName: "...",
  note: "<p>Hello</p><img src='blob:http://localhost:3000/abc123' />",
  // ... other fields
}));

// 2. Image files
imageFiles.forEach((file, index) => {
  formData.append('images', file);
});

// 3. Video files
videoFiles.forEach((file, index) => {
  formData.append('videos', file);
});

// 4. Temp URLs mapping (JSON arrays)
formData.append('imageTempUrls', JSON.stringify([
  "blob:http://localhost:3000/abc123",
  "blob:http://localhost:3000/def456"
]));

formData.append('videoTempUrls', JSON.stringify([
  "blob:http://localhost:3000/xyz789"
]));
```

## Implementation phía Server

### Bước 1: Nhận data từ FormData

```typescript
// Express.js + Multer example
router.post('/api/jobs', upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'videos', maxCount: 10 }
]), async (req, res) => {
  const job = JSON.parse(req.body.job);
  const imageFiles = req.files['images'] || [];
  const videoFiles = req.files['videos'] || [];
  const imageTempUrls = JSON.parse(req.body.imageTempUrls || '[]');
  const videoTempUrls = JSON.parse(req.body.videoTempUrls || '[]');

  // Process...
});
```

### Bước 2: Upload files lên cloud và map URLs

```typescript
async function processMediaUpload(
  noteHtml: string,
  imageFiles: File[],
  videoFiles: File[],
  imageTempUrls: string[],
  videoTempUrls: string[]
): Promise<string> {
  let updatedNote = noteHtml;

  // Upload images và replace URLs
  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const tempUrl = imageTempUrls[i];

    // Upload lên cloud
    const cloudUrl = await uploadToDropbox(file); // hoặc S3, etc.

    // Replace temp URL bằng cloud URL trong HTML
    // Escape special regex characters
    const escapedTempUrl = tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updatedNote = updatedNote.replace(new RegExp(escapedTempUrl, 'g'), cloudUrl);
  }

  // Upload videos và replace URLs
  for (let i = 0; i < videoFiles.length; i++) {
    const file = videoFiles[i];
    const tempUrl = videoTempUrls[i];

    const cloudUrl = await uploadToDropbox(file);
    const escapedTempUrl = tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    updatedNote = updatedNote.replace(new RegExp(escapedTempUrl, 'g'), cloudUrl);
  }

  return updatedNote;
}
```

### Bước 3: Sử dụng trong API handler

```typescript
router.post('/api/jobs', upload.fields([
  { name: 'images', maxCount: 20 },
  { name: 'videos', maxCount: 10 }
]), async (req, res) => {
  try {
    const job = JSON.parse(req.body.job);
    const imageFiles = req.files['images'] || [];
    const videoFiles = req.files['videos'] || [];
    const imageTempUrls = JSON.parse(req.body.imageTempUrls || '[]');
    const videoTempUrls = JSON.parse(req.body.videoTempUrls || '[]');

    // Replace temp URLs với cloud URLs
    const updatedNote = await processMediaUpload(
      job.note,
      imageFiles,
      videoFiles,
      imageTempUrls,
      videoTempUrls
    );

    // Save vào database với note đã được replace
    const newJob = await JobModel.create({
      ...job,
      note: updatedNote // <-- Dùng updatedNote
    });

    res.json({ success: true, job: newJob });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});
```

## Ví dụ cụ thể

### Input từ Client

**Note HTML:**
```html
<p>Xem ảnh bên dưới:</p>
<img src="blob:http://localhost:3000/abc123" class="rich-editor-image" />
<p>Và video:</p>
<video src="blob:http://localhost:3000/xyz789" class="rich-editor-video"></video>
```

**Data gửi lên:**
- `imageFiles[0]` = File object (image1.jpg)
- `imageTempUrls[0]` = "blob:http://localhost:3000/abc123"
- `videoFiles[0]` = File object (video1.mp4)
- `videoTempUrls[0]` = "blob:http://localhost:3000/xyz789"

### Output từ Server

**Sau khi upload lên Dropbox:**
- `image1.jpg` → `https://dropbox.com/s/abc/image1.jpg`
- `video1.mp4` → `https://dropbox.com/s/xyz/video1.mp4`

**Note HTML sau replace:**
```html
<p>Xem ảnh bên dưới:</p>
<img src="https://dropbox.com/s/abc/image1.jpg" class="rich-editor-image" />
<p>Và video:</p>
<video src="https://dropbox.com/s/xyz/video1.mp4" class="rich-editor-video"></video>
```

**Lưu vào database:**
```sql
INSERT INTO jobs (note, ...) VALUES (
  '<p>Xem ảnh bên dưới:</p><img src="https://dropbox.com/s/abc/image1.jpg"...',
  ...
);
```

## Ưu điểm của approach này

1. **Client đơn giản**: Chỉ cần gửi files và temp URLs, không cần xử lý replace
2. **Server control**: Server kiểm soát hoàn toàn việc upload và replace URLs
3. **Atomic operation**: Upload + replace + save đều ở một nơi, dễ rollback nếu lỗi
4. **Security**: Client không cần biết cloud URLs, server quyết định nơi lưu trữ
5. **Consistency**: Đảm bảo note HTML luôn consistent với files đã upload

## Error Handling

```typescript
async function processMediaUpload(...) {
  const uploadedFiles = []; // Track uploaded files for cleanup
  
  try {
    // Upload and replace...
    
    return updatedNote;
  } catch (error) {
    // Rollback: delete đã uploaded files nếu có lỗi
    for (const cloudUrl of uploadedFiles) {
      await deleteFromCloud(cloudUrl);
    }
    throw error;
  }
}
```

## Testing

```typescript
// Test với mock data
const testNote = '<img src="blob:test123" />';
const testImageFiles = [mockFile1];
const testImageTempUrls = ['blob:test123'];

const result = await processMediaUpload(
  testNote,
  testImageFiles,
  [],
  testImageTempUrls,
  []
);

// Result should contain cloud URL instead of blob URL
expect(result).toContain('https://dropbox.com/');
expect(result).not.toContain('blob:test123');
```
