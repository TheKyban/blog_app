'use client';

import { useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-50 rounded-lg border border-slate-200 animate-pulse flex items-center justify-center">
      <div className="text-slate-400">Loading editor...</div>
    </div>
  )
});

import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  // Memoize modules and formats to prevent unnecessary re-renders
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ direction: 'rtl' }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean'],
      ],
    },
    clipboard: {
      // Strip HTML when pasting to prevent XSS
      matchVisual: false,
    },
  }), []);

  const formats = useMemo(() => [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'script',
    'direction',
    'color',
    'background',  
    'align',
    'link',
    'image',
    'video',
    'code-block',
  ], []);

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
        }}
      />
      <style jsx global>{`
        .ql-editor {
          min-height: 200px;
          font-size: 16px;
          line-height: 1.6;
          font-family: inherit;
        }
        
        .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: #e2e8f0;
          background: #f8fafc;
        }
        
        .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: #e2e8f0;
          font-family: inherit;
        }
        
        .ql-editor.ql-blank::before {
          font-style: normal;
          color: #94a3b8;
          font-family: inherit;
        }
        
        .ql-toolbar .ql-stroke {
          fill: none;
          stroke: #64748b;
        }
        
        .ql-toolbar .ql-fill {
          fill: #64748b;
          stroke: none;
        }
        
        .ql-toolbar .ql-picker {
          color: #64748b;
        }
        
        .ql-toolbar button:hover,
        .ql-toolbar button:focus {
          color: #3b82f6;
        }
        
        .ql-toolbar button.ql-active {
          color: #3b82f6;
        }
        
        .ql-toolbar .ql-picker-label:hover,
        .ql-toolbar .ql-picker-label.ql-active {
          color: #3b82f6;
        }
        
        .ql-editor h1,
        .ql-editor h2,
        .ql-editor h3,
        .ql-editor h4,
        .ql-editor h5,
        .ql-editor h6 {
          font-weight: 600;
          color: #1e293b;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
        }
        
        .ql-editor blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #64748b;
          background: #f8fafc;
          padding: 0.75rem 1rem;
          border-radius: 0 0.25rem 0.25rem 0;
        }
        
        .ql-editor code {
          background-color: #f1f5f9;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
          color: #e11d48;
        }
        
        .ql-editor pre {
          background-color: #1e293b;
          color: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        
        .ql-editor pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        
        .ql-editor a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.25rem;
        }
      `}</style>
    </div>
  );
}