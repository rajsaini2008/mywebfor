"use client"

import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function RichTextEditor({ value, onChange, className, placeholder = "Enter rich text content here..." }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(true)
  const [historyStack, setHistoryStack] = useState<string[]>([value])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [linkUrl, setLinkUrl] = useState('')
  const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [hasWhiteText, setHasWhiteText] = useState(false)
  
  // Available fonts
  const fonts = [
    { name: 'Default', value: 'inherit' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' }
  ]
  
  // Available sizes
  const sizes = [
    { name: 'Default', value: 'inherit' },
    { name: 'X-Small', value: '10px' },
    { name: 'Small', value: '12px' },
    { name: 'Medium', value: '16px' },
    { name: 'Large', value: '20px' },
    { name: 'X-Large', value: '24px' },
    { name: 'XX-Large', value: '32px' }
  ]
  
  // Available colors
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#ffffff' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Green', value: '#008000' },
    { name: 'Blue', value: '#0000ff' },
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Purple', value: '#800080' },
    { name: 'Orange', value: '#ffa500' },
    { name: 'Gray', value: '#808080' }
  ]

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && isEditing) {
      editorRef.current.innerHTML = value || placeholder
    }
    
    // Check for white text on initialization
    if (value) {
      const hasWhite = value.includes('color: #ffffff') || value.includes('color: rgb(255, 255, 255)');
      setHasWhiteText(hasWhite);
    }
  }, [value, isEditing, placeholder])

  // Update parent component when content changes
  const updateContent = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      if (content !== value) {
        onChange(content)
        
        // Add to history stack for undo/redo
        const newStack = historyStack.slice(0, historyIndex + 1)
        newStack.push(content)
        if (newStack.length > 50) newStack.shift() // Limit history size
        setHistoryStack(newStack)
        setHistoryIndex(newStack.length - 1)
      }
    }
  }

  // Execute document command for formatting
  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value)
    if (editorRef.current) editorRef.current.focus()
    
    // Track color changes
    if (command === 'foreColor') {
      setCurrentColor(value)
      if (value === '#ffffff') {
        setHasWhiteText(true)
      }
    }
    
    updateContent()
  }

  // Check for white text in content
  useEffect(() => {
    if (value) {
      const hasWhite = value.includes('color: #ffffff') || value.includes('color: rgb(255, 255, 255)');
      setHasWhiteText(hasWhite);
    }
  }, [value]);

  // Handle undo/redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      const prevContent = historyStack[historyIndex - 1]
      if (editorRef.current) editorRef.current.innerHTML = prevContent
      onChange(prevContent)
    }
  }

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex(historyIndex + 1)
      const nextContent = historyStack[historyIndex + 1]
      if (editorRef.current) editorRef.current.innerHTML = nextContent
      onChange(nextContent)
    }
  }

  // Insert link
  const insertLink = () => {
    // Get the current selection
    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      // Open the popover
      setIsLinkPopoverOpen(true)
    } else {
      // No text selected, show a message
      alert('Please select some text first')
    }
  }

  const applyLink = () => {
    if (linkUrl) {
      execCommand('createLink', linkUrl)
      setLinkUrl('')
      setIsLinkPopoverOpen(false)
    }
  }

  // Convert white text to black
  const convertWhiteTextToBlack = () => {
    if (editorRef.current && hasWhiteText) {
      // Replace all white color instances with black
      let content = editorRef.current.innerHTML;
      content = content.replace(/color:\s*#ffffff/g, 'color: #000000');
      content = content.replace(/color:\s*rgb\(255,\s*255,\s*255\)/g, 'color: rgb(0, 0, 0)');
      
      // Update editor content
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
      
      // Update state
      onChange(content);
      setHasWhiteText(false);
      setCurrentColor('#000000');
    }
  };

  return (
    <div className={cn("border rounded-md", className)}>
      {/* Editor toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-gray-50">
        {/* Undo/Redo */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Undo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 10h10.5c3.038 0 5.5 2.462 5.5 5.5S16.538 21 13.5 21 8 18.538 8 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 6L3 10l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRedo}
          disabled={historyIndex >= historyStack.length - 1}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Redo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10H10.5C7.462 10 5 12.462 5 15.5S7.462 21 10.5 21s5.5-2.462 5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
        
        <div className="h-4 w-px bg-gray-300 mx-1" />
        
        {/* Basic formatting */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('bold')}
          type="button"
          className="text-xs font-bold px-2.5 h-8 hover:bg-gray-200"
          title="Bold"
        >
          B
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('italic')}
          type="button"
          className="text-xs italic px-2.5 h-8 hover:bg-gray-200"
          title="Italic"
        >
          I
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('underline')}
          type="button"
          className="text-xs underline px-2.5 h-8 hover:bg-gray-200"
          title="Underline"
        >
          U
        </Button>
        
        <div className="h-4 w-px bg-gray-300 mx-1" />
        
        {/* Font selector */}
        <Select onValueChange={(value) => {
          execCommand('fontName', value);
          updateContent();
        }}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem 
                key={font.value} 
                value={font.value}
                style={{ fontFamily: font.value }}
                className="flex items-center py-1.5"
              >
                <span className="text-sm">{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Font size selector */}
        <Select onValueChange={(value) => {
          execCommand('fontSize', value.toString());
          updateContent();
        }}>
          <SelectTrigger className="h-8 w-24 text-xs ml-1">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size, index) => (
              <SelectItem 
                key={size.value} 
                value={index.toString()}
                className="flex items-center py-1.5"
              >
                <span style={{ fontSize: size.value === 'inherit' ? '14px' : size.value }}>
                  {size.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="h-4 w-px bg-gray-300 mx-1" />
        
        {/* Color selector */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              type="button"
              className="text-xs px-2 h-8"
              title="Text Color"
            >
              <span className="flex items-center">
                <span 
                  className={`w-4 h-4 border border-gray-300 mr-1 ${currentColor === '#ffffff' ? 'border-gray-400' : ''}`} 
                  style={{ backgroundColor: currentColor }}
                ></span>
                <span>Color</span>
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <h4 className="font-medium">Text Color</h4>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className="flex flex-col items-center justify-center rounded border hover:bg-gray-100 p-1"
                    onClick={() => {
                      execCommand('foreColor', color.value);
                      document.body.click(); // Close popover after selection
                    }}
                    type="button"
                  >
                    <span 
                      className={`w-8 h-8 rounded-sm border shadow-sm mb-1 ${color.value === '#ffffff' ? 'border-gray-400' : ''}`}
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-xs">{color.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Input 
                  type="color" 
                  onChange={(e) => {
                    execCommand('foreColor', e.target.value);
                    document.body.click(); // Close popover after selection
                  }}
                  className="w-12 h-8 p-1"
                />
                <span className="text-sm">Custom color</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="h-4 w-px bg-gray-300 mx-1" />
        
        {/* Alignment */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyLeft')}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Align Left"
        >
          <span className="flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5H21M3 12H13M3 19H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyCenter')}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Align Center"
        >
          <span className="flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5H21M6 12H18M5 19H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('justifyRight')}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Align Right"
        >
          <span className="flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 5H21M11 12H21M7 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
        </Button>
        
        <div className="h-4 w-px bg-gray-300 mx-1" />
        
        {/* Lists */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('insertUnorderedList')}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Bullet List"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="6" r="1" fill="currentColor"/>
            <circle cx="4" cy="12" r="1" fill="currentColor"/>
            <circle cx="4" cy="18" r="1" fill="currentColor"/>
            <line x1="8" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('insertOrderedList')}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Numbered List"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="3" y="7" fill="currentColor" fontSize="6">1</text>
            <text x="3" y="13" fill="currentColor" fontSize="6">2</text>
            <text x="3" y="19" fill="currentColor" fontSize="6">3</text>
            <line x1="8" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </Button>
        
        <div className="h-4 w-px bg-gray-300 mx-1" />
        
        {/* Script */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('subscript')}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Subscript"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="3" y="10" fill="currentColor" fontSize="10">X</text>
            <text x="12" y="14" fill="currentColor" fontSize="6">2</text>
          </svg>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => execCommand('superscript')}
          type="button"
          className="text-xs px-2.5 h-8 hover:bg-gray-200"
          title="Superscript"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="3" y="14" fill="currentColor" fontSize="10">X</text>
            <text x="12" y="7" fill="currentColor" fontSize="6">2</text>
          </svg>
        </Button>
        
        <div className="h-4 w-px bg-gray-300 mx-1" />
        
        {/* Link */}
        <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={insertLink}
              type="button"
              className="text-xs px-2.5 h-8 hover:bg-gray-200"
              title="Insert Link"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <div className="space-y-2">
              <h4 className="font-medium">Insert Link</h4>
              <Input
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                  }
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsLinkPopoverOpen(false)}
                  type="button"
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={applyLink}
                  type="button"
                  disabled={!linkUrl}
                >
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex-1" />
        
        {/* Toggle between edit and preview mode */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(!isEditing)}
          type="button"
          className="text-xs px-2 h-8"
        >
          {isEditing ? "Preview" : "Edit"}
        </Button>
      </div>
      
      {/* White text warning */}
      {hasWhiteText && isEditing && (
        <div className="bg-yellow-50 text-yellow-800 px-3 py-1 text-xs border-b flex items-center justify-between">
          <span>White text is being used and is displayed with a background for visibility.</span>
          <button 
            className="text-blue-600 hover:text-blue-800 font-medium ml-2"
            onClick={convertWhiteTextToBlack}
            type="button"
          >
            Convert to black
          </button>
        </div>
      )}
      
      {/* Editor content area */}
      {isEditing ? (
        <div
          ref={editorRef}
          contentEditable
          className="p-3 min-h-[200px] focus:outline-none white-text-editor"
          onInput={updateContent}
          onBlur={updateContent}
          dangerouslySetInnerHTML={{ __html: value || placeholder }}
        />
      ) : (
        <div
          className="p-3 min-h-[200px] prose max-w-none white-text-preview"
          dangerouslySetInnerHTML={{ __html: value }}
          style={{ 
            '--white-color-preview': '#000000'
          } as React.CSSProperties}
        />
      )}
      <style jsx>{`
        .white-text-preview :global([style*="color: rgb(255, 255, 255)"], 
        .white-text-preview :global([style*="color: #ffffff"]) {
          color: var(--white-color-preview) !important;
        }
        
        .white-text-editor :global([style*="color: rgb(255, 255, 255)"]), 
        .white-text-editor :global([style*="color: #ffffff"]) {
          text-shadow: 0 0 1px rgba(0,0,0,0.7) !important;
          background-color: rgba(230, 230, 230, 0.4) !important;
          border: 1px dashed #aaaaaa !important;
          border-radius: 2px !important;
          padding: 0 2px !important;
        }
      `}</style>
    </div>
  )
} 