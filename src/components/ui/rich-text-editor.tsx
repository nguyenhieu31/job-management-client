"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Youtube from "@tiptap/extension-youtube";
import { Node } from "@tiptap/core";
import { useCallback, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImageIcon,
  Video,
  Undo,
  Redo,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Minus,
  Unlink,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Rich Text Editor với TipTap
 * 
 * HƯỚNG DẪN SỬ DỤNG VỚI UPLOAD MEDIA:
 * 
 * 1. Tạo handler function để upload file lên server/cloud:
 * 
 * ```typescript
 * const handleMediaUpload = async (file: File, type: 'image' | 'video'): Promise<string> => {
 *   // Tạo FormData để gửi file
 *   const formData = new FormData();
 *   formData.append('file', file);
 *   formData.append('type', type);
 *   
 *   try {
 *     // Gọi API upload của bạn (ví dụ upload lên Dropbox, S3, etc.)
 *     const response = await axiosInstance.post('/api/upload-media', formData, {
 *       headers: {
 *         'Content-Type': 'multipart/form-data',
 *       },
 *     });
 *     
 *     // Trả về URL từ server
 *     return response.data.url; // ví dụ: "https://storage.example.com/image123.jpg"
 *   } catch (error) {
 *     console.error('Upload failed:', error);
 *     throw error;
 *   }
 * };
 * ```
 * 
 * 2. Sử dụng trong component:
 * 
 * ```typescript
 * <RichTextEditor
 *   value={note}
 *   onChange={setNote}
 *   onMediaUpload={handleMediaUpload}
 *   placeholder="Nhập ghi chú..."
 * />
 * ```
 * 
 * 3. Nếu KHÔNG truyền `onMediaUpload`, file sẽ được embed dưới dạng base64 
 *    (không khuyến nghị cho production vì làm HTML rất nặng)
 * 
 * 4. Khi có `onMediaUpload`:
 *    - File được upload ngay khi user add (paste/drop/upload)
 *    - URL từ cloud được insert vào editor
 *    - HTML chỉ chứa URL, không chứa base64
 *    - Giảm kích thước database và tăng performance
 */

// Custom Video Extension for HTML5 video
const VideoExtension = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
      width: {
        default: "100%",
      },
      height: {
        default: "auto",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "video",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", { ...HTMLAttributes, class: "rich-editor-video" }, ["source", { src: HTMLAttributes.src }]];
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});

// Extend Commands type to include our custom command
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  minHeight?: string;
  /**
   * Callback to upload media files to cloud storage.
   * If provided, files will be uploaded immediately and URL will be inserted.
   * If not provided, files will be embedded as base64 (not recommended for production).
   * 
   * @param file - The file to upload (image or video)
   * @param type - Type of media ('image' | 'video')
   * @returns Promise<string> - The cloud URL of the uploaded file
   */
  onMediaUpload?: (file: File, type: 'image' | 'video') => Promise<string>;
}

const MenuButton = ({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "p-1.5 rounded-md transition-colors hover:bg-gray-200 dark:hover:bg-gray-700",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      isActive && "bg-gray-200 dark:bg-gray-700 text-primary",
    )}
  >
    {children}
  </button>
);

const ToolbarDivider = () => (
  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
);

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Nhập nội dung...",
  className,
  editable = true,
  minHeight = "150px",
  onMediaUpload,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rich-editor-image",
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "rich-editor-link",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: "rich-editor-youtube",
        },
      }),
      VideoExtension,
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // If editor is empty (only has empty paragraph), return empty string
      const isEmpty = editor.isEmpty;
      onChange?.(isEmpty ? "" : html);
    },
    editorProps: {
      attributes: {
        class: "rich-editor-content outline-none",
        style: `min-height: ${minHeight}`,
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const files = Array.from(event.dataTransfer.files);
          const imageFiles = files.filter((f) => f.type.startsWith("image/"));
          const videoFiles = files.filter((f) => f.type.startsWith("video/"));
          
          if (imageFiles.length > 0) {
            event.preventDefault();
            imageFiles.forEach(async (file) => {
              if (onMediaUpload) {
                try {
                  const url = await onMediaUpload(file, 'image');
                  editor?.chain().focus().setImage({ src: url }).run();
                } catch (error) {
                  console.error('Failed to upload image:', error);
                }
              } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const src = e.target?.result as string;
                  editor?.chain().focus().setImage({ src }).run();
                };
                reader.readAsDataURL(file);
              }
            });
            return true;
          }
          
          if (videoFiles.length > 0) {
            event.preventDefault();
            videoFiles.forEach(async (file) => {
              if (onMediaUpload) {
                try {
                  const url = await onMediaUpload(file, 'video');
                  editor?.commands.setVideo({ src: url });
                } catch (error) {
                  console.error('Failed to upload video:', error);
                }
              } else {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const src = e.target?.result as string;
                  editor?.commands.setVideo({ src });
                };
                reader.readAsDataURL(file);
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                if (onMediaUpload) {
                  onMediaUpload(file, 'image').then(url => {
                    editor?.chain().focus().setImage({ src: url }).run();
                  }).catch(error => {
                    console.error('Failed to upload image:', error);
                  });
                } else {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const src = e.target?.result as string;
                    editor?.chain().focus().setImage({ src }).run();
                  };
                  reader.readAsDataURL(file);
                }
              }
              return true;
            }
            if (item.type.startsWith("video/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                if (onMediaUpload) {
                  onMediaUpload(file, 'video').then(url => {
                    editor?.commands.setVideo({ src: url });
                  }).catch(error => {
                    console.error('Failed to upload video:', error);
                  });
                } else {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const src = e.target?.result as string;
                    editor?.commands.setVideo({ src });
                  };
                  reader.readAsDataURL(file);
                }
              }
              return true;
            }
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      // Only update if the content is actually different (avoid cursor jump)
      if (value === "" && !editor.isEmpty) {
        editor.commands.clearContent();
      } else if (value && currentContent !== value) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  const addImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !editor) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("image/")) {
          if (onMediaUpload) {
            // Upload to cloud and get URL
            try {
              const url = await onMediaUpload(file, 'image');
              editor.chain().focus().setImage({ src: url }).run();
            } catch (error) {
              console.error('Failed to upload image:', error);
              alert('Không thể tải ảnh lên. Vui lòng thử lại.');
            }
          } else {
            // Fallback to base64 if no upload handler provided
            const reader = new FileReader();
            reader.onload = (event) => {
              const src = event.target?.result as string;
              editor.chain().focus().setImage({ src }).run();
            };
            reader.readAsDataURL(file);
          }
        }
      }

      // Reset file input
      e.target.value = "";
    },
    [editor, onMediaUpload],
  );

  const addImageFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Nhập URL hình ảnh:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const addYoutubeVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Nhập URL video YouTube:");
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: 480,
        height: 270,
      });
    }
  }, [editor]);

  const addVideo = useCallback(() => {
    videoInputRef.current?.click();
  }, []);

  const handleVideoFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !editor) return;

      for (const file of Array.from(files)) {
        if (file.type.startsWith("video/")) {
          if (onMediaUpload) {
            // Upload to cloud and get URL
            try {
              const url = await onMediaUpload(file, 'video');
              editor.commands.setVideo({ src: url });
            } catch (error) {
              console.error('Failed to upload video:', error);
              alert('Không thể tải video lên. Vui lòng thử lại.');
            }
          } else {
            // Fallback to base64 if no upload handler provided
            const reader = new FileReader();
            reader.onload = (event) => {
              const src = event.target?.result as string;
              editor.commands.setVideo({ src });
            };
            reader.readAsDataURL(file);
          }
        }
      }

      // Reset file input
      e.target.value = "";
    },
    [editor, onMediaUpload],
  );

  const addVideoFromUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Nhập URL video (MP4, WebM, etc.):");
    if (url) {
      editor.commands.setVideo({ src: url });
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập URL liên kết:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const setColor = useCallback(() => {
    if (!editor) return;
    const color = window.prompt("Nhập mã màu (ví dụ: #ff0000, red):");
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  }, [editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "border rounded-md p-3 bg-muted/30 animate-pulse",
          className,
        )}
        style={{ minHeight }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rich-text-editor border rounded-md overflow-hidden bg-background",
        className,
      )}
    >
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden file input for video upload */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleVideoFileChange}
        className="hidden"
      />

      {/* Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/30">
          {/* Undo/Redo */}
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </MenuButton>

          <ToolbarDivider />

          {/* Headings */}
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive("heading", { level: 1 })}
            title="Tiêu đề 1"
          >
            <Heading1 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive("heading", { level: 2 })}
            title="Tiêu đề 2"
          >
            <Heading2 className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive("heading", { level: 3 })}
            title="Tiêu đề 3"
          >
            <Heading3 className="h-4 w-4" />
          </MenuButton>

          <ToolbarDivider />

          {/* Text formatting */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Đậm (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Nghiêng (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Gạch chân (Ctrl+U)"
          >
            <UnderlineIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Gạch ngang"
          >
            <Strikethrough className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Code"
          >
            <Code className="h-4 w-4" />
          </MenuButton>

          <ToolbarDivider />

          {/* Text color */}
          <MenuButton onClick={setColor} title="Màu chữ">
            <Palette className="h-4 w-4" />
          </MenuButton>

          <ToolbarDivider />

          {/* Alignment */}
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Căn trái"
          >
            <AlignLeft className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Căn giữa"
          >
            <AlignCenter className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Căn phải"
          >
            <AlignRight className="h-4 w-4" />
          </MenuButton>

          <ToolbarDivider />

          {/* Lists */}
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="Danh sách dấu đầu dòng"
          >
            <List className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="Danh sách đánh số"
          >
            <ListOrdered className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Trích dẫn"
          >
            <Quote className="h-4 w-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Đường kẻ ngang"
          >
            <Minus className="h-4 w-4" />
          </MenuButton>

          <ToolbarDivider />

          {/* Link */}
          <MenuButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            title="Chèn liên kết"
          >
            <LinkIcon className="h-4 w-4" />
          </MenuButton>
          {editor.isActive("link") && (
            <MenuButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Xóa liên kết"
            >
              <Unlink className="h-4 w-4" />
            </MenuButton>
          )}

          <ToolbarDivider />

          {/* Media */}
          <MenuButton onClick={addImage} title="Tải ảnh lên">
            <ImageIcon className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={addImageFromUrl} title="Chèn ảnh từ URL">
            <ImageIcon className="h-4 w-4 text-blue-500" />
          </MenuButton>
          
          <ToolbarDivider />
          
          {/* Video */}
          <MenuButton onClick={addVideo} title="Tải video lên">
            <Film className="h-4 w-4" />
          </MenuButton>
          <MenuButton onClick={addVideoFromUrl} title="Chèn video từ URL">
            <Film className="h-4 w-4 text-purple-500" />
          </MenuButton>
          <MenuButton onClick={addYoutubeVideo} title="Chèn video YouTube">
            <Video className="h-4 w-4 text-red-500" />
          </MenuButton>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} className="p-3" />
    </div>
  );
}

export default RichTextEditor;
