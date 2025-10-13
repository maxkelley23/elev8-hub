import { LucideIcon, Wallet, Megaphone, Video, FileText, Mail, BookOpen, Palette, Anchor, Ban, Database, FolderOpen } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo' | 'teal';
  category: 'finance' | 'marketing' | 'creative' | 'productivity' | 'library';
  status: 'active' | 'beta' | 'coming-soon';
}

export const TOOLS: Tool[] = [
  // Phase 1 Tools
  {
    id: 'expenses',
    name: 'Expense Tracker',
    description: 'Track and manage monthly expenses with prorated calculations',
    icon: Wallet,
    href: '/expenses',
    color: 'green',
    category: 'finance',
    status: 'active',
  },
  {
    id: 'campaign-library',
    name: 'Campaign Library',
    description: 'View and manage your saved campaigns',
    icon: FolderOpen,
    href: '/campaigns',
    color: 'purple',
    category: 'marketing',
    status: 'active',
  },
  {
    id: 'campaigns',
    name: 'Campaign Generator',
    description: 'AI-powered email and LinkedIn campaign builder',
    icon: Megaphone,
    href: '/campaigns/new',
    color: 'blue',
    category: 'marketing',
    status: 'active',
  },

  // Phase 2 Tools - Creative OS
  {
    id: 'video-prompts',
    name: 'Video Prompt Lab',
    description: 'Create AI video prompts with continuity and stills',
    icon: Video,
    href: '/creative/video/new',
    color: 'purple',
    category: 'creative',
    status: 'coming-soon',
  },
  {
    id: 'blog',
    name: 'Blog Studio',
    description: 'AI-assisted blog post writing and optimization',
    icon: FileText,
    href: '/creative/blog/new',
    color: 'orange',
    category: 'creative',
    status: 'coming-soon',
  },
  {
    id: 'newsletter',
    name: 'Newsletter Studio',
    description: 'Design and generate newsletters with AI',
    icon: Mail,
    href: '/creative/newsletter/new',
    color: 'pink',
    category: 'creative',
    status: 'coming-soon',
  },

  // Shared Libraries
  {
    id: 'brand-kit',
    name: 'Brand Kit',
    description: 'Colors, fonts, CTAs, and brand guidelines',
    icon: Palette,
    href: '/libraries/brand-kit',
    color: 'indigo',
    category: 'library',
    status: 'coming-soon',
  },
  {
    id: 'anchors',
    name: 'Continuity Anchors',
    description: 'Visual elements for consistent video storytelling',
    icon: Anchor,
    href: '/libraries/anchors',
    color: 'teal',
    category: 'library',
    status: 'coming-soon',
  },
  {
    id: 'negatives',
    name: 'Negative Prompts',
    description: 'Unwanted elements to exclude from AI generations',
    icon: Ban,
    href: '/libraries/negatives',
    color: 'purple',
    category: 'library',
    status: 'coming-soon',
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base',
    description: 'Compliance rules, best practices, and guidelines',
    icon: BookOpen,
    href: '/libraries/knowledge-base',
    color: 'blue',
    category: 'library',
    status: 'coming-soon',
  },
];

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

export function getToolsByCategory(category: Tool['category']): Tool[] {
  return TOOLS.filter((tool) => tool.category === category);
}

export function getActiveTools(): Tool[] {
  return TOOLS.filter((tool) => tool.status === 'active');
}
