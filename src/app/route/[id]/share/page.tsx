'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GitBranch, ArrowRight } from 'lucide-react';

interface FormField {
  id: string;
  label: string;
  type: 'email' | 'select' | 'text';
  required?: boolean;
  options?: string[];
}

export default function RoutePublicSharePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const routeId = params.id;

  const [routeName, setRouteName] = useState('Enterprise Buyer Qualification & Demo Router');
  const [fields, setFields] = useState<FormField[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({
    email: '',
    role: 'Sales / Presales Engineering',
    companySize: '200+ Enterprise',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/routes/${routeId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.route) {
          setRouteName(d.route.name);
          try {
            setFields(JSON.parse(d.route.formFieldsJson || '[]'));
          } catch {
            setFields([]);
          }
        }
      });
  }, [routeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/routes/${routeId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorEmail: answers.email || 'buyer@enterprise.io',
          answers,
        }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
      <div
        data-testid="route-share-qualification-card"
        className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6"
      >
        <div className="flex items-center gap-2.5 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <GitBranch className="w-4 h-4" /> Supademo Route Hub
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-white">{routeName}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Answer 3 quick questions so we can launch a tailored interactive walkthrough for your team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {field.label}
              </label>
              {field.type === 'select' ? (
                <select
                  data-testid={`route-field-${field.id}`}
                  value={answers[field.id] || field.options?.[0] || ''}
                  onChange={(e) =>
                    setAnswers({ ...answers, [field.id]: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  required={field.required}
                  data-testid={`route-field-${field.id}`}
                  value={answers[field.id] || ''}
                  onChange={(e) =>
                    setAnswers({ ...answers, [field.id]: e.target.value })
                  }
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            data-testid="route-submit-btn"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2"
          >
            <span>
              {submitting
                ? 'Routing to Tailored Interactive Demo...'
                : 'Launch My Personalized Product Tour'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
