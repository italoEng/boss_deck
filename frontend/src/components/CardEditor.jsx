import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code} from "lucide-react";
import {Heading1, Heading2} from "lucide-react";

export default function CardEditor({ onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
   <div> 

        <button
        type="button"
        onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={`px-3 py-1 rounded ${
            editor?.isActive('heading', { level: 1 })
            ? 'bg-purple-600 text-white'
            : 'bg-gray-200'
        }`}
        >
            <Heading1 size={18} />
        </button>

        <button
            type="button"
            onClick={() =>
                editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`px-3 py-1 rounded ${
                editor?.isActive('heading', { level: 2 })
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200'
            }`}
            >
            <Heading2 size={18} />
            </button>

        <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded ${
                editor?.isActive('bold') 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            <Bold size={18} />
        </button>

        <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded ${
                editor?.isActive('italic') 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            <Italic size={18} />
        </button>

        <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1 rounded ${
                editor?.isActive('underline') 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            <Underline size={18} />
        </button>

        <button
            type="button"
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`px-3 py-1 rounded ${
                editor?.isActive('strike') 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            <Strikethrough size={18} />
        </button>

        <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()
            }
            className={`px-3 py-1 rounded ${
                editor?.isActive('bulletList') 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            <List size={18} />
        </button>

        <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded ${
                editor?.isActive('orderedList') 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            <ListOrdered size={18} />
        </button>

        <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1 rounded ${
                editor?.isActive('blockquote') 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            <Quote size={18} />
        </button>

        <button
            type="button"
            onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
            className={`px-3 py-1 rounded ${
                editor?.isActive('codeBlock') 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200'
            }`}
        >
            <Code size={18} />
        </button>

        <div className="border rounded-xl p-3 mb-3">
            <EditorContent editor={editor} />
        </div>
    </div>
  );
}