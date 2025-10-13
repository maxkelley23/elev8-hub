'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CampaignIntakeSchema, type CampaignIntake } from '@/types/campaign';
import { Loader2, Sparkles } from 'lucide-react';

interface CampaignIntakeFormProps {
  onSubmit: (intake: CampaignIntake) => void;
  isLoading?: boolean;
}

export default function CampaignIntakeForm({ onSubmit, isLoading }: CampaignIntakeFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CampaignIntake>({
    resolver: zodResolver(CampaignIntakeSchema),
    defaultValues: {
      request: '',
      cadence: 'balanced',
      channels: ['email'],
      includeLinkedIn: true,
      includeSMS: false,
      abSubjects: true,
      complianceLevel: 'standard',
    },
  });

  const includeLinkedIn = watch('includeLinkedIn');
  const includeSMS = watch('includeSMS');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Primary Request */}
      <div>
        <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-2">
          What type of campaign do you want to create? <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register('request')}
          id="request"
          rows={4}
          placeholder="e.g., Cold outreach campaign for HVAC business owners in the Northeast to book a demo of our lead generation service"
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isLoading}
        />
        {errors.request && (
          <p className="mt-1 text-sm text-red-600">{errors.request.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Describe your campaign in natural language - be as vague or specific as you like!
        </p>
      </div>

      {/* Quick Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vertical" className="block text-sm font-medium text-gray-700 mb-2">
            Industry/Vertical
          </label>
          <input
            {...register('vertical')}
            type="text"
            id="vertical"
            placeholder="e.g., HVAC, Real Estate, SaaS"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
            Primary Goal
          </label>
          <input
            {...register('goal')}
            type="text"
            id="goal"
            placeholder="e.g., Book demo, Schedule call"
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Channels */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Channels
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={true}
              disabled
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Email (required)</span>
          </label>
          <label className="flex items-center">
            <input
              {...register('includeLinkedIn')}
              type="checkbox"
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">LinkedIn</span>
          </label>
          <label className="flex items-center">
            <input
              {...register('includeSMS')}
              type="checkbox"
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">SMS</span>
          </label>
        </div>
      </div>

      {/* Cadence */}
      <div>
        <label htmlFor="cadence" className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Cadence
        </label>
        <select
          {...register('cadence')}
          id="cadence"
          disabled={isLoading}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="aggressive">Aggressive (every 1-3 days)</option>
          <option value="balanced">Balanced (every 2-5 days)</option>
          <option value="gentle">Gentle (every 4-7 days)</option>
        </select>
      </div>

      {/* Advanced Options Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAdvanced ? '− Hide' : '+ Show'} Advanced Options
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-4 border-t-2 border-gray-100 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="numTouches" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Touches
              </label>
              <input
                {...register('numTouches', { valueAsNumber: true })}
                type="number"
                id="numTouches"
                min="3"
                max="15"
                placeholder="Auto (AI will decide)"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.numTouches && (
                <p className="mt-1 text-sm text-red-600">{errors.numTouches.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="totalDays" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Length (days)
              </label>
              <input
                {...register('totalDays', { valueAsNumber: true })}
                type="number"
                id="totalDays"
                min="7"
                max="90"
                placeholder="Auto (AI will decide)"
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              {errors.totalDays && (
                <p className="mt-1 text-sm text-red-600">{errors.totalDays.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Tone
            </label>
            <input
              {...register('tone')}
              type="text"
              id="tone"
              placeholder="e.g., professional-friendly, casual, consultative"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience Details
            </label>
            <textarea
              {...register('audience')}
              id="audience"
              rows={2}
              placeholder="e.g., Business owners with 10-50 employees in the Northeast US"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center">
            <input
              {...register('abSubjects')}
              type="checkbox"
              id="abSubjects"
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="abSubjects" className="ml-2 text-sm text-gray-700">
              Generate A/B test subject lines
            </label>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t-2 border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Campaign...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Campaign
            </>
          )}
        </button>
      </div>
    </form>
  );
}
