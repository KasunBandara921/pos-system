"use client";

import React, { useState, useEffect } from "react";
import Shell from "../../components/Shell";
import { getAIAdvice, askAIAdvisor, AIAdviceResult } from "../../actions/ai";

export default function AIAdvicePage() {
  const [advice, setAdvice] = useState<AIAdviceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ask Advisor states
  const [question, setQuestion] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function loadAdvice() {
      try {
        setIsLoading(true);
        const data = await getAIAdvice();
        setAdvice(data);
      } catch (err) {
        console.error("Failed to load AI advice:", err);
        setError("Unable to connect to the advisor service.");
      } finally {
        setIsLoading(false);
      }
    }
    loadAdvice();
  }, []);

  const handleAskQuestion = async (q: string) => {
    if (!q.trim()) return;
    try {
      setIsAnswering(true);
      setAnswer(null);
      const res = await askAIAdvisor(q);
      setAnswer(res);
    } catch (err) {
      console.error("Error asking advisor:", err);
      setAnswer("Sorry, I could not generate an answer right now.");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    handleAskQuestion(question);
  };

  const toggleStep = (recId: string, stepIdx: number) => {
    const key = `${recId}-${stepIdx}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "inventory":
        return "inventory_2";
      case "sales":
        return "trending_up";
      case "pricing":
        return "sell";
      default:
        return "smart_toy";
    }
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case "inventory":
        return "bg-primary/10 text-primary";
      case "sales":
        return "bg-secondary-container text-on-secondary-container";
      case "pricing":
        return "bg-warning-container text-on-warning-container";
      default:
        return "bg-surface-container-high text-on-surface";
    }
  };

  const getImpactBadgeClass = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-error/15 text-error border-error/20";
      case "medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  // Preset suggestions
  const quickQuestions = [
    "What is the best selling product?",
    "Which products are low on stock?",
    "How can I increase the average transaction value?",
  ];

  if (isLoading) {
    return (
      <Shell>
        <main className="flex-1 p-lg overflow-y-auto bg-background flex flex-col gap-lg animate-pulse">
          <div className="card-elevated p-lg h-32 flex flex-col justify-between">
            <div className="h-6 bg-surface-container rounded w-1/4"></div>
            <div className="h-4 bg-surface-container rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
            <div className="card-elevated p-lg h-80 lg:col-span-1"></div>
            <div className="card-elevated p-lg h-80 lg:col-span-2"></div>
          </div>
        </main>
      </Shell>
    );
  }

  const healthScore = advice?.metrics.healthScore || 100;
  // Calculate SVG stroke offset for radial progress (radius = 40, circumference = 251.2)
  const strokeOffset = 251.2 - (251.2 * healthScore) / 100;

  return (
    <Shell>
      <main className="flex-1 p-lg overflow-y-auto bg-background flex flex-col gap-lg">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 card-elevated p-lg bg-linear-to-br from-surface to-surface-container-low/60">
          <div className="space-y-1">
            <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-[32px] text-primary">psychology</span>
              AI Business Advisor
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Dynamic store optimization insights powered by machine learning analytics.
            </p>
          </div>
          
          <div className="flex items-center gap-sm">
            {advice?.isRealAI ? (
              <span className="inline-flex items-center gap-xs px-md py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Gemini 2.5 Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-xs px-md py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20" title="Add GEMINI_API_KEY to your .env file to activate the live model">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Analytical Engine Fallback
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="p-md rounded-2xl bg-error-container text-on-error-container border border-error/20 font-body-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-error">error</span>
            {error}
          </div>
        )}

        {/* Advisor Overview and Score Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          
          {/* Circular Score Panel */}
          <div className="lg:col-span-4 card-elevated p-lg flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <h3 className="font-headline-md text-headline-md text-on-surface-variant mb-md self-start">Store Health</h3>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-outline-variant/60 fill-none"
                  strokeWidth="8"
                />
                {/* Colored Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-primary fill-none transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-display-price text-display-price font-bold gradient-text">{healthScore}%</span>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-semibold">Score</span>
              </div>
            </div>

            <div className="grid grid-cols-2 w-full gap-sm mt-lg pt-md border-t border-outline-variant/40">
              <div className="text-center">
                <p className="text-xs text-on-surface-variant">Sales Velocity</p>
                <p className="font-label-md text-label-md font-bold text-primary flex items-center justify-center gap-0.5 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">
                    {advice?.metrics.salesVelocity === "Positive" ? "trending_up" : "trending_flat"}
                  </span>
                  {advice?.metrics.salesVelocity || "Neutral"}
                </p>
              </div>
              <div className="text-center border-l border-outline-variant/40">
                <p className="text-xs text-on-surface-variant">Stock Alerts</p>
                <p className="font-label-md text-label-md font-bold text-error mt-0.5">
                  {advice?.metrics.lowStockAlertsCount || 0} Products
                </p>
              </div>
            </div>
          </div>

          {/* AI Advisor Overview */}
          <div className="lg:col-span-8 card-elevated p-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-lg opacity-[0.03] text-primary">
              <span className="material-symbols-outlined text-9xl">chat</span>
            </div>
            
            <div className="space-y-md">
              <div className="flex items-center gap-xs">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px] fill">forum</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">Advisor Summary</h3>
              </div>
              
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {advice?.advisorOverview || "Analyzing your store data..."}
              </p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mt-lg pt-md border-t border-outline-variant/40">
              {advice?.insights.slice(0, 2).map((ins, idx) => (
                <div key={idx} className="p-sm bg-surface-container-low/60 rounded-2xl border border-outline-variant/40 flex items-start gap-xs">
                  <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">info</span>
                  <div>
                    <h5 className="font-semibold text-xs text-on-surface">{ins.title}</h5>
                    <p className="text-[11px] text-on-surface-variant mt-0.5 leading-normal">{ins.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Actionable Recommendations Section */}
        <div className="space-y-md">
          <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">playlist_add_check</span>
            Recommended Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {advice?.recommendations.map((rec) => (
              <div key={rec.id} className="card-elevated p-lg flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300">
                <div className="space-y-sm">
                  {/* Category & Impact Row */}
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getCategoryClass(rec.category)}`}>
                      <span className="material-symbols-outlined text-[16px]">{getCategoryIcon(rec.category)}</span>
                      {rec.category.toUpperCase()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getImpactBadgeClass(rec.impact)}`}>
                      {rec.impact} Impact
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mt-xs">{rec.title}</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {rec.description}
                  </p>

                  {/* Action Steps Checkboxes */}
                  <div className="pt-sm space-y-xs">
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant font-bold">Action Steps</p>
                    <ul className="space-y-sm">
                      {rec.actionableSteps.map((step, idx) => {
                        const isDone = completedSteps[`${rec.id}-${idx}`];
                        return (
                          <li key={idx} className="flex items-start gap-xs">
                            <button
                              onClick={() => toggleStep(rec.id, idx)}
                              className={`mt-0.5 shrink-0 w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                                isDone 
                                  ? "bg-primary border-primary text-white" 
                                  : "border-outline hover:border-primary bg-surface"
                              }`}
                            >
                              {isDone && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                            </button>
                            <span className={`text-xs leading-tight transition-all duration-200 ${
                              isDone ? "line-through text-on-surface-variant/50" : "text-on-surface"
                            }`}>
                              {step}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advisor Q&A Terminal */}
        <div className="card-elevated p-lg bg-linear-to-b from-surface to-surface-container-low flex flex-col gap-md">
          <div className="flex items-center gap-xs">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px] fill">chat</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Consult AI Advisor</h3>
              <p className="text-xs text-on-surface-variant">Ask questions directly about stock replenishment, sales trends, or profit optimizations.</p>
            </div>
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex flex-wrap gap-xs">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleAskQuestion(q);
                }}
                className="px-sm py-1.5 bg-surface hover:bg-surface-container border border-outline-variant/60 rounded-xl text-xs font-label-md text-on-surface hover:text-primary transition-all cursor-pointer font-semibold"
              >
                {q}
              </button>
            ))}
          </div>

          {/* QA Output Display */}
          {(isAnswering || answer) && (
            <div className="p-md rounded-2xl bg-surface-container border border-outline-variant/60 animate-rise-in">
              <div className="flex items-center gap-xs mb-sm">
                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                </div>
                <span className="font-label-md text-label-md text-on-surface font-bold">AI Advisor Response</span>
              </div>
              
              {isAnswering ? (
                <div className="flex items-center gap-sm py-xs text-on-surface-variant">
                  <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-label-sm text-label-sm animate-pulse">Running data analysis algorithms...</span>
                </div>
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {answer}
                </p>
              )}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmitQuestion} className="flex gap-sm">
            <input
              type="text"
              placeholder="Ask the AI Advisor about your store..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-md py-xs bg-surface border border-outline-variant/60 rounded-2xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15 transition-all min-h-12"
            />
            <button
              type="submit"
              disabled={isAnswering || !question.trim()}
              className="btn-primary px-lg rounded-2xl flex items-center justify-center gap-xs active:scale-[0.97] min-h-12 cursor-pointer font-semibold disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
              Ask
            </button>
          </form>
        </div>

      </main>
    </Shell>
  );
}
