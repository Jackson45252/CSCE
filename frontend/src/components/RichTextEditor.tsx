import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
        active
          ? "bg-nba-blue text-white"
          : "text-nba-muted hover:bg-nba-border hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, disabled }: Props) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const highlightInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g., when opening edit modal)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border border-nba-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-2 bg-nba-surface border-b border-nba-border">
        <ToolbarButton
          title="粗體 (Ctrl+B)"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          title="斜體 (Ctrl+I)"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          title="底線 (Ctrl+U)"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        >
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton
          title="刪除線"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <span className="line-through">S</span>
        </ToolbarButton>

        <span className="w-px h-5 bg-nba-border mx-1" />

        <ToolbarButton
          title="標題 H1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          title="標題 H2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          title="標題 H3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        >
          H3
        </ToolbarButton>

        <span className="w-px h-5 bg-nba-border mx-1" />

        <ToolbarButton
          title="無序清單"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          ≡
        </ToolbarButton>
        <ToolbarButton
          title="有序清單"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        >
          1≡
        </ToolbarButton>
        <ToolbarButton
          title="引言"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        >
          "
        </ToolbarButton>

        <span className="w-px h-5 bg-nba-border mx-1" />

        <ToolbarButton
          title="靠左"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        >
          ⬅
        </ToolbarButton>
        <ToolbarButton
          title="置中"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        >
          ↔
        </ToolbarButton>
        <ToolbarButton
          title="靠右"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        >
          ➡
        </ToolbarButton>

        <span className="w-px h-5 bg-nba-border mx-1" />

        {/* Text Color */}
        <div className="relative" title="文字顏色">
          <button
            type="button"
            onClick={() => colorInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded text-sm text-nba-muted hover:bg-nba-border hover:text-white transition-colors"
          >
            <span>A</span>
            <span
              className="w-3 h-1.5 rounded-sm"
              style={{ backgroundColor: editor.getAttributes("textStyle").color ?? "#ffffff" }}
            />
          </button>
          <input
            ref={colorInputRef}
            type="color"
            className="absolute opacity-0 w-0 h-0"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
        </div>

        {/* Highlight Color */}
        <div className="relative" title="螢光底色">
          <button
            type="button"
            onClick={() => highlightInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-1 rounded text-sm text-nba-muted hover:bg-nba-border hover:text-white transition-colors"
          >
            <span
              className="px-1 rounded"
              style={{ backgroundColor: editor.getAttributes("highlight").color ?? "#facc15" }}
            >
              H
            </span>
          </button>
          <input
            ref={highlightInputRef}
            type="color"
            defaultValue="#facc15"
            className="absolute opacity-0 w-0 h-0"
            onChange={(e) =>
              editor.chain().focus().setHighlight({ color: e.target.value }).run()
            }
          />
        </div>

        <ToolbarButton
          title="清除螢光底色"
          onClick={() => editor.chain().focus().unsetHighlight().run()}
          active={false}
        >
          ✕H
        </ToolbarButton>
        <ToolbarButton
          title="清除文字格式"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          active={false}
        >
          T✕
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="rich-editor min-h-48 px-4 py-3 text-white focus:outline-none"
      />

      <style>{`
        .rich-editor .tiptap {
          outline: none;
          min-height: 192px;
        }
        .rich-editor .tiptap h1 { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0; }
        .rich-editor .tiptap h2 { font-size: 1.375rem; font-weight: 600; margin: 0.5rem 0; }
        .rich-editor .tiptap h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0; }
        .rich-editor .tiptap p { margin: 0.25rem 0; }
        .rich-editor .tiptap ul { list-style: disc; padding-left: 1.5rem; }
        .rich-editor .tiptap ol { list-style: decimal; padding-left: 1.5rem; }
        .rich-editor .tiptap blockquote {
          border-left: 3px solid #1D428A;
          padding-left: 1rem;
          color: #8C8C96;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
