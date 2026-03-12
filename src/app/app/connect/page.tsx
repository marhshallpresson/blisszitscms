'use client';
import { useState } from 'react';
import { buildMetaAuthUrl } from '@/lib/meta/oauth';
import { buildThreadsAuthUrl } from '@/lib/meta/threads-oauth';
import { buildLinkedInAuthUrl } from '@/lib/linkedin/oauth';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// Feature groups — map features to permissions across platforms
const META_FEATURES = [
  {
    id: 'publish',
    label: 'Publishing & Scheduling',
    icon: '📅',
    description: 'Create and schedule posts to Pages and feeds',
    permissions: ['pages_manage_posts', 'instagram_content_publish', 'publish_video'],
  },
  {
    id: 'inbox',
    label: 'Inbox & Comments',
    icon: '💬',
    description: 'Read and reply to comments, DMs, and Messenger',
    permissions: ['pages_messaging', 'instagram_manage_messages', 'pages_manage_engagement'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📊',
    description: 'View reach, impressions, and engagement data',
    permissions: ['pages_read_engagement', 'instagram_manage_insights'],
  },
];

const LINKEDIN_FEATURES = [
  {
    id: 'li_publish',
    label: 'Page Publishing',
    icon: '📝',
    description: 'Post articles, images, and videos to Company Pages',
    permissions: ['w_organization_social'],
    note: 'Note: LinkedIn Groups API is not publicly available. Comments are supported; Direct Messaging requires Tier 1 CRM partner status.',
  },
  {
    id: 'li_analytics',
    label: 'Analytics',
    icon: '📈',
    description: 'Read engagement stats for Company Page posts',
    permissions: ['r_organization_social'],
  },
];

type Platform = 'meta' | 'threads' | 'linkedin';

export default function ConnectPage() {
  const { currentWorkspaceId } = useWorkspace();
  const [metaFeatures, setMetaFeatures] = useState<string[]>([]);
  const [linkedInFeatures, setLiFeatures] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<Set<Platform>>(new Set());
  const [connecting, setConnecting] = useState<Platform | null>(null);

  const togglePlatform = (p: Platform) =>
    setPlatforms(prev => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });

  const handleConnectAll = async () => {
    if (!currentWorkspaceId) {
      alert('Please select a workspace first.');
      return;
    }

    setConnecting(platforms.values().next().value); // Set initial connecting state
    
    // Encode workspaceId in state
    const stateObj = {
      nonce: crypto.randomUUID(),
      workspaceId: currentWorkspaceId
    };
    const state = JSON.stringify(stateObj);
    sessionStorage.setItem('oauth_state', state);

    // Queue: Meta first (IG depends on it), then Threads, then LinkedIn
    const queue: Platform[] = [];
    if (platforms.has('meta')) queue.push('meta');
    if (platforms.has('threads')) queue.push('threads');
    if (platforms.has('linkedin')) queue.push('linkedin');
    sessionStorage.setItem('oauth_queue', JSON.stringify(queue.slice(1))); // Store remaining queue

    if (queue[0] === 'meta') {
      window.location.href = buildMetaAuthUrl(state);
    } else if (queue[0] === 'threads') {
      window.location.href = buildThreadsAuthUrl(state);
    } else if (queue[0] === 'linkedin') {
      window.location.href = buildLinkedInAuthUrl(state);
    }
  };

  const totalSelected = platforms.size;

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Connect Your Social Accounts</h1>
        <p className="text-muted-foreground mt-1">
          Select platforms below. One click per platform — we request only the
          minimum permissions needed for the features you choose.
        </p>
        {!currentWorkspaceId && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            ⚠️ No workspace selected. Please select a workspace from the dashboard first.
          </div>
        )}
      </div>

      {/* Meta Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="meta-toggle"
            checked={platforms.has('meta')}
            onChange={() => togglePlatform('meta')}
            className="w-4 h-4"
          />
          <label htmlFor="meta-toggle" className="font-semibold text-lg cursor-pointer">
            🔵 Meta — Facebook + Instagram
          </label>
        </div>
        {platforms.has('meta') && (
          <div className="ml-7 space-y-2">
            {META_FEATURES.map(f => (
              <label key={f.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={metaFeatures.includes(f.id)}
                  onChange={() => setMetaFeatures(prev =>
                    prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]
                  )}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium text-sm">{f.icon} {f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.description}</div>
                  <details className="mt-1">
                    <summary className="text-xs text-blue-500 cursor-pointer">
                      {f.permissions.length} permissions
                    </summary>
                    <div className="font-mono text-xs text-muted-foreground mt-1">
                      {f.permissions.map(p => <div key={p}>• {p}</div>)}
                    </div>
                  </details>
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Threads Section */}
      <section className="flex items-center gap-3">
        <input
          type="checkbox"
          id="threads-toggle"
          checked={platforms.has('threads')}
          onChange={() => togglePlatform('threads')}
          className="w-4 h-4"
        />
        <label htmlFor="threads-toggle" className="font-semibold text-lg cursor-pointer">
          ⚫ Threads
          <span className="text-sm font-normal text-muted-foreground ml-2">
            — Posts + Replies (500 char limit)
          </span>
        </label>
      </section>

      {/* LinkedIn Section */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="li-toggle"
            checked={platforms.has('linkedin')}
            onChange={() => togglePlatform('linkedin')}
            className="w-4 h-4"
          />
          <label htmlFor="li-toggle" className="font-semibold text-lg cursor-pointer">
            🔷 LinkedIn — Company Pages
            <span className="text-sm font-normal text-muted-foreground ml-2">
              — All pages auto-discovered from your Business Portfolio
            </span>
          </label>
        </div>
        {platforms.has('linkedin') && (
          <div className="ml-7 space-y-2">
            {LINKEDIN_FEATURES.map(f => (
              <label key={f.id} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={linkedInFeatures.includes(f.id)}
                  onChange={() => setLiFeatures(prev =>
                    prev.includes(f.id) ? prev.filter(x => x !== f.id) : [...prev, f.id]
                  )}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-medium text-sm">{f.icon} {f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.description}</div>
                  {f.note && (
                    <div className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
                      ⚠️ {f.note}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={handleConnectAll}
        disabled={totalSelected === 0 || !!connecting || !currentWorkspaceId}
        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-base disabled:opacity-50"
      >
        {connecting
          ? `Connecting ${connecting}...`
          : totalSelected === 0
          ? 'Select at least one platform'
          : `Connect ${totalSelected} platform${totalSelected > 1 ? 's' : ''} →`}
      </button>

      <div className="text-xs text-center text-muted-foreground space-y-1">
        <p>LinkedIn: All Company Pages you administer are discovered automatically — no manual selection needed.</p>
        <p>We never post without your explicit action. AI-generated replies are always labeled.</p>
        <p>Revoke access anytime in Settings → Connected Accounts.</p>
      </div>
    </div>
  );
}
