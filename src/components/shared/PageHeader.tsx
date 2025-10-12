import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export default function PageHeader({ title, description, icon: Icon, iconColor = 'bg-blue-500' }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start space-x-4">
        {Icon && (
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${iconColor}`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          {description && (
            <p className="text-lg text-gray-600">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
