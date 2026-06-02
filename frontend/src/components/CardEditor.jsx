import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function CardEditor({ onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-xl p-3 mb-3">

    <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className="border px-3 py-1 rounded mb-2">
        B
    </button>

    <button
        type="button"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className="border px-3 py-1 rounded mb-2">
        I
    </button>

    <button
        type="button"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className="border px-3 py-1 rounded mb-2">
        U
    </button>

    <button
        type="button"
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className="border px-3 py-1 rounded mb-2">
        S
    </button>

    <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className="border px-3 py-1 rounded mb-2">
        List
    </button>

    <button
        type="button"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className="border px-3 py-1 rounded mb-2">
        OL
    </button>

    <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        className="border px-3 py-1 rounded mb-2">
        Quote
    </button>

    <button
        type="button"
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        className="border px-3 py-1 rounded mb-2">
        Code
    </button>

      <EditorContent editor={editor} />
    </div>
  );
}