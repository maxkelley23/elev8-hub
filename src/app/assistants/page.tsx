import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import Link from 'next/link';

/**
 * Assistants Library Page
 * Displays all assistants for the current user with options to create, edit, and delete.
 *
 * Future enhancements:
 * - Load assistants from Supabase
 * - Show analytics (calls, transfers, etc.)
 * - Filter/search by name or status
 * - Bulk actions (delete multiple, archive)
 */
export default function AssistantsLibraryPage() {
  // TODO: Fetch assistants from Supabase when persistence is implemented
  // const { data: assistants, isLoading } = useSWR('/api/assistants', fetcher);

  const hasAssistants = false; // Hardcoded for now

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <PageHeader
          title="Voice Assistants"
          description="Create and manage your AI voice assistants"
          icon={Phone}
        />
        <Link href="/assistants/new">
          <Button size="lg">Create Assistant</Button>
        </Link>
      </div>

      {!hasAssistants ? (
        <div className="bg-muted rounded-lg p-12 text-center">
          <Phone className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">No assistants yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first voice assistant to get started with AI-powered phone calls.
          </p>
          <Link href="/assistants/new">
            <Button size="lg">Create Your First Assistant</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* TODO: Map over assistants and render AssistantCard components */}
          {/* {assistants.map((assistant) => (
            <AssistantCard key={assistant.id} assistant={assistant} />
          ))} */}
        </div>
      )}
    </div>
  );
}
