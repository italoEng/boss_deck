import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code, Palette} from "lucide-react";
import {Heading1, Heading2} from "lucide-react";
import { Table as TableIcon} from 'lucide-react';
import { BetweenHorizontalStart, BetweenHorizontalEnd } from "lucide-react";
import { BetweenVerticalStart, BetweenVerticalEnd } from "lucide-react";
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'

export default function CardEditor({ onChange, placeholder = "Digite o conteúdo..." }) {
    const editor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder })],
        content: "",
        editorProps: {
            attributes: {
            class: 'focus:outline-none min-h-[60px]',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            TextStyle,
            Color,
        ],
    });

return (
  <div>
    <div className="flex flex-wrap gap-1 mb-2">

      <button type="button"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <Heading1 size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <Heading2 size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded ${editor?.isActive('bold') ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <Bold size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded ${editor?.isActive('italic') ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <Italic size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={`px-3 py-1 rounded ${editor?.isActive('underline') ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <Underline size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className={`px-3 py-1 rounded ${editor?.isActive('strike') ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <Strikethrough size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded ${editor?.isActive('bulletList') ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <List size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded ${editor?.isActive('orderedList') ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <ListOrdered size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1 rounded ${editor?.isActive('blockquote') ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <Quote size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 rounded ${editor?.isActive('codeBlock') ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>
        <Code size={18} />
      </button>

      <button type="button"
        onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="px-3 py-1 rounded bg-gray-200"
        title="Inserir tabela">
        <TableIcon size={18} />
      </button>

      <label className="px-3 py-1 rounded bg-gray-200 cursor-pointer inline-flex items-center justify-center" title="Cor do texto">
        <span style={{ color: editor?.getAttributes('textStyle').color || '#000000' }} className="font-bold text-sm">
            <Palette size={18} />
        </span>
        <input
          type="color"
          onInput={e => editor?.chain().focus().setColor(e.target.value).run()}
          value={editor?.getAttributes('textStyle').color || '#000000'}
          className="w-0 h-0 opacity-0 absolute"
        />
      </label>

      {editor?.isActive('table') && (
        <>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-3 py-1 rounded bg-gray-200" title="Adicionar coluna">
            <BetweenHorizontalStart size={18} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-3 py-1 rounded bg-gray-200" title="Adicionar linha">
            <BetweenVerticalStart size={18} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-3 py-1 rounded bg-red-100 text-red-600" title="Deletar coluna">
            <BetweenHorizontalEnd size={18} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-3 py-1 rounded bg-red-100 text-red-600" title="Deletar linha">
            <BetweenVerticalEnd size={18} />
          </button>
        </>
      )}

    </div>

    <div className="border rounded-xl p-3 mb-3">
      <EditorContent editor={editor} />
    </div>
  </div>
);
}