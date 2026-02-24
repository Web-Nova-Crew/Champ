'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Quote,
  Undo,
  Redo
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Start writing...',
  className = ''
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Initialize content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if content is significantly different to avoid cursor jumping
      // This is a simple check, for a production app you'd want something more robust
      if (value === '' && editorRef.current.innerHTML === '<br>') return
      editorRef.current.innerHTML = value
    }
  }, []) // Run once on mount, we handle updates manually to avoid cursor issues

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const ToolbarButton = ({ 
    icon: Icon, 
    command, 
    arg, 
    title 
  }: { 
    icon: any, 
    command: string, 
    arg?: string, 
    title: string 
  }) => (
    <button
      type="button"
      onClick={() => execCommand(command, arg)}
      className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  const addLink = () => {
    const url = prompt('Enter URL:')
    if (url) execCommand('createLink', url)
  }

  const addImage = () => {
    const url = prompt('Enter Image URL:')
    if (url) execCommand('insertImage', url)
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton icon={Undo} command="undo" title="Undo" />
        <ToolbarButton icon={Redo} command="redo" title="Redo" />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton icon={Bold} command="bold" title="Bold" />
        <ToolbarButton icon={Italic} command="italic" title="Italic" />
        <ToolbarButton icon={Underline} command="underline" title="Underline" />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton icon={Heading1} command="formatBlock" arg="H2" title="Heading 1" />
        <ToolbarButton icon={Heading2} command="formatBlock" arg="H3" title="Heading 2" />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
        <ToolbarButton icon={Quote} command="formatBlock" arg="blockquote" title="Quote" />
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={addLink}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Insert Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        className="p-4 min-h-[300px] outline-none prose max-w-none"
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  )
}
