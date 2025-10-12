import { TOOLS, getToolsByCategory } from '@/lib/tools-registry';
import ToolCard from '@/components/shared/ToolCard';
import PageHeader from '@/components/shared/PageHeader';
import { LayoutGrid } from 'lucide-react';

export default function Home() {
  const financeTools = getToolsByCategory('finance');
  const marketingTools = getToolsByCategory('marketing');
  const creativeTools = getToolsByCategory('creative');
  const libraryTools = getToolsByCategory('library');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title="Elev8 Hub"
        description="Your internal tools platform for marketing, creative, and productivity"
        icon={LayoutGrid}
        iconColor="bg-blue-600"
      />

      {/* Finance Tools */}
      {financeTools.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Finance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financeTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Marketing Tools */}
      {marketingTools.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketingTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Creative Tools */}
      {creativeTools.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Creative Studio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creativeTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Library Tools */}
      {libraryTools.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Shared Libraries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {libraryTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
