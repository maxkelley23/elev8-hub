import Link from 'next/link';
import { Tool } from '@/lib/tools-registry';

interface ToolCardProps {
  tool: Tool;
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
};

const statusBadges = {
  active: { text: 'Active', class: 'bg-green-100 text-green-800' },
  beta: { text: 'Beta', class: 'bg-yellow-100 text-yellow-800' },
  'coming-soon': { text: 'Coming Soon', class: 'bg-gray-100 text-gray-600' },
};

export default function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;
  const isDisabled = tool.status === 'coming-soon';

  const card = (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-200
        ${isDisabled ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'}
        ${!isDisabled ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
    >
      {/* Icon Circle */}
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[tool.color]} mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadges[tool.status].class}`}>
          {statusBadges[tool.status].text}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{tool.description}</p>

      {/* Category Tag */}
      <div className="inline-block">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {tool.category}
        </span>
      </div>
    </div>
  );

  if (isDisabled) {
    return card;
  }

  return (
    <Link href={tool.href} className="block">
      {card}
    </Link>
  );
}
