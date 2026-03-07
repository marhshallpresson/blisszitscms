import { redirect } from 'next/navigation';

interface WorkspaceDashboardRedirectPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceDashboardRedirectPage({ params }: WorkspaceDashboardRedirectPageProps) {
  const { workspaceId } = await params;
  redirect(`/app/workspace/${workspaceId}`);
}
