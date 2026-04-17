"use client";

import { useState } from "react";
import FileUploader from "@/components/FileUploader";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { AnalysisResult } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type AppState = "upload" | "loading" | "results";

export default function Home() {
  const [state, setState] = useState<AppState>("upload");
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendAnalysis = async (body: FormData | string) => {
    setState("loading");
    setError(null);

    try {
      const formData = body instanceof FormData ? body : new FormData();
      if (typeof body === "string") {
        formData.append("text", body);
      }
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        setState("upload");
        return;
      }

      setResult(data);
      setState("results");
    } catch {
      setError("Something went wrong. Please try again.");
      setState("upload");
    }
  };

  const analyzeFile = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    sendAnalysis(formData);
  };

  const analyzeText = () => {
    if (text.trim().length < 50) {
      setError("Please provide at least 50 characters of text for meaningful analysis.");
      return;
    }
    sendAnalysis(text);
  };

  const reset = () => {
    setState("upload");
    setText("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 sm:h-10 sm:w-10 sm:rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 sm:text-xl">Smart Study Assistant</h1>
              <p className="hidden text-sm text-slate-500 sm:block">Upload notes, get study insights</p>
            </div>
          </div>
          {state === "results" && (
            <button
              onClick={reset}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 sm:px-4 sm:py-2 sm:text-sm"
            >
              Analyze New Notes
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {state === "upload" && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                Analyze Your Study Materials
              </h2>
              <p className="mt-2 text-base text-slate-600 sm:text-lg">
                Upload your notes or paste text below to get key topics, summaries, and exam focus suggestions.
              </p>
            </div>

            {/* Upload Area */}
            <FileUploader onFileSelected={analyzeFile} />

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 border-t border-slate-300" />
              <span className="text-sm font-medium text-slate-400">OR</span>
              <div className="flex-1 border-t border-slate-300" />
            </div>

            {/* Text Area */}
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your study notes here..."
                rows={10}
                className="w-full rounded-xl border border-slate-300 bg-white p-4 text-slate-800 placeholder-slate-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-slate-500">
                  {text.length > 0
                    ? `${text.split(/\s+/).filter((w) => w).length} words`
                    : "Min. 50 characters"}
                </span>
                <button
                  onClick={analyzeText}
                  disabled={text.trim().length < 50}
                  className="w-full rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Analyze Notes
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {state === "loading" && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="mt-4 text-lg font-medium text-slate-700">
              Analyzing your notes...
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Extracting key topics, generating summary, and identifying exam focus areas
            </p>
          </div>
        )}

        {state === "results" && result && (
          <ResultsDashboard result={result} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
        Smart Study Assistant &mdash; Helping students study smarter
      </footer>
    </div>
  );
}
