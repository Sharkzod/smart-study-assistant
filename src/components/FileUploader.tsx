"use client";

import { useCallback, useState, useRef } from "react";

interface FileUploaderProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED_TYPES = ".txt,.md,.pdf,.docx";
const ACCEPTED_LABEL = ".txt, .md, .pdf, .docx";

export default function FileUploader({ onFileSelected }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const name = file.name.toLowerCase();
      const valid = [".txt", ".md", ".pdf", ".docx"].some((ext) =>
        name.endsWith(ext)
      );

      if (!valid) {
        setError(
          `Unsupported file type. Please upload a ${ACCEPTED_LABEL} file, or paste your notes directly.`
        );
        setFileName(null);
        return;
      }

      setFileName(file.name);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          onChange={handleChange}
          className="hidden"
        />
        <div className="mb-3 text-4xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="text-lg font-medium text-slate-700">
          {fileName ? fileName : "Drop your notes here or click to browse"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Supports {ACCEPTED_LABEL} files
        </p>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
