import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  X
} from 'lucide-react';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: any;
  onChange: (content: any, html: string) => void;
  onImageUpload: (file: File) => Promise<string>;
}

interface ImageCaptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string, caption: string, size: 'small' | 'medium' | 'large') => void;
  imageUrl: string;
}

function ImageCaptionModal({ isOpen, onClose, onInsert, imageUrl }: ImageCaptionModalProps) {
  const [caption, setCaption] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('medium');

  if (!isOpen) return null;

  const handleInsert = () => {
    onInsert(imageUrl, caption, size);
    setCaption('');
    setSize('medium');
  };

  return (
    <div className="image-modal-overlay">
      <div className="image-modal">
        <div className="image-modal-header">
          <h3>Insert Image</h3>
          <button onClick={onClose} className="image-modal-close">
            <X size={20} />
          </button>
        </div>
        <div className="image-modal-preview">
          <img src={imageUrl} alt="Preview" />
        </div>
        <div className="image-modal-field">
          <label>Caption (optional)</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter image caption..."
            data-testid="input-image-caption"
          />
        </div>
        <div className="image-modal-field">
          <label>Size</label>
          <div className="image-size-buttons">
            <button
              type="button"
              className={`size-button ${size === 'small' ? 'active' : ''}`}
              onClick={() => setSize('small')}
            >
              Small
            </button>
            <button
              type="button"
              className={`size-button ${size === 'medium' ? 'active' : ''}`}
              onClick={() => setSize('medium')}
            >
              Medium
            </button>
            <button
              type="button"
              className={`size-button ${size === 'large' ? 'active' : ''}`}
              onClick={() => setSize('large')}
            >
              Large
            </button>
          </div>
        </div>
        <div className="image-modal-actions">
          <button type="button" onClick={onClose} className="modal-cancel-button">
            Cancel
          </button>
          <button type="button" onClick={handleInsert} className="modal-insert-button">
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TiptapEditor({ content, onChange, onImageUpload }: TiptapEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'blog-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'blog-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
      Underline,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await onImageUpload(file);
        setImageModal({ isOpen: true, imageUrl: url });
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
    e.target.value = '';
  };

  const insertImage = (url: string, caption: string, size: 'small' | 'medium' | 'large') => {
    const sizeClass = `blog-image-${size}`;
    
    if (caption) {
      const figureHtml = `
        <figure class="blog-figure ${sizeClass}">
          <img src="${url}" alt="${caption}" class="blog-image" />
          <figcaption class="blog-image-caption">${caption}</figcaption>
        </figure>
      `;
      editor.chain().focus().insertContent(figureHtml).run();
    } else {
      editor.chain().focus().setImage({ src: url }).run();
      const currentNode = editor.state.selection.$anchor.parent;
      editor.chain().focus().updateAttributes('image', { class: `blog-image ${sizeClass}` }).run();
    }
    
    setImageModal({ isOpen: false, imageUrl: '' });
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="tiptap-editor-container">
      <div className="tiptap-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="toolbar-button"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="toolbar-button"
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
            title="Underline"
          >
            <UnderlineIcon size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-button ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Align Right"
          >
            <AlignRight size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
            title="Quote"
          >
            <Quote size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          {showLinkInput ? (
            <div className="link-input-container">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter URL..."
                className="link-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setLink();
                  }
                  if (e.key === 'Escape') {
                    setShowLinkInput(false);
                    setLinkUrl('');
                  }
                }}
                autoFocus
              />
              <button type="button" onClick={setLink} className="link-confirm-button">
                Add
              </button>
              <button 
                type="button" 
                onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} 
                className="link-cancel-button"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  if (editor.isActive('link')) {
                    removeLink();
                  } else {
                    setShowLinkInput(true);
                  }
                }}
                className={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
                title={editor.isActive('link') ? 'Remove Link' : 'Add Link'}
              >
                <LinkIcon size={18} />
              </button>
            </>
          )}
          
          <label className="toolbar-button image-upload-button" title="Insert Image">
            <ImageIcon size={18} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <EditorContent editor={editor} className="tiptap-content" />

      <ImageCaptionModal
        isOpen={imageModal.isOpen}
        onClose={() => setImageModal({ isOpen: false, imageUrl: '' })}
        onInsert={insertImage}
        imageUrl={imageModal.imageUrl}
      />
    </div>
  );
}
