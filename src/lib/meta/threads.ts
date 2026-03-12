const THREADS_GRAPH = 'https://graph.threads.net/v1.0';
const AI_DISCLOSURE = '

— Automated reply';
const THREADS_MAX_CHARS = 500;
const THREADS_MAX_WITH_DISCLOSURE = THREADS_MAX_CHARS - AI_DISCLOSURE.length; // 484

interface ThreadsContent {
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'TEXT' | 'IMAGE' | 'VIDEO';
  replyToId?: string;
  carouselItems?: Array<{ imageUrl?: string; videoUrl?: string; text?: string }>;
}

export async function publishToThreads(
  userId: string,
  token: string,
  content: ThreadsContent
): Promise<{ id: string }> {
  if (content.text && content.text.length > THREADS_MAX_CHARS) {
    throw new Error(
      `Threads 500-char hard limit exceeded (${content.text.length} chars). Trim content before publishing.`
    );
  }

  const creationId = content.carouselItems?.length
    ? await createThreadsCarousel(userId, token, content)
    : await createThreadsContainer(userId, token, content);

  if (content.mediaType === 'VIDEO') {
    await pollThreadsContainer(creationId, token);
  }

  const pubRes = await fetch(`${THREADS_GRAPH}/${userId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: creationId, access_token: token }),
  });
  const result = await pubRes.json();
  if (result.error) throw new Error(`[Threads publish] ${result.error.message}`);
  return result;
}

async function createThreadsContainer(userId: string, token: string, content: ThreadsContent): Promise<string> {
  const res = await fetch(`${THREADS_GRAPH}/${userId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: content.text,
      image_url: content.imageUrl,
      video_url: content.videoUrl,
      media_type: content.mediaType ?? 'TEXT',
      reply_to_id: content.replyToId,
      access_token: token,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`[Threads container] ${data.error.message}`);
  return data.id;
}

// Threads carousels require recursive Child-Parent container structure
async function createThreadsCarousel(userId: string, token: string, content: ThreadsContent): Promise<string> {
  const childIds: string[] = [];
  for (const item of content.carouselItems!) {
    const res = await fetch(`${THREADS_GRAPH}/${userId}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_carousel_item: true,
        image_url: item.imageUrl,
        video_url: item.videoUrl,
        text: item.text,
        media_type: item.videoUrl ? 'VIDEO' : 'IMAGE',
        access_token: token,
      }),
    });
    const { id, error } = await res.json();
    if (error) throw new Error(`[Threads carousel child] ${error.message}`);
    childIds.push(id);
  }

  const parentRes = await fetch(`${THREADS_GRAPH}/${userId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      text: content.text,
      access_token: token,
    }),
  });
  const parent = await parentRes.json();
  if (parent.error) throw new Error(`[Threads carousel parent] ${parent.error.message}`);
  return parent.id;
}

async function pollThreadsContainer(id: string, token: string, maxAttempts = 10): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${THREADS_GRAPH}/${id}?fields=status&access_token=${token}`);
    const { status } = await res.json();
    if (status === 'FINISHED') return;
    if (status === 'ERROR') throw new Error('Threads container failed');
    await new Promise(r => setTimeout(r, 3000));
  }
  throw new Error('Threads container timed out');
}

export async function replyToThread(
  threadId: string,
  userId: string,
  token: string,
  text: string,
  isAiGenerated = false
): Promise<void> {
  const maxLen = isAiGenerated ? THREADS_MAX_WITH_DISCLOSURE : THREADS_MAX_CHARS;
  if (text.length > maxLen) {
    throw new Error(`Threads reply exceeds ${maxLen} chars (${text.length})`);
  }
  const finalText = isAiGenerated ? `${text}${AI_DISCLOSURE}` : text;
  await publishToThreads(userId, token, {
    text: finalText,
    mediaType: 'TEXT',
    replyToId: threadId,
  });
}
