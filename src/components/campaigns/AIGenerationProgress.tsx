'use client';

import { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface AIGenerationProgressProps {
  type: 'plan' | 'messages';
}

interface Stage {
  id: string;
  label: string;
  estimatedMs: number;
}

const PLAN_STAGES: Stage[] = [
  { id: 'analyzing', label: 'Analyzing your request', estimatedMs: 2000 },
  { id: 'research', label: 'Researching best practices', estimatedMs: 3000 },
  { id: 'strategy', label: 'Building campaign strategy', estimatedMs: 4000 },
  { id: 'finalize', label: 'Finalizing campaign plan', estimatedMs: 2000 },
];

const MESSAGE_STAGES: Stage[] = [
  { id: 'snippets', label: 'Loading high-performing snippets', estimatedMs: 2000 },
  { id: 'knowledge', label: 'Gathering industry insights', estimatedMs: 2000 },
  { id: 'writing', label: 'Writing compelling copy', estimatedMs: 10000 },
  { id: 'compliance', label: 'Checking compliance', estimatedMs: 3000 },
  { id: 'polish', label: 'Polishing messages', estimatedMs: 3000 },
];

export default function AIGenerationProgress({ type }: AIGenerationProgressProps) {
  const stages = type === 'plan' ? PLAN_STAGES : MESSAGE_STAGES;
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const advanceStage = () => {
      setCompletedStages(prev => new Set([...prev, stages[currentStageIndex].id]));

      if (currentStageIndex < stages.length - 1) {
        timeoutId = setTimeout(() => {
          setCurrentStageIndex(currentStageIndex + 1);
        }, stages[currentStageIndex].estimatedMs);
      }
    };

    if (currentStageIndex < stages.length) {
      advanceStage();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [currentStageIndex, stages]);

  const totalEstimatedTime = stages.reduce((sum, stage) => sum + stage.estimatedMs, 0);
  const elapsedTime = stages
    .slice(0, currentStageIndex + 1)
    .reduce((sum, stage) => sum + stage.estimatedMs, 0);
  const progressPercent = Math.min((elapsedTime / totalEstimatedTime) * 100, 95); // Cap at 95%

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="w-10 h-10 text-white animate-pulse" />
        </div>
        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-ping opacity-20"></div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        {type === 'plan' ? 'Generating Campaign Plan' : 'Writing Campaign Messages'}
      </h3>
      <p className="text-gray-600 mb-8">
        AI is working its magic... This may take {Math.round(totalEstimatedTime / 1000)} seconds
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-center text-sm text-gray-500 mt-2">
          {Math.round(progressPercent)}% complete
        </div>
      </div>

      {/* Stage List */}
      <div className="w-full max-w-md space-y-3">
        {stages.map((stage, index) => {
          const isCompleted = completedStages.has(stage.id);
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isCompleted
                  ? 'bg-green-50'
                  : isCurrent
                  ? 'bg-blue-50'
                  : 'bg-gray-50'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>

              {/* Label */}
              <div
                className={`flex-1 font-medium ${
                  isCompleted
                    ? 'text-green-700'
                    : isCurrent
                    ? 'text-blue-700'
                    : 'text-gray-500'
                }`}
              >
                {stage.label}
              </div>

              {/* Status */}
              {isCompleted && (
                <div className="text-xs text-green-600 font-medium">Done</div>
              )}
              {isCurrent && (
                <div className="text-xs text-blue-600 font-medium animate-pulse">
                  In progress...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fun fact */}
      <div className="mt-8 text-center text-sm text-gray-500 max-w-md">
        💡 <strong>Did you know?</strong> We're using Claude Sonnet for high-quality copywriting.
        {type === 'messages' && ' Each message is personalized and compliance-checked.'}
      </div>
    </div>
  );
}
