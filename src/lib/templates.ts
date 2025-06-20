
// src/lib/templates.ts
export interface ThirtyDayChallengeTemplateItem {
  title: string;
  idea: string; 
  script: string;
  caption: string;
  // Removed day, goal, tools, status to simplify mapping to ContentItem
  // Status will default to 'Draft' and dueDate will be empty when seeding
}

export const thirtyDayChallengeTemplate: ThirtyDayChallengeTemplateItem[] = [
  {
    title: "Day 1: Mindset Monday - The 'Why'",
    idea: "Re-introduce yourself, set the tone, and state your mission for the 30 days. My challenge: What's ONE thing you've been putting off?",
    script: "1. HOOK: 'The man behind the camera is FINALLY stepping in front of it! 🔥 But why now?'\n2. STORY: Talk about your 5 years building for others and the internal battle of starting for yourself. Introduce 'action as the antidote to fear.'\n3. CTA: 'My challenge to you today: What is ONE thing you've been putting off? Write it down. Acknowledge it in the comments.'",
    caption: "New Chapter! After 5 years creating for clients, I'm starting my own content journey for 30 days. E no easy, but we move! Let's do this together. #My30DayChallenge #ContentCreatorJourney"
  },
  {
    title: "Day 2: Tech Tuesday - AI Tool Hack",
    idea: "Provide immediate value by introducing an AI tool that solves a common problem for creatives. E.g., 'Watch me generate 10 video ideas in 30 seconds.'",
    script: "1. HOOK: 'Your creative workflow is about to get an upgrade. You're welcome.'\n2. PROBLEM: 'Creatives spend too much time on repetitive tasks like writing captions or generating ideas.'\n3. SOLUTION: Do a quick screen recording showing ONE powerful feature of an AI tool (e.g., Genkit, a specific prompt).",
    caption: "Stop doing creative work the hard way. This free AI tool/technique is about to become your best friend. #TechTips #AIforCreatives #CreatorTools"
  },
  {
    title: "Day 3: Work Wednesday - Photography Tip",
    idea: "Share a practical, easy-to-implement photography tip. E.g., Using 'soft light' from a window for better selfies.",
    script: "1. HOOK: 'Stop taking flat photos. Let me show you how to add depth in 10 seconds.'\n2. DEMO: Explain and demonstrate 'soft light'. Film yourself first under a harsh light, then turn to face a window. The difference will be dramatic.\n3. CTA: 'Take a selfie facing a window. Post it in your story and tag me! #MyLightTip'",
    caption: "Your phone camera is powerful, but you're probably making this one lighting mistake. Here's how to fix it. #PhotographyTips #MobilePhotography #ContentHacks"
  },
  {
    title: "Day 4: Truth Thursday - Imposter Syndrome",
    idea: "Omo, Day 4... The Imposter Syndrome is Real. Build deep trust and relatability by being vulnerable about the challenges.",
    script: "1. HOOK: 'Let's be real about this challenge. It's not all 'lights, camera, action'.'\n2. STORY: 'Woke up today feeling like, 'Who am I to teach this stuff?'' Talk about how you overcame it (e.g., looking at past work, a quick prayer, remembering your 'why').\n3. CTA: 'If you've ever felt like an imposter, just drop a 'ME TOO' in the comments. You are not alone.'",
    caption: "Truthfully, Day 4 was tough. Imposter syndrome is real. But the mission is bigger than the doubt. Progress, not perfection. We move. #CreatorJourney #ImposterSyndrome"
  },
  {
    title: "Day 5: Fun Friday - Sci-Fi Movies & Tech",
    idea: "Sci-Fi Movies That Actually Get The Tech Right. Entertain and showcase your analytical mind.",
    script: "1. HOOK: 'Hollywood often gets tech wrong. But these three movies? Scarily accurate.'\n2. LIST: List 3 movies (e.g., Her, Ex Machina, Minority Report) and briefly explain ONE piece of tech from each that is becoming a reality.\n3. CTA: 'What's a sci-fi movie that blew your mind? Drop it below!'",
    caption: "My top 3 Sci-Fi movies that are basically documentaries from the future. What did I miss? #MovieReview #SciFi #FutureTech"
  },
  {
    title: "Day 6: Social Saturday - Instagram 'Add Yours'",
    idea: "Instagram's 'Add Yours' Sticker: You're Using It Wrong. Give your audience a tool they can use immediately to grow.",
    script: "1. HOOK: 'Stop just reposting 'Add Yours' templates. Start CREATING them for your brand.'\n2. DEMO: Show how to create a sticker specific to a brand. E.g. 'Add Yours: Show me your workspace.' Explain how it creates a chain of user-generated content.\n3. CTA: 'Try it this week. Let me know what prompt you create!'",
    caption: "You're using the 'Add Yours' sticker all wrong! It’s a free marketing tool if you use it strategically. Here's how. #InstagramHacks #SocialMediaTips"
  },
  {
    title: "Day 7: Soulful Sunday - Week 1 Reflection",
    idea: "Gratitude and Grace: Reflecting on Week 1. Show a calmer side, connect on values.",
    script: "1. HOOK: 'One week down. Omo... we did it.'\n2. REFLECTION: 'The grace to just show up... and the encouragement from you guys...'\n3. CTA: 'What's one thing you're thankful for today?'",
    caption: "Week 1 is a wrap. My biggest takeaway is the power of God's grace to just... start. #SoulfulSunday #Gratitude #ChristianCreative"
  },
   {
    title: "Day 8: Mindset Monday - 2-Minute Rule",
    idea: "The 2-Minute Rule to Destroy Procrastination. Actionable value citing 'Atomic Habits'.",
    script: "1. HOOK: 'This 2-minute rule will change your life.'\n2. PROBLEM: 'Big task = big fear.'\n3. SOLUTION: 'Start for just two minutes. 'Read a book' becomes 'Read one page'.'\n4. CTA: 'Pick ONE thing, do it for 2 mins, and report back!'",
    caption: "Learned from 'Atomic Habits' and it's a game-changer. The 2-Minute Rule makes starting so easy, you can't say no. #MindsetMonday #ProductivityHacks"
  },
  {
    title: "Day 9: Tech Tuesday - Phone Camera Hidden Feature",
    idea: "The Hidden Feature in Your Phone's Camera Roll. Deliver a high-value, practical tip about 'Lift Subject from Background'.",
    script: "1. HOOK: 'Stop paying for apps to remove backgrounds.'\n2. TUTORIAL: 'Open gallery... press and hold subject... drag it.'\n3. CTA: 'Tag a friend who needs to see this!'",
    caption: "I bet you didn't know your phone had this superpower. The best tech is the tech you already have. #TechTuesday #PhoneHacks"
  },
  {
    title: "Day 10: Work Wednesday - What is Live Media?",
    idea: "Explain a core service (Brand Photography) as a solution.",
    script: "1. HOOK: 'Your business is amazing, but do your photos prove it?'\n2. PROBLEM/SOLUTION: 'Low-quality photos attract low-quality interest... We create photography that tells your story and attracts your ideal client.'\n3. CTA: 'DM me 'GROWTH' for an analysis.'",
    caption: "High-quality brand photography isn't an expense, it's an investment. It's your brand's first impression. #LiveMedia #BrandPhotography"
  },
  {
    title: "Day 11: Truth Thursday - My Biggest Failure",
    idea: "My Biggest Failure as a Photographer. Build trust through transparency.",
    script: "1. HOOK: 'Let me tell you about the time I almost ruined a client's wedding photos.'\n2. STORY: 'Memory card corrupted... had to tell the couple.'\n3. LESSON: 'Redundancy. Shoot with two cards, back up immediately. That mistake made me a better, more reliable photographer.'\n4. CTA: 'What's a failure that taught you a valuable lesson?'",
    caption: "Failure isn't the end. It's often the most painful, but most effective, teacher. #FailureIsFeedback #CreatorJourney"
  },
  {
    title: "Day 12: Fun Friday - Eket Food Tour",
    idea: "Eket Food Tour! My top spot for Afang soup. Show personality and connect locally.",
    script: "1. HOOK: 'You can't be in Akwa Ibom and not know the best place for Afang soup. Let me plug you.'\n2. SHOWCASE: Show the restaurant, the vibe, the food up close.\n3. REVIEW: 'Here's why it's the best...'\n4. CTA: 'Where is your go-to spot in Eket?'",
    caption: "My official top spot for Afang soup in Eket. No contest! Drop your recommendations below. #EketFood #AkwaIbom #NigerianFood"
  },
  {
    title: "Day 13: Social Saturday - Hidden TikTok Share",
    idea: "The Hidden Share Button on TikTok. Share a niche, high-value tip.",
    script: "1. HOOK: 'Stop sharing TikToks the boring way.'\n2. DEMO: Show the feature that allows sharing to specific groups of friends and explain why the algorithm loves it.\n3. CTA: 'Did you know about this? Try it and see if your views improve!'",
    caption: "The TikTok algorithm is all about community. Use this hidden sharing feature to boost your views. #TikTokTips #SocialMediaStrategy"
  },
  {
    title: "Day 14: Soulful Sunday - Live Q&A",
    idea: "Live Q&A Session. Engage directly with the community.",
    script: "Announce the Q&A in your stories beforehand. Go live, welcome everyone, and start taking questions on faith, business, and the challenge.",
    caption: "Going LIVE this Sunday! Ask me anything about faith, my business (Live Media), or this crazy 30-day challenge. Let's talk! #LiveQandA #Community"
  },
  {
    title: "Day 15: Mindset Monday - Unshakeable Confidence",
    idea: "Building Unshakeable Confidence. Share a psychological trick (Power Posing).",
    script: "1. HOOK: 'Feel like a fraud? Try this for 60 seconds.'\n2. DEMO: Explain Amy Cuddy's 'Power Posing' research. Demonstrate a power pose.\n3. CTA: 'Try this before your next big meeting or task. Challenge: Do it and tell me if you felt a difference.'",
    caption: "It's not 'fake it till you make it'. It's 'fake it till you BECOME it'. Your body language can change your mind. #ConfidenceHack #Mindset"
  },
  {
    title: "Day 16: Tech Tuesday - Smartphone Pro Camera Mode",
    idea: "Your Smartphone is a Pro Camera. Teach basics of manual mode.",
    script: "1. HOOK: 'Unlock your phone's 'Pro' camera mode with me.'\n2. DEMO: Briefly explain ISO, Shutter Speed, and White Balance. Show a practical example of how adjusting one of these can dramatically change a photo.\n3. CTA: 'Go to your Pro mode and play with one setting. What did you discover?'",
    caption: "Your phone has a powerful camera, but are you still on auto? Let's unlock Pro mode. #MobilePhotography #TechTips"
  },
  {
    title: "Day 17: Work Wednesday - Live Media Case Study",
    idea: "Live Media Case Study. Show, don't just tell, the value of your services.",
    script: "1. HOOK: 'How we helped a brand double their engagement with one photoshoot.'\n2. DEMO: Show the 'before' photos of a client and the professional 'after' shots you took, explaining the strategy.\n3. CTA: 'This is the power of strategic media. DM me 'GROWTH' for a free analysis of your brand's page.'",
    caption: "Results talk. Here's a quick look at how strategic branding can transform a business's online presence. #LiveMedia #CaseStudy #Branding"
  },
  {
    title: "Day 18: Truth Thursday - Letter to Younger Self",
    idea: "A Letter to My Younger Self. Share a raw, emotional piece of storytelling.",
    script: "Read a pre-written, heartfelt letter to the Marshall who was just starting out 5 years ago. Talk about fears, mistakes, and things you wish you knew.",
    caption: "5 years ago, I started this journey. Here's what I wish I could tell myself back then. #CreatorJourney #LetterToMyYoungerSelf"
  },
  {
    title: "Day 19: Fun Friday - Movie Review (EEAAO)",
    idea: "Why Every Creative MUST Watch 'Everything Everywhere All At Once'. Share a movie review that connects to the creative struggle.",
    script: "Talk about the themes of burnout, finding purpose in chaos, and how it mirrors the life of a modern creative.",
    caption: "This movie isn't just a movie, it's a documentary about my brain. Why every creative needs to watch 'Everything Everywhere All At Once'. #MovieReview #CreativeLife"
  },
  {
    title: "Day 20: Social Saturday - Custom IG Story Filter",
    idea: "Create a Custom Instagram Story Filter in 10 Minutes. Provide a fun, advanced tutorial.",
    script: "A quick screen-recording tutorial showing the simplest way to make a basic filter with a name or logo using Spark AR Studio (or similar free tool).",
    caption: "Let's level up your brand. Here's how to create your own custom IG filter. It's easier than you think! #InstagramFilter #AR #SocialMediaHacks"
  },
  {
    title: "Day 21: Soulful Sunday - Finding Peace",
    idea: "Finding Peace in a Hectic World. Share a personal spiritual practice.",
    script: "Share a scripture or religious concept (e.g., Sabbath, meditation) that helps you disconnect and recharge. Ask your audience to share their methods.",
    caption: "The hustle is loud, but peace is essential. Here's one spiritual practice that keeps me grounded as a creative. #FaithAndWork #ChristianCreative #Peace"
  },
  {
    title: "Day 22: Mindset Monday - Never Look Back",
    idea: "The Mindset of 'Never Look Back'. Motivate audience to overcome past regrets.",
    script: "Talk about overcoming past regrets to focus on what you can control: your actions today. Frame it as a strategy for success.",
    caption: "You can't start the next chapter of your life if you keep re-reading the last one. #Mindset #Motivation #NeverLookBack"
  },
  {
    title: "Day 23: Tech Tuesday - Tech Trends for 2025",
    idea: "Tech Trends for 2025: What Nigerian Creatives Need to Know NOW. Position yourself as a forward-thinker.",
    script: "Talk about the growing importance of AI tools in editing, short-form video monetization, and the local creator economy.",
    caption: "The game is always changing. Here are the tech trends Nigerian creatives need to have on their radar for the coming year. #TechTrends #FutureofWork"
  },
  {
    title: "Day 24: Work Wednesday - Brand Growth Readiness",
    idea: "Is Your Brand Ready for Growth? Make a direct but value-packed pitch.",
    script: "Frame it as a helpful checklist. 'If you want to grow, your media needs to be strategic. Do you have X, Y, Z?' This naturally leads to a soft pitch for a Live Media consultation.",
    caption: "A quick health check for your brand. Are you positioned for growth? #Branding #BusinessTips #LiveMedia"
  },
  {
    title: "Day 25: Truth Thursday - Reacting to Week 1 Videos",
    idea: "Reacting to my Week 1 Videos. Show measurable growth and have a fun, reflective moment.",
    script: "Use a picture-in-picture format to play your Day 1 video and react to it. Laugh at yourself, point out improvements. It shows humility and progress.",
    caption: "I'm reacting to my first video from this challenge and... Omo. The growth is real. #Progress #CreatorJourney"
  },
  {
    title: "Day 26: Fun Friday - Live-Action Adaptations",
    idea: "Live-Action Adaptations: Hit or Miss? Spark a fun debate.",
    script: "Give your hot take on a recent adaptation (e.g., The Last of Us, One Piece, Avatar). Ask for your audience's opinions.",
    caption: "Live-action adaptations... can we talk about them? Here's my take on the latest ones. What do you think? Hit or miss? #MovieReview #Netflix"
  },
  {
    title: "Day 27: Social Saturday - LinkedIn Creator Mode",
    idea: "The LinkedIn Feature No One Talks About. Provide a tip for a different platform.",
    script: "Show how to use LinkedIn's 'Creator Mode' and newsletter feature to build a professional brand.",
    caption: "Don't sleep on LinkedIn! This one feature can help you build serious authority in your industry. #LinkedInTips #PersonalBranding"
  },
  {
    title: "Day 28: Soulful Sunday - Thank You Community",
    idea: "A 'Thank You' to My Community. Make your audience the heroes.",
    script: "Create a compilation of screenshots of the best comments, DMs, and user-generated content from the challenge set to emotional music.",
    caption: "Day 28. I thought this challenge was about me, but it was about US. Thank you. #Community #Gratitude"
  },
  {
    title: "Day 29: Mindset Monday - 3 Biggest Lessons",
    idea: "My 3 Biggest Lessons from 29 Days of Content. Summarize key takeaways.",
    script: "Summarize your biggest lessons on consistency, vulnerability, and community.",
    caption: "30 days of content. Here are the 3 biggest things I learned. #LessonsLearned #CreatorLife"
  },
  {
    title: "Day 30: Tech Tuesday - The End is the Beginning",
    idea: "The End is Just The Beginning. Celebrate and announce what's next.",
    script: "Celebrate! Announce your new, sustainable posting schedule (e.g., '3 times a week') or a new series. Don't just stop.",
    caption: "WE DID IT! 30 days. The challenge is over, but our journey is just beginning. Thank you for everything. Here's what's next... #ChallengeComplete #WhatsNext"
  }
];
