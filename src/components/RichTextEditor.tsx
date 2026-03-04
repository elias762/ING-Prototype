import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from 'lucide-react'

interface Props {
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  placeholder?: string
}

function RichTextEditor({ value, onChange, onBlur, placeholder }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onBlur: () => {
      onBlur?.()
    },
    editorProps: {
      attributes: {
        class: 'rich-text outline-none min-h-[80px] px-3 py-2 text-sm',
      },
    },
  })

  // Sync external value changes (e.g. when opening a different record)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  const btnClass = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active
        ? 'bg-brand/10 text-brand'
        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="w-full border border-gray-200 rounded-lg focus-within:ring-1 focus-within:ring-brand/30 focus-within:border-brand/40 transition-colors overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive('underline'))}
          title="Underline"
        >
          <UnderlineIcon size={15} />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={btnClass(editor.isActive('heading', { level: 1 }))}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </button>

        <div className="w-px h-4 bg-gray-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent editor={editor} />
        {editor.isEmpty && placeholder && (
          <p className="absolute top-2 left-3 text-sm text-gray-400 pointer-events-none">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  )
}

export default RichTextEditor
