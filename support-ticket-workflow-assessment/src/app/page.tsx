"use client";

import { useState } from "react";

interface DeduplicationResult {
  isPossibleDuplicate: boolean;
  relatedTicketId?: string;
  currentTicketId?: string;
}

interface ProcessResult {
  classification: { category: string; severity: string };
  extractedFields: {
    customerEmail: string | null;
    customerId: string | null;
    orderId: string | null;
    productOrFeature: string | null;
    summary: string | null;
    affectedComponentOrError: string | null;
  };
  draft: string;
  routing: { teamId: string; teamName?: string; reason?: string };
  deduplication?: DeduplicationResult;
}

const EXTRACTED_FIELD_LABELS: Record<string, string> = {
  customerEmail: "Customer email",
  customerId: "Customer ID",
  orderId: "Order / Reference",
  productOrFeature: "Product / Feature",
  summary: "Summary",
  affectedComponentOrError: "Technical detail",
};

const SEVERITY_STYLES: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  Critical: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

const SAMPLE_TICKET = `I was charged twice for order #12345 on March 1st. The second charge of $49.99 was not authorized. Please refund the duplicate charge and confirm when it's processed.

Contact me at john@example.com. Thank you.`;

function SeverityBadge({ severity }: { severity: string }) {
  const style = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.Low;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {severity}
    </span>
  );
}

export default function Home() {
  const [ticketText, setTicketText] = useState("");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [editedDraft, setEditedDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  async function handleProcess() {
    const trimmed = ticketText.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setEditedDraft(null);
    setAssignSuccess(false);
    setFeedbackSent(false);
    try {
      const res = await fetch("/api/tickets/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketText: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? `Request failed (${res.status})`);
        return;
      }
      setResult(data as ProcessResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const extractedEntries = result
    ? (Object.entries(result.extractedFields).filter(
        ([_, v]) => v != null && v !== ""
      ) as [string, string][])
    : [];

  const currentDraft = editedDraft ?? result?.draft ?? "";

  async function handleAssign() {
    if (!result) return;
    setAssigning(true);
    setAssignSuccess(false);
    try {
      const res = await fetch("/api/tickets/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: currentDraft,
          teamId: result.routing.teamId,
          teamName: result.routing.teamName,
          ticketId:
            result.deduplication?.currentTicketId ??
            result.deduplication?.relatedTicketId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Assign failed");
      setAssignSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Assign failed");
    } finally {
      setAssigning(false);
    }
  }

  async function handleFeedback(classificationCorrect?: boolean, draftHelpful?: boolean) {
    try {
      await fetch("/api/tickets/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId:
            result?.deduplication?.currentTicketId ??
            result?.deduplication?.relatedTicketId,
          classificationCorrect,
          draftHelpful,
        }),
      });
      setFeedbackSent(true);
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-slate-950 dark:[background-image:linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)]"
        aria-hidden
      />

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Support ticket workflow
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
            Paste a ticket to classify it, extract fields, get a reply draft, and
            see the suggested team.
          </p>
        </header>

        {/* Input card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 dark:shadow-slate-900/20 sm:p-8">
          <label
            htmlFor="ticket-input"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Ticket text
          </label>
          <textarea
            id="ticket-input"
            className="mt-2 w-full min-h-[160px] resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="Paste support ticket here..."
            value={ticketText}
            onChange={(e) => setTicketText(e.target.value)}
            disabled={loading}
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setTicketText(SAMPLE_TICKET)}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Try sample ticket
            </button>
            <button
              type="button"
              onClick={handleProcess}
              disabled={loading || !ticketText.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:pointer-events-none disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing…
                </>
              ) : (
                "Process ticket"
              )}
            </button>
          </div>
        </div>

        {error && (
          <div
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        {result && !loading && (
          <div className="mt-8 space-y-5">
            {/* Deduplication banner */}
            {result.deduplication?.isPossibleDuplicate &&
              result.deduplication.relatedTicketId && (
                <div
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/40"
                  role="status"
                >
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Possible duplicate of{" "}
                    <span className="font-mono">
                      #{result.deduplication.relatedTicketId}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                    This ticket matches a previously processed one. Consider
                    linking or merging.
                  </p>
                </div>
              )}
            {result.deduplication?.currentTicketId &&
              !result.deduplication?.isPossibleDuplicate && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Created as{" "}
                  <span className="font-mono">
                    #{result.deduplication.currentTicketId}
                  </span>
                </p>
              )}

            {/* Classification */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Classification
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-1 text-sm font-medium text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                  {result.classification.category}
                </span>
                <SeverityBadge severity={result.classification.severity} />
              </div>
            </section>

            {extractedEntries.length > 0 && (
              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Extracted fields
                </h2>
                <dl className="mt-3 divide-y divide-slate-100 dark:divide-slate-700">
                  {extractedEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <dt className="w-36 shrink-0 text-sm text-slate-500 dark:text-slate-400">
                        {EXTRACTED_FIELD_LABELS[key] ?? key}
                      </dt>
                      <dd className="min-w-0 flex-1 text-sm text-slate-900 dark:text-slate-100">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* Reply draft (editable) */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Reply draft
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Edit below before assigning.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(currentDraft);
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    } catch {
                      // ignore
                    }
                  }}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {copySuccess ? "Copied!" : "Copy draft"}
                </button>
              </div>
              <textarea
                className="mt-3 w-full min-h-[120px] resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-600 dark:bg-slate-800/50 dark:text-slate-300"
                value={currentDraft}
                onChange={(e) => setEditedDraft(e.target.value)}
                placeholder="Reply draft…"
              />
            </section>

            {/* Suggested team + Assign */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Suggested team
              </h2>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/50">
                    <svg
                      className="h-5 w-5 text-teal-600 dark:text-teal-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {result.routing.teamName ?? result.routing.teamId}
                    </p>
                    {result.routing.reason && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {result.routing.reason}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAssign}
                  disabled={assigning}
                  className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:opacity-50"
                >
                  {assigning ? "Assigning…" : "Assign to team"}
                </button>
              </div>
              {assignSuccess && (
                <p className="mt-3 text-sm text-teal-600 dark:text-teal-400" role="status">
                  Assignment recorded.
                </p>
              )}
            </section>

            {/* Feedback */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/80 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Feedback
              </h2>
              {feedbackSent ? (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  Thank you for your feedback.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Was this helpful?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleFeedback(true, true)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFeedback(false, false)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
