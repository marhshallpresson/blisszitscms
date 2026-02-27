> Superseded for execution: use `prd.md` (canonical product/technical spec), `build-reality.md` (implementation truth), and `gtm.md` (market/pricing/copy).
> This file is retained only as strategic Phase 2+ reference.

# Blisszits OS - Technical Specification and Market

# Analysis

## Overview

Blisszits OS is positioned as an AI-native social operating system that unifies content planning, publishing,
engagement, analytics and learning. This document provides a deep technical specification of the product
(database schema, API and services) together with marketoriented insights: monetization projections,
competitive benchmarking and customerfacing marketing copy.

## 1. Full database schema

Blisszits OS uses a relational schema designed for modularity and scalability. Each workspace represents a
brand/client and holds separate content, permissions and social accounts. Key entities are summarised
below.

```
Table (entity) Purpose Key fields & relationships
```
```
users
stores user profiles and
authentication data.
```
```
id , email, name, password_hash,
created_at; has many
workspace_members.
```
```
workspaces
container for brands/clients;
isolates data across projects.
```
```
id , name, description,
owner_id (users.id),
created_at.
```
```
workspace_members
associates users with
workspaces and roles.
```
```
id , workspace_id, user_id,
role_id.
```
```
roles
```
```
defines permissions such as
Owner, Admin, Editor, Approver,
Analyst, Client.
```
```
id , name, permissions_json.
```
```
social_accounts
```
```
OAuth tokens and metadata for
each connected social profile
(Facebook page, Instagram
business, X account, LinkedIn
page, TikTok, YouTube etc.).
```
```
id , workspace_id, network,
account_name, access_token,
refresh_token, expires_at,
created_at.
```

Table (entity) Purpose Key fields & relationships

**posts**

```
canonical content objects,
independent of platform
variant.
```
```
id , workspace_id, title,
description, status (idea, draft,
review, scheduled, published, failed),
scheduled_at, published_at,
created_by.
```
**post_variants**
networkspecific versions of a
post (copy, media, hashtags).

```
id , post_id, social_account_id,
variant_text, media_asset_id,
first_comment, scheduled_at.
```
**media_assets**
uploaded images/videos stored
in S3compatible storage.

```
id , workspace_id, file_path,
file_type, size, created_at,
used by post_variants.
```
**approval_requests**

```
workflow records capturing
submissions, approver, status
and comments.
```
```
id , post_id, requested_by,
status (pending/approved/rejected),
reviewer_id, review_comment,
decision_at.
```
**inbox_threads**

```
unified conversation threads
across networks for
engagement.
```
```
id , workspace_id,
social_account_id,
external_thread_id, subject,
status (open/pending/done),
assigned_to, created_at.
```
**inbox_messages**
individual messages inside each
thread (comments, DMs).

```
id , thread_id, sender,
message_text, timestamp,
incoming boolean.
```
**analytics_snapshots**
aggregated metrics for posts
and social accounts.

```
id , post_id or
social_account_id, date,
impressions, reach, clicks,
likes, comments, shares,
followers.
```
**ai_tasks**

```
asynchronous AI jobs such as
idea generation, script writing
and repurposing.
```
```
id , workspace_id, type
(idea_generation/script/write_captions),
prompt, status, result_json,
created_at.
```
**notifications**

```
scheduled reminders or spike
alerts (e.g., listening spikes,
publishing failures).
```
```
id , workspace_id, type,
payload_json, seen, created_at.
```
**audit_logs**

```
immutable record of important
events (publishing, approvals,
login).
```
```
id , workspace_id, user_id,
event_type, details_json,
created_at.
```

The schema uses foreign key relationships with cascading deletes where appropriate (e.g., deleting a
workspace deletes its posts and associated variants). Sensitive OAuth tokens are encrypted at rest.

## 2. API endpoint structure

The REST/GraphQL API is organised around modules. Endpoints use JSON payloads and require
authentication. Only a highlevel list is provided here.

### Authentication & user management

```
Method & Endpoint Description
POST /auth/register create a user account.
```
```
POST /auth/login authenticate and issue JWT/refresh tokens.
```
```
POST /auth/logout revoke tokens.
```
```
GET /users/me fetch current user profile.
```
### Workspace & membership

```
Method & Endpoint Description
```
```
POST /workspaces create a new workspace (requires owner role).
GET /workspaces list workspaces the current user belongs to.
```
```
GET /workspaces/{id} get workspace details.
```
```
PATCH /workspaces/{id} update workspace name, description.
```
```
DELETE /workspaces/{id} delete a workspace (hard delete cascades).
POST /workspaces/{id}/invite invite a user by email; returns invite token.
```
```
PATCH /workspaces/{id}/members/{user_id} change role or revoke membership.
```
### Social account integration

```
Method & Endpoint Description
```
```
POST /workspaces/{id}/social-accounts connect a social profile via OAuth.
```
```
GET /workspaces/{id}/social-accounts list connected accounts.
```
```
DELETE /social-accounts/{id} revoke connection.
POST /social-accounts/{id}/refresh refresh OAuth token.
```

### Content management & publishing

```
Method & Endpoint Description
```
```
POST /workspaces/{id}/posts create a post (idea/draft) with title & description.
```
```
GET /workspaces/{id}/posts list posts with filtering (status, date range, assignee).
GET /posts/{id} get a post with variants.
```
```
PATCH /posts/{id} update title/description, status or scheduled time.
```
```
DELETE /posts/{id} delete a post and its variants.
```
```
POST /posts/{id}/variants create/update a variant for a network.
POST /posts/{id}/submit-for-approval request approval; creates approval_request.
```
```
POST /approval-requests/{id}/approve approve a post; requires Approver role.
```
```
POST /approval-requests/{id}/reject reject a post with comment.
```
```
POST /posts/{id}/publish-now publish immediately (overrides schedule).
```
Publishing triggers asynchronous jobs: a worker service picks up scheduled posts, posts them through the
appropriate social network API, handles retries and logs results.

### Engagement (unified inbox)

```
Method & Endpoint Description
```
```
GET /workspaces/{id}/inbox/
threads
list inbox threads with filters (status, account, assignee).
```
```
GET /inbox/threads/{thread_id} fetch a thread and its messages.
```
```
POST /inbox/threads/{thread_id}/
reply
```
```
send a reply; supports text/media and platformspecific
capabilities.
PATCH /inbox/threads/{thread_id} update status (open/pending/done) or assign to user.
```
### Analytics & reporting

```
Method & Endpoint Description
GET /workspaces/{id}/analytics/
summary
```
```
aggregated metrics across accounts (impressions,
engagement, follower growth).
```
```
GET /workspaces/{id}/analytics/posts timeseries metrics for posts; supports date ranges.
**GET /workspaces/{id}/analytics/
export?format=pdf
csv**
```

```
Method & Endpoint Description
GET /workspaces/{id}/analytics/best-
times
compute recommended posting times (Phase2).
```
### AI services

```
Method & Endpoint Description
```
```
POST /ai/idea-generator given industry, target audience and goals, return 30day content plan.
```
```
POST /ai/script-builder produce script outlines (hook/problem/solution/CTA) for a post.
```
```
POST /ai/repurpose turn an existing post into another format (e.g., tweet  LinkedIn carousel).
```
```
POST /ai/caption generate captions and hashtags given a brief and tone.
```
AI jobs are asynchronous: endpoints return a job ID; results are fetched via **GET /ai/jobs/{id}** when ready.

### Listening & alerts (Phase2)

```
Method & Endpoint Description
```
```
POST /listening/queries create a listening query for keywords or competitors (addon).
```
```
GET /listening/queries list queries.
GET /listening/queries/{id}/results get realtime mentions with sentiment.
```
```
GET /alerts poll for spike alerts (volume/sentiment changes).
```
## 3. Microservice breakdown

The system decomposes into independent services communicating through message queues and API
gateways. Each microservice can scale independently.

```
Service Responsibilities Key dependencies
```
```
Auth Service
user registration, login, JWT issuance, password
resets, SSO integration.
```
```
User database, email/SMS
provider, OAuth providers.
```
```
Workspace
Service
```
```
workspace CRUD, role assignments, membership
invitations.
Auth service, database.
```
```
Social
Connector
Service
```
```
OAuth handling, token storage/refresh, API
wrappers for each social network.
```
```
Secrets store, thirdparty APIs
(Meta, X/Twitter, LinkedIn,
TikTok, YouTube).
```

```
Service Responsibilities Key dependencies
```
```
Content
Service
```
```
posts/variants CRUD, media uploads, content
calendar queries, approval workflow.
```
```
Storage service (S3), queue
service (publishing jobs),
analytics service.
```
```
Publishing
Worker
```
```
cron/queue worker that monitors scheduled
posts, posts content to each network, handles
retries and failures, updates statuses.
```
```
Social connector service,
database, logging/
observability.
```
```
Inbox Service
ingestion of social messages/comments via
webhooks, thread assignment, replies.
```
```
Social connector service,
notifications service.
```
```
AI Service
```
```
orchestrates AI tasks by calling external LLM
providers (e.g., Gemini, OpenAI) and custom
models; caches results.
```
```
GenAI provider, queue, rate
limiting.
```
```
Analytics
Service
```
```
consumes data from publishing and inbox
events, aggregates metrics, stores snapshots,
computes besttime recommendations.
```
```
Timeseries store, data
warehouse.
```
```
Listening
Service (addon)
```
```
monitors social data streams for keywords/
competitors, performs sentiment analysis,
triggers alerts.
```
```
Social listening provider,
machine learning models.
```
```
Notification
Service
```
```
sends email/push notifications to users for
approvals, publishing failures, listening alerts;
stores user preferences.
```
```
Email/SMS providers, push
notification service.
```
```
API Gateway
```
```
exposes a unified REST/GraphQL interface,
handles rate limiting, auth, request routing, and
returns aggregated responses.
```
```
All services via internal gRPC/
HTTP calls.
```
Services communicate via asynchronous message queues (e.g., Redis/BullMQ or RabbitMQ) for tasks like
publishing, AI generation and analytics ingestion. Observability is provided through structured logging,
distributed tracing and metrics dashboards.

## 4. UX wireframe flow map

The endtoend journey is designed to maximise activation and retention:

```
Onboarding & AI Workspace Generation  A new user registers via email/social login and is
prompted to create a workspace. The AI wizard asks for industry, target audience and content goals.
It then generates a 30day content plan with content pillars and initial drafts (our differentiator). This
gives users immediate value and populates the dashboard.
```
```
Workspace & Calendar  Users land on the Content Dashboard , which defaults to the calendar
view. Here they can switch between Grid , Kanban (Idea  Script  Edit  Review  Scheduled 
Published) and Calendar. They can drag ideas into schedules, customise copy per network, attach
media assets and set approval requirements.
```
#### 1.

#### 2.


```
Collaboration & Approvals  Editors draft posts and request approval. Approvers receive
notifications and can accept/reject with comments. Roles are visible in the workspace member list.
```
```
Publishing & Queue  Approved posts enter the publishing queue. The system displays a
countdown for scheduled posts. Users can publish immediately or reschedule.
```
```
Unified Inbox  The Engage tab lists messages and comments across networks. Filters allow sorting
by network, status, tag and assigned user. Team members can reply, assign, add internal notes and
mark threads as done.
```
```
Analytics & Insights  The Analytics tab provides highlevel summaries (reach, engagement,
follower growth) and postlevel performance. Users can export PDF/CSV reports or upgrade to
advanced analytics for predictive insights.
```
```
AddOns & Upgrades  On the Upgrades page, users can enable addons such as Social Listening,
AI credit packs or WhiteLabel client portals. A Billing tab shows current plan, connected accounts
and seat usage.
```
```
Settings & Admin  Owners can manage workspace settings, branding, domain (for whitelabel),
social accounts, and user roles. The audit log displays publishing events, approvals and security
actions.
```
This flow emphasises quick value (AI generation), clear organisation (calendar/Kanban), collaboration
(approvals), engagement (inbox) and learning (analytics).

## 5. Monetization projection

### Pricing model (recap)

Based on the updated research, Blisszits OS will adopt a tiered SaaS model with perworkspace and
persocialaccount pricing, aligning with market leaders. Industry benchmarks show that similar platforms
charge per seat or per channel:

```
Sprout Social : Standard plan costs $199 per seat/month with 5 social profiles and keyword
monitoring ; Professional plan at $299 per seat/month adds unlimited profiles and competitor
insights ; Advanced at $399 per seat/month introduces sentiment analysis and API integrations
.
```
```
Hootsuite : After discontinuing its free tier, Hootsuites Standard plan starts around $99/month
(annual) for up to 5 social profiles with unlimited scheduling, a unified inbox and an AI caption
generator. The Advanced plan, aimed at small teams, costs $249$399/month and increases the
profile and user limits.
```
```
Buffer : Buffer offers a free plan for 3 channels. Paid plans are priced per channel : Essentials
charges $6 per channel/month (channels 110) and Team charges $12 per channel/month ,
```
#### 3.

#### 4.

#### 5.

#### 6.

#### 7.

#### 8.

####  1 2 3  4 5 


```
decreasing with volume. Both paid plans include unlimited scheduled posts, advanced analytics
and a community inbox.
```
```
SocialPilot : The Essentials plan costs $25.50/month (annual) for 7 social accounts and 1 user.
Standard costs $42.50/month for 15 accounts and 3 users and includes a social inbox, analytics and
team collaboration. Premium ($85/month) supports 25 accounts and 6 users and offers client
approval and whitelabel reports. Ultimate ($170/month) expands to 50 accounts with unlimited
users and advanced security.
```
```
Sprinklr : According to pricing analysis, the Sprinklr Social Advanced plan is about $299 per user/
month and provides publishing, a digital asset manager and a unified inbox. Enterprise suites
are custom and often exceed $249$299 per user/month.
```
```
Meta Business Suite : Metas tool is free and designed for Facebook and Instagram. It provides a
unified inbox, content scheduling, basic insights and a simplified advertising hub.
```
### Market opportunity

Industry research estimates that the global social media management market was **USD29.93billion in
2025** and is projected to reach **USD171.62billion by 2033** , with a **24.8% CAGR**. The growth is driven by
AIenabled analytics, realtime omnichannel engagement and adoption among SMEs and digitalfirst
enterprises.

### Revenue projection assumptions

Assume Blisszits OS launches in late 2026 with the following plans:

```
Free (Creator Starter)  supports 2 workspace, 2 social accounts and limited AI credits (free).
Pro  $29/month - 5 workspace, includes 5 social accounts, direct publishing, unified inbox,
approvals and full AI assistant.
Agency  $149/month per workspace, includes 1025 social accounts, unlimited users, whitelabel
reporting and client portal.
Enterprise  custom (average $399/month per workspace), includes advanced analytics, listening,
SSO and dedicated support.
```
Addons: Social Listening ($99/month), AI credit packs ($19$99/month), Additional Social Accounts ($4/
account/month).

Assuming conservative adoption (Year1 after launch):

```
Metric Estimate & rationale
```
```
Free users 10,000 creators sign up for AI workspace generation, converting 15% to paid within
3 months.
```
```
Pro
workspaces 1,500 paying workspaces @ $29/month  annualised revenue  $522k.
```
#### 6 7  8  9

```
10
```
#### 

```
11
```
```
12
```
```
13
```
#### 

#### 

#### 

#### 


```
Metric Estimate & rationale
```
```
Agency
workspaces
```
```
400 agencies @ $149/month  annualised revenue  $714k. Agencies often
purchase addons; assume 40% purchase whitelabel ($49/month) and 30%
purchase listening ($99/month).
```
```
Enterprise
clients
```
```
25 enterprises with customised pricing averaging $399/month  annualised
revenue  $120k. These clients also purchase social listening and premium
analytics (additional $199/month).
```
```
Addon
revenue
```
```
From AI credit packs and extra social accounts, estimate $10/user/month average
across Pro and Agency tiers   $276k annually.
```
Using these assumptions, Blisszits OS could achieve ~$1.6million ARR in its first year. With a 24.8% market
CAGR and product differentiation through AI onboarding, the business could double ARR in year2 by
expanding network integrations and listening capabilities.

The monetization projection emphasises perworkspace pricing and highmargin addons, mirroring market
leaders (Sprout Socials addon for premium analytics and listening and SocialPilots extra accounts and
AI credits ). Blisszits OS can capture both creator and agency segments while remaining accessible
compared with enterpriseonly platforms.

## 6. Competitive feature matrix

The table below compares Blisszits OS (planned) with major competitors across key feature categories and
pricing. Only headline features and starting prices are listed; some competitors offer highertier features at
additional cost.

```
Feature /
Competitor
```
```
BlisszitsOS
(planned)
SproutSocial Hootsuite Buffer SocialPilot Sprinklr MetaBusinessSuite
```
```
Publishing &
scheduling
```
```
Calendar,
Kanban, queue;
networkspecific
variants; AI
besttime
suggestions
(phase2).
```
```
Publish with
optimal send
times; 5
profiles in
Standard;
unlimited in
Professional
.
```
```
Unlimited
scheduling;
besttime
recommendations;
5 profiles in
Standard.
```
```
Unlimited
posts per
channel;
custom
schedules
.
```
```
Bulk
scheduling;
content
library; AI
scheduler
.
```
```
Enterprise
publisher with
digital asset
management
.
```
```
Free scheduler for
Facebook &
Instagram; schedule
posts and stories
together.
```
```
Unified
inbox &
engagement
```
```
Aggregated
comments/DMs
across
networks;
assignment;
notes; SLAs
(Pro+).
```
```
Smart Inbox
with
sentiment
analysis in
advanced
plans.
```
```
Centralised inbox
with DM
automations and
assignment
(pricing not
explicitly shown).
```
```
Community
inbox (all
plans).
```
```
Social
inbox
available
from
Standard
plan.
```
```
Omnichannel
inbox for social
and email (Social
Advanced).
```
```
Unified inbox for
Facebook,
Instagram,
Messenger and
some WhatsApp
integration.
```
```
12
```
```
14
8
```
```
15
```
```
4 6 16 9 17
```
```
3
```
```
18
7
19
```
```
9
20
```

Feature /
Competitor

```
BlisszitsOS
(planned)
SproutSocial Hootsuite Buffer SocialPilot Sprinklr MetaBusinessSuite
```
**Analytics &
reporting**

```
Post/account
dashboards;
export PDF/CSV;
advanced
analytics & ROI
connectors as
addons.
```
```
Group, profile
and postlevel
reporting;
premium
analytics
addon
.
```
```
Benchmark
against
competitors;
customisable
reports
(Advanced).
```
```
Advanced
analytics in
Essentials/
Team plans
.
```
```
Analytics
included
from
Standard;
advanced
analytics
and client
approval in
Premium
.
```
```
Marketing and
listening
analytics;
enterprisegrade
dashboards.
```
```
Basic insights (reach,
content
performance,
audience
demographics).
```
#### AI

**assistance**

```
AI workspace
generator;
script builder;
caption/
hashtag
generator;
repurposing;
predictive
analytics.
```
```
AI Assist for
alt text, post
and reply
enhancements
.
```
```
AI caption and
image generator
(part of standard
plan).
```
```
AI Assistant
for content
ideas and
hashtags
included
across
plans.
```
```
AI credits
(500+ to
unlimited)
included;
AI
scheduler
.
```
```
Proprietary AI
across suites
(Social + Service)
but at enterprise
cost.
```
```
Some AI copy
suggestions and
post ideas , but
limited to Meta
platforms.
```
**Social
listening**

```
Addon;
keyword &
competitor
tracking;
sentiment
analysis; spike
alerts.
```
```
Listening
addon with
sentiment and
spike alerts
.
```
```
Listening powered
by Talkwalker
(addon).
```
```
No listening
(thirdparty
integrations
available).
```
```
No native
listening;
focus on
publishing/
analytics.
```
```
Core component
(Sprinklr
Insights suite).
```
```
Only within Meta
network.
```
**Whitelabel
& agency
features**

```
Custom
domain, client
portals,
branded reports
(Agency plan).
```
```
Enterprise
plan offers
whiteglove
onboarding
and priority
support.
```
```
No whitelabel;
advanced features
require Enterprise.
```
```
No
whitelabel,
though
shareable
reports.
```
```
Premium &
Ultimate
plans
provide
whitelabel
reports
and portals
.
```
```
Enterprise
software;
custom
branding
negotiable.
```
```
Not available.
```
**Starting
price**
(approx.)

```
Free tier + Pro
$29/mo per
workspace;
Agency $149/
mo; Enterprise
custom.
```
```
$199/seat/
month
(Standard).
```
```
~$99/month
(annual) for
Standard.
```
```
$6/channel/
month
(Essentials)
.
```
#### $25.50/

```
month
(Essentials)
for 7
accounts
.
```
```
~$299/user/
month (Social
Advanced).
```
```
Free (limited to Meta
networks).
```
```
1
21 22
```
```
7
```
```
23
```
```
10 24
```
```
25 26
7 8
```
```
9
```
```
27
```
```
28
```
```
29
```
```
30
31
```
```
1 4
6
16
```
```
9 11
```

Blisszits OS differentiates itself through AInative onboarding (30day content plan), modular pricing,
comprehensive content lifecycle management (Idea Script Schedule Publish Engage Measure)
and accessibility for creators, agencies and enterprises.

## 7. Landing page copy (conversionoptimized)

**Headline:**
_Transform your social presence with the AIpowered operating system built for creators, agencies and brands._

**Subheading:**
Stop jumping between apps. Blisszits OS unifies content planning, scheduling, engagement and analytics
across every network. Create a 30day content plan in seconds with our AI workspace generator, publish
everywhere with one click and never miss a DM again.

**Value points:**

```
Plan smarter with AI: Describe your audience and goals, and watch the AI generate a months
worth of content pillars, post ideas and scripts tailored to every platform.
Publish with confidence: A visual calendar and Kanban board let you plan campaigns, customise
copy per network and set approval workflows. Our queue handles posting at the best times.
Engage without chaos: A unified inbox brings comments and messages from Instagram, TikTok,
LinkedIn, Facebook, X and YouTube into one place. Assign conversations, add internal notes and hit
SLAs.
Learn & grow: Builtin analytics show what works and why. Export branded reports or upgrade to
predictive insights and social listening to stay ahead of trends.
Scale your way: Start for free and upgrade when you need more accounts or AI credits. Whitelabel
portals and custom domains make Blisszits OS your own.
```
**Call to action:**
Start your free AIpowered workspace today. No credit card required.

