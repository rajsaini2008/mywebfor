"use client"

import React, { useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue,
  onChange,
  placeholder = 'Type your content here...',
  className = '',
  minHeight = '200px'
}) => {
  const [value, setValue] = useState(initialValue);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue;
    }
  }, [initialValue]);

  const handleInput = () => {
    if (editorRef.current) {
      const newValue = editorRef.current.innerHTML;
      setValue(newValue);
      onChange(newValue);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleInput();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap gap-2">
        <select 
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm"
          onChange={(e) => execCommand('formatBlock', e.target.value)}
        >
          <option value="">Format</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="p">Paragraph</option>
        </select>
        
        <button 
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-bold"
          onClick={() => execCommand('bold')}
          type="button"
        >
          B
        </button>
        
        <button 
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm italic"
          onClick={() => execCommand('italic')}
          type="button"
        >
          I
        </button>
        
        <button 
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm underline"
          onClick={() => execCommand('underline')}
          type="button"
        >
          U
        </button>
        
        <button 
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm"
          onClick={() => {
            const url = prompt('Enter link URL:');
            if (url) execCommand('createLink', url);
          }}
          type="button"
        >
          Link
        </button>
        
        <button 
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm"
          onClick={() => execCommand('insertUnorderedList')}
          type="button"
        >
          • List
        </button>
        
        <button 
          className="px-2 py-1 bg-white border border-gray-300 rounded text-sm"
          onClick={() => execCommand('insertOrderedList')}
          type="button"
        >
          1. List
        </button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className={`p-4 focus:outline-none ${className}`}
        onInput={handleInput}
        style={{ minHeight }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor; 