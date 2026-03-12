const GRAPH = 'https://graph.facebook.com/v22.0';
const AI_DISCLOSURE = '

— Automated reply';
type IgMediaType = 'IMAGE' | 'VIDEO' | 'REELS' | 'CAROUSEL';

interface IgContent {
  caption?: string;          // Max 2,200 chars; first 125 shown in feed
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: IgMediaType;
  carouselItems?: Array<{ imageUrl?: string; videoUrl?: string }>;
}

export async function publishToInstagram(
  igUserId: string,
  igToken: string,
  content: IgContent
): Promise<{ id: string }> {
  const containerId = content.mediaType === 'CAROUSEL' && content.carouselItems?.length
    ? await createIgCarousel(igUserId, igToken, content)
    : await createIgContainer(igUserId, igToken, content);

  await pollIgContainer(containerId, igToken);

  const pubRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: containerId, access_token: igToken }),
  });
  const result = await pubRes.json();
  if (result.error) throw new Error(`[IG publish] ${result.error.message}`);
  return result;
}

async function createIgContainer(igUserId: string, token: string, content: IgContent): Promise<string> {
  const body: Record<string, string> = {
    caption: content.caption ?? '',
    access_token: token,
  };

  if (content.mediaType === 'VIDEO' || content.mediaType === 'REELS') {
    body.video_url = content.videoUrl!;
    body.media_type = content.mediaType;
  } else {
    body.image_url = content.imageUrl!;
    body.media_type = 'IMAGE';
  }

  const res = await fetch(`${GRAPH}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.error) throw new Error(`[IG container] ${data.error.message}`);
  return data.id;
}

async function createIgCarousel(igUserId: string, token: string, content: IgContent): Promise<string> {
  const childIds: string[] = [];
  for (const item of content.carouselItems!) {
    const res = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: item.imageUrl,
        video_url: item.videoUrl,
        is_carousel_item: true,
        access_token: token,
      }),
    });
    const { id, error } = await res.json();
    if (error) throw new Error(`[IG carousel child] ${error.message}`);
    childIds.push(id);
  }

  const res = await fetch(`${GRAPH}/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption: content.caption,
      access_token: token,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`[IG carousel parent] ${data.error.message}`);
  return data.id;
}

async function pollIgContainer(
  containerId: string,
  token: string,
  maxAttempts = 15,
  intervalMs = 3000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH}/${containerId}?fields=status_code,status&access_token=${token}`
    );
    const { status_code } = await res.json();
    if (status_code === 'FINISHED') return;
    if (status_code === 'ERROR') throw new Error('IG container processing failed');
    if (status_code === 'EXPIRED') throw new Error('IG container expired (>24h)');
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('IG container polling timed out after 45 seconds');
}

export async function replyToIgComment(
  commentId: string,
  message: string,
  igToken: string,
  isAiGenerated = false
): Promise<void> {
  const text = isAiGenerated ? `${message}${AI_DISCLOSURE}` : message;
  await fetch(`${GRAPH}/${commentId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text, access_token: igToken }),
  });
}
