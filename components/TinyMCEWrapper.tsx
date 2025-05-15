"use client"

import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface TinyMCEWrapperProps {
  value: string;
  onChange?: (data: string) => void;
  onEditorChange?: (data: string) => void;
  placeholder?: string;
  className?: string;
  init?: any;
}

const TinyMCEWrapper: React.FC<TinyMCEWrapperProps> = ({ 
  value, 
  onChange, 
  onEditorChange,
  placeholder = 'Type your content here...',
  className = '',
  init = {}
}) => {
  const editorRef = useRef<any>(null);
  const [initialContentSet, setInitialContentSet] = useState(false);
  
  // Handle content updates properly to maintain undo/redo history
  useEffect(() => {
    if (editorRef.current && !initialContentSet) {
      // Set the initial content only once
      editorRef.current.setContent(value);
      setInitialContentSet(true);
    }
  }, [value, editorRef, initialContentSet]);

  // Handle the content change
  const handleContentChange = (content: string) => {
    if (onChange) onChange(content);
    if (onEditorChange) onEditorChange(content);
  };
  
  return (
    <div className={className}>
      <Editor
        apiKey="6pixgn7m8jisurreb3e8dclg5hf6wgl07ztk8hw442p2dkvv"
        onInit={(evt, editor) => {
          editorRef.current = editor;
          // Initialize undo manager with the starting content
          editor.undoManager.clear();
          editor.undoManager.add();
        }}
        value={value}
        init={{
          height: 400,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar1: 'undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
          toolbar2: 'forecolor backcolor removeformat | link image media table | code preview fullscreen',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: placeholder,
          branding: false,
          promotion: false,
          extended_valid_elements: 'span[*],i[*]',
          resize: true,
          statusbar: true,
          // Make sure to trigger change events to keep history
          setup: (editor: any) => {
            editor.on('change', () => {
              const content = editor.getContent();
              handleContentChange(content);
              // Add to undo stack after every change
              editor.undoManager.add();
            });
          },
          ...init
        }}
        onEditorChange={(content, editor) => {
          handleContentChange(content);
        }}
      />
    </div>
  );
};

export default TinyMCEWrapper; 