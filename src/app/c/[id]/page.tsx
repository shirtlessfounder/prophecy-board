import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ConnectionView from './ConnectionView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  // In production, fetch the connection and generate proper OG tags
  return {
    title: `Prophecy Board — Connection ${id}`,
    description: 'Biblical prophecy mapped to modern AI/tech. Click to explore the evidence.',
    openGraph: {
      title: `Prophecy Board — Connection`,
      description: 'Biblical prophecy mapped to modern AI/tech.',
      type: 'article',
    },
  };
}

export default async function ConnectionPage({ params }: PageProps) {
  const { id } = await params;
  return <ConnectionView id={id} />;
}
