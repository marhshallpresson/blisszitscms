
// src/lib/templates.ts
export interface ThirtyDayChallengeTemplateItem {
  title: string;
  coreIdea: string;
  script: string;
  caption: string;
}

export const thirtyDayChallengeTemplate: ThirtyDayChallengeTemplateItem[] = [
  {
    title: "Day 1: Mindset Monday - The 'Why'",
    coreIdea: "Re-introduce yourself, set the tone, and state your mission for the 30 days. My challenge: What's ONE thing you've been putting off?",
    script: "1. HOOK: 'The man behind the camera is FINALLY stepping in front of it! 🔥 But why now?'\n2. STORY: Talk about your 5 years building for others and the internal battle of starting for yourself. Introduce 'action as the antidote to fear.'\n3. CTA: 'My challenge to you today: What is ONE thing you've been putting off? Write it down. Acknowledge it in the comments.'",
    caption: "New Chapter! After 5 years creating for clients, I'm starting my own content journey for 30 days. E no easy, but we move! Let's do this together. #My30DayChallenge #ContentCreatorJourney"
  },
  {
    title: "Day 2: Tech Tuesday - AI Tool Hack",
    coreIdea: "Provide immediate value by introducing an AI tool that solves a common problem for creatives. E.g., 'Watch me generate 10 video ideas in 30 seconds.'",
    script: "1. HOOK: 'Your creative workflow is about to get an upgrade. You're welcome.'\n2. PROBLEM: 'Creatives spend too much time on repetitive tasks like writing captions or generating ideas.'\n3. SOLUTION: Do a quick screen recording showing ONE powerful feature of an AI tool (e.g., Genkit, a specific prompt).",
    caption: "Stop doing creative work the hard way. This free AI tool/technique is about to become your best friend. #TechTips #AIforCreatives #CreatorTools"
  },
  {
    title: "Day 3: Work Wednesday - Photography Tip",
    coreIdea: "Share a practical, easy-to-implement photography tip. E.g., Using 'soft light' from a window for better selfies.",
    script: "1. HOOK: 'Stop taking flat photos. Let me show you how to add depth in 10 seconds.'\n2. DEMO: Explain and demonstrate 'soft light'. Film yourself first under a harsh light, then turn to face a window. The difference will be dramatic.\n3. CTA: 'Take a selfie facing a window. Post it in your story and tag me! #MyLightTip'",
    caption: "Your phone camera is powerful, but you're probably making this one lighting mistake. Here's how to fix it. #PhotographyTips #MobilePhotography #ContentHacks"
  },
  // Add more template items as needed (up to 30 for a full challenge)
];
