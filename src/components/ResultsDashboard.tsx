"use client";

import type { AnalysisResult } from "@/lib/types";

interface ResultsDashboardProps {
  result: AnalysisResult;
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    High: "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        colors[priority as keyof typeof colors] || colors.Low
      }`}
    >
      {priority}
    </span>
  );
}

function RelevanceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-slate-200 sm:w-24">
        <div
          className="h-2 rounded-full bg-indigo-500 transition-all"
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <span className="text-xs text-slate-500">{value}%</span>
    </div>
  );
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 gap-3 rounded-xl bg-indigo-50 p-3 sm:grid-cols-4 sm:gap-6 sm:p-4">
        <div className="text-center">
          <p className="text-xl font-bold text-indigo-600 sm:text-2xl">{result.wordCount}</p>
          <p className="text-xs text-slate-600">Words</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-indigo-600 sm:text-2xl">{result.sentenceCount}</p>
          <p className="text-xs text-slate-600">Sentences</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-indigo-600 sm:text-2xl">{result.keyTopics.length}</p>
          <p className="text-xs text-slate-600">Key Topics</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-indigo-600 sm:text-2xl">{result.examFocus.length}</p>
          <p className="text-xs text-slate-600">Focus Areas</p>
        </div>
      </div>

      {/* Summary */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800 sm:text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-indigo-500 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Summary
        </h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700 sm:text-base">
          {result.summary
            .split(/(?<=[.!?])\s+/)
            .filter((s) => s.trim().length > 0)
            .map((sentence, i) => (
              <li key={i}>{sentence}</li>
            ))}
        </ol>
      </section>

      {/* Key Topics */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 sm:text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-indigo-500 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Key Topics
        </h2>
        {result.keyTopics.length === 0 ? (
          <p className="text-slate-500">No significant topics found.</p>
        ) : (
          <div className="space-y-3">
            {result.keyTopics.map((topic, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 sm:h-7 sm:w-7 sm:text-sm">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium capitalize text-slate-800 sm:text-base">
                    {topic.topic}
                  </span>
                  <span className="text-xs text-slate-500 sm:text-sm">
                    ({topic.frequency}x)
                  </span>
                </div>
                <RelevanceBar value={topic.relevance} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Exam Focus */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 sm:text-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-indigo-500 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Exam Focus Suggestions
        </h2>
        {result.examFocus.length === 0 ? (
          <p className="text-slate-500">No specific focus areas identified.</p>
        ) : (
          <div className="space-y-3">
            {result.examFocus.map((focus, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-800 sm:text-base">{focus.area}</h3>
                  <PriorityBadge priority={focus.priority} />
                </div>
                <p className="mt-1 text-xs text-slate-600 sm:text-sm">{focus.reason}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Flashcards */}
      {result.flashcards && result.flashcards.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800 sm:text-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-indigo-500 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Flashcards
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {result.flashcards.map((card, i) => (
              <div
                key={i}
                className="group rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-indigo-50 sm:p-4"
              >
                <p className="text-sm font-semibold text-slate-800 sm:text-base">{card.front}</p>
                <p className="mt-1.5 text-xs text-slate-600 sm:mt-2 sm:text-sm">{card.back}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
