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

      <EditorContent editor={editor} />
    </div>
  );
}