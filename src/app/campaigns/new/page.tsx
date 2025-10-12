import PageHeader from '@/components/shared/PageHeader';
import { Megaphone } from 'lucide-react';

export default function NewCampaignPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Campaign Generator"
        description="AI-powered email and LinkedIn campaign builder"
        icon={Megaphone}
        iconColor="bg-blue-500"
      />

      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
        <p className="text-gray-600">
          Campaign generator will be built in Sprints 4-9...
        </p>
      </div>
    </div>
  );
}
