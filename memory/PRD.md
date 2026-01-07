# Relasi4Warna / 4Color Relating - PRD

## Original Problem Statement
Build a production-ready, monetizable web platform for an ORIGINAL relationship communication assessment system with:
- 4 proprietary archetypes (Driver, Spark, Anchor, Analyst)
- 4 series (Family, Business, Friendship, Couples)
- Dual-language (Indonesian/English)
- Quiz engine with 24 questions per series
- Free results + Paid detailed reports
- Payment integration (Midtrans)
- Admin CMS with HITL moderation
- PWA for mobile installation
- AI Governance and Safety Framework

## Architecture (Updated January 2025)

### Monorepo Structure
```
/app
├── /backend              → FastAPI API
│   ├── server.py         → Main API (5800+ lines)
│   ├── hitl_engine.py    → HITL implementation
│   ├── output_router.py  → Governance→HITL→Output flow
│   └── deep_dive_data.py → Premium content
├── /frontend             → React web app
├── /packages             → Shared business logic
│   ├── /core            → Personality engine, scoring
│   ├── /hitl            → Risk assessment, moderation
│   ├── /governance      → Policy enforcement, audit
│   └── /shared          → Types, utils, constants
├── /infra/docker        → Dockerfiles, nginx config
├── /scripts             → Build, deploy scripts
└── /tests               → Backend + frontend tests
```

### Output Flow (Enforced at Runtime)
1. **AI Generation** → 2. **Governance Policy Check** → 3. **HITL Risk Assessment** → 4. **Safety Gate** → 5. **Output**

- Level 1 (Score <30): Auto-publish
- Level 2 (Score 30-60): Publish with safety buffer
- Level 3 (Score >60): Block for human review

### Tier System
- **FREE**: Basic quiz results
- **PREMIUM**: Full AI report, PDF download (Rp99,000)
- **ELITE**: Advanced modules (Quarterly, Parent-Child, Business, Team) (Rp299,000)
- **ELITE+**: Certification, AI-Human coaching, Governance dashboard (Rp999,000)
- **CERTIFICATION**: Practitioner program (Rp4,999,000)

## User Personas
1. **Parents/Family Members** - Understanding family communication dynamics
2. **Business Professionals** - Improving team collaboration
3. **Couples** - Building intimate communication
4. **Friends** - Strengthening social bonds

## Core Requirements (Static)
- Original 4-Drive Communication Archetypes framework
- Bilingual content (ID first, EN second)
- No copyrighted content from other frameworks
- Legal disclaimers (educational, non-diagnostic)
- GDPR-friendly data handling

## What's Been Implemented

### Phase 1 - MVP (Completed)
- [x] Landing page with bilingual support
- [x] Series selection page (4 series)
- [x] User authentication (Email/Password + Google OAuth)
- [x] User dashboard with test history
- [x] How It Works page
- [x] FAQ page
- [x] Pricing page

### Phase 2 - Feature Expansion (Completed)
- [x] 24 questions per series (96 total questions)
- [x] Admin CMS with stats, questions, users, coupons management
- [x] PDF report generation (ReportLab)
- [x] Share Archetype feature with SVG card generation
- [x] PWA support (manifest.json, service worker, icons)
- [x] Mobile-responsive design

### Phase 3 - Premium Features (Completed - January 2025)
- [x] Resend Email Integration (MOCKED - API key required for real emails)
- [x] AI Report Generation using GPT-5.2 via Emergent LLM Key
- [x] Couples Comparison Feature:
  - Create couples pack
  - Invite partner via email
  - Join pack as partner
  - Link quiz results to pack
  - Generate AI-powered compatibility report
- [x] Result page enhanced with:
  - Email report button
  - AI Report generation button
  - PDF download button
- [x] Dashboard with Couples Comparison banner

### Phase 4 - Engagement & Compliance (Completed - January 2025)
- [x] **Admin CMS UI Enhanced:**
  - Dashboard stats (users, tests, revenue)
  - Questions management with series filter
  - Users management table
  - Results history table
  - Coupons management (create, delete)
  - **Weekly Tips management** (subscribers list, send tips batch)
  - **Blog CMS** (create/edit/delete articles)
- [x] **Legal Pages (Dual-Language):**
  - Terms & Conditions (/terms) - 8 comprehensive sections
  - Privacy Policy (/privacy) - 10 comprehensive sections
  - Indonesian law compliance (UU PDP No. 27/2022)
  - GDPR and CCPA compliance
- [x] **Weekly Communication Tips System:**
  - User subscription toggle in dashboard
  - AI-generated tips using GPT-5.2
  - Tips based on user's primary archetype
  - Tips history and latest tip display
  - Admin batch send functionality

### Phase 5 - Multi-User Packs & Gamification (Completed - January 2025)
- [x] **Family/Team Pack System:**
  - Create family pack (max 6 members) or team pack (max 10 members)
  - Invite members via email or shareable link
  - Join pack via invite or direct link
  - Link quiz results to pack
  - Team dashboard with member list and completion status
  - Archetype heatmap showing distribution
  - AI-generated team dynamics analysis using GPT-5.2
- [x] **Communication Challenge (7-Day):**
  - Start challenge based on archetype
  - AI-generated daily tasks personalized to archetype
  - Progress tracking with day completion
  - Reflection journal for each day
  - **Badge System:** 4 badges (Day 1, 3, 5, 7)
  - **Premium Content Unlock:**
    - Exclusive Tips (Day 3)
    - Workbook PDF (Day 5)
    - Master Guide (Day 7)
- [x] **Blog CMS:**
  - Public blog page with category filters
  - 5 categories: Communication, Relationships, Archetypes, Tips, Stories
  - Dual-language articles (ID/EN)
  - Admin CRUD for articles
  - View count tracking
  - SEO metadata support

### Phase 6 - Compatibility Matrix (Completed - January 2025)
- [x] **Compatibility Matrix Feature:**
  - 4x4 interactive matrix grid showing all 16 archetype combinations
  - Score-based color coding (85+ green, 75+ yellow, 65+ orange, <65 blue)
  - Energy level indicators (Very High, High, Balanced, Low, Calm)
  - Detailed modal view with:
    - Title and summary
    - Strengths list
    - Challenges list  
    - Communication tips
  - Dual-language support (ID/EN)
  - Dashboard banner linking to compatibility page
  - Score legend for easy reference
  - CTA to take the test
  - **"My Compatibility" Personal Section:**
    - Shows user's archetype and compatibility with all 4 archetypes
    - Cards sorted by compatibility score (highest first)
    - Clickable cards open detail modal
    - Adaptive display: CTA for non-logged users, results for users with tests
  - **"Share Compatibility" Feature:**
    - Shareable SVG card with gradient colors for archetype pair
    - Social sharing to X/Twitter, Facebook, WhatsApp
    - Download option for share card image
    - Copy link functionality

### Phase 7 - AI Framework Enhancement (Completed - January 2025)
- [x] **Premium Relationship Intelligence AI System:**
  - Comprehensive system prompt for relationship coaching
  - 9-section deep personalized report structure:
    1. Personal Relational DNA
    2. Inner Conflict Map
    3. Emotional Triggers & Escalation Pattern
    4. Self-Regulation & Emotional Stability Guide
    5. Interaction Strategy with Different Drives
    6. Conflict Recovery & Repair System
    7. Personal Growth Path (3 Levels)
    8. 14-Day Relationship Practice Plan
    9. Closing Reflection
  - Ethical constraints: no clinical diagnoses, no third-party frameworks
  - Compassionate, non-judgmental language
  - Dual-language support (ID/EN)
- [x] **Enhanced Couples Comparison Report:**
  - 10-section comprehensive compatibility analysis
  - Communication scripts for 6 scenarios
  - Conflict recovery protocol specific to drive combination
  - Weekly connection rituals
  - 7-day couples practice plan
- [x] **Enhanced PDF Generation:**
  - Professional multi-page PDF layout
  - Markdown-to-PDF conversion for AI reports
  - Cover page with series, archetype info, score table
  - Styled headings, bullet points, sub-bullets
  - Fallback to basic report when no AI content
  - Proper disclaimer and copyright footer
  - Dual-language support
  - **Watermark System for Conversion:**
    - Preview PDF: Diagonal "PRATINJAU/PREVIEW" watermark
    - Preview PDF: Red notice at bottom encouraging purchase
    - Paid PDF: Clean without watermark, subtle branding footer
    - Separate endpoints: `/preview-pdf/` and `/pdf/`

### Phase 8 - AI Safeguard Policy (Completed - January 2025)
- [x] **AI Safeguard Policy Page:**
  - 10 comprehensive legal articles (Pasal)
  - Dual-language (Indonesian & English) with proper legal terminology
  - Article 1: Purpose and Scope
  - Article 2: Core Ethical Principles (Non-Diagnostic, No Labeling, Self-Responsibility, Contextual)
  - Article 3: Misuse Prevention (Anti-Weaponization, Anti-Comparison Abuse, De-Escalation)
  - Article 4: Misinterpretation Prevention (Probabilistic Language, Time-Bound, Script Over Advice)
  - Article 5: Language and Content Standards (Recommended vs Prohibited words)
  - Article 6: Transparency and User Education (Pre/Post Disclosures)
  - Article 7: Escalation and Human Support Path
  - Article 8: Data Protection and Privacy (UU PDP compliance)
  - Article 9: Quality Assurance and Audit
  - Article 10: Official Platform Statement
  - Footer links to other legal pages

### Phase 9 - Password Reset Feature (Completed - January 2025)
- [x] **Forgot Password Flow:**
  - ForgotPasswordPage with email input
  - API endpoint POST /api/auth/forgot-password
  - Email with reset link (via Resend or logging)
  - Token expiry: 1 hour
  - Success page with instructions (check spam, etc.)
  - **Rate Limiting: Max 3 requests per hour per email**
    - Returns remaining attempts count
    - Shows retry time when limit exceeded
    - Auto-cleanup of old attempts (24h)
- [x] **Reset Password Flow:**
  - ResetPasswordPage with token verification
  - API endpoint POST /api/auth/reset-password
  - API endpoint GET /api/auth/verify-reset-token
  - Password requirements validation
  - Show/hide password toggle
  - Invalid/expired token handling
  - Success state with login redirect
- [x] **Login Page Update:**
  - Added "Lupa password?" link below password field

### Phase 10 - Human-in-the-Loop (HITL) Moderation System (Completed - January 2025)
- [x] **HITL Engine (`/app/backend/hitl_engine.py`):**
  - 3-Level Risk System:
    - Level 1 (Normal): Auto-publish AI report (score < 30)
    - Level 2 (Sensitive): Publish with safety buffer (score 30-69)
    - Level 3 (Critical): Hold report, require human review (score >= 70 or red keywords)
  - Risk Scoring Engine with configurable weights
  - Keyword Detection System (5 categories):
    - RED: Crisis/violence/self-harm → Immediate Level 3
    - YELLOW: Distress/hopelessness
    - WEAPONIZATION: Control/domination intent
    - CLINICAL: Diagnostic terms → Blocked
    - LABELING: Demeaning labels → Blocked
  - Blocked Output Pattern Detection
  - Probabilistic Language Rewriter (absolute → probabilistic)
  - Safety Buffer & Safe Response messages (dual-language)
  - 10% Sampling Rate for Level 2 reviews
- [x] **Report Generation Integration:**
  - Pre-generation risk assessment (user context)
  - Post-generation risk assessment (AI output)
  - Automatic model fallback (GPT-5.2 → GPT-4o)
  - HITL status tracking in reports
- [x] **Admin Moderation Queue API:**
  - GET /api/admin/hitl/stats - Statistics dashboard
  - GET /api/admin/hitl/queue - List queue items with filters
  - GET /api/admin/hitl/queue/{queue_id} - Detail view with audit logs
  - POST /api/admin/hitl/queue/{queue_id}/decision - Process moderation decision
  - GET /api/admin/hitl/keywords - List risk keywords
  - PUT /api/admin/hitl/keywords/{category} - Update keywords
  - GET /api/admin/hitl/assessments - Risk assessment history
  - GET /api/admin/hitl/audit-logs - Audit log history
- [x] **Admin Moderation UI:**
  - New "HITL" tab in Admin CMS with pending badge
  - Stats cards (Pending, Critical, Sensitive, Normal)
  - Moderation Queue with status/risk filters
  - Detail modal with:
    - Risk info (level, score, series, status)
    - Detected keywords display
    - Risk flags display
    - Original AI output preview
    - 5 Moderator action buttons:
      1. Approve As-Is
      2. Add Safety Buffer
      3. Edit Output
      4. Safe Response Only
      5. Escalate
    - Moderator notes input
    - Audit log history
- [x] **Database Collections:**
  - risk_keywords: Category-based keyword lists (ID/EN)
  - risk_assessments: Assessment history with scores/flags
  - moderation_queue: Items pending/processed review
  - audit_logs: Moderator action history
  - hitl_events: Event tracking for analytics

### Phase 13 - Elite Tier Implementation (Completed - January 7, 2025)
- [x] **Elite Tier System:**
  - Tier levels: free, premium, elite
  - Admin endpoint to update user tier: PUT /api/admin/users/{user_id}/tier
  - Elite pricing products added (monthly, quarterly, annual, single)
- [x] **Elite Report Endpoint:**
  - POST /api/report/elite/{result_id} - Generate elite report
  - GET /api/report/elite/{result_id} - Get cached elite report
  - Supports all 4 elite modules
- [x] **Elite Module 10 — QUARTERLY PERSONAL RE-CALIBRATION:**
  - Compare previous vs current assessment
  - What Has Stabilized, What Is Still Reactive
  - Growth Signals, Next-Quarter Focus
  - No "regression" language
- [x] **Elite Module 11 — PARENT-CHILD RELATIONSHIP DYNAMICS:**
  - Age ranges: early_childhood, school_age, teen, young_adult
  - How Parent's Tendencies Are Felt by Child
  - Developmentally aware needs
  - Common Misalignments (intent vs impact)
  - Emotionally Safe Response scripts
  - Repair Ritual (age-appropriate)
- [x] **Elite Module 12 — BUSINESS & LEADERSHIP RELATIONAL INTELLIGENCE:**
  - User roles: founder, leader, partner
  - Counterpart style analysis
  - Leadership Strengths, Tension Points
  - Decision-Making Friction, Communication Alignment
  - Conflict Repair Script (professional tone)
- [x] **Elite Module 13 — TEAM & ORGANIZATIONAL DYNAMICS:**
  - Team composition analysis
  - Systemic Friction Risks
  - Team Operating Agreements
  - Leader Calibration Guide
- [x] **Elite HITL+ Enhanced Rules:**
  - Auto-flag Level 2 for multi-domain conflict
  - Auto-flag Level 2 for power asymmetry
  - Auto-flag Level 3 for coercion/dominance content
- [x] **Elite Pricing:**
  - elite_monthly: Rp 499,000 / $34.99
  - elite_quarterly: Rp 1,299,000 / $89.99
  - elite_annual: Rp 3,999,000 / $279.99
  - elite_single: Rp 299,000 / $19.99
- [x] **Elite Frontend UI (Completed - January 7, 2025):**
  - New EliteReportPage.js at /elite-report/{resultId}
  - 4 Module selection cards with toggle switches
  - Form inputs for each module (previous snapshot, child age, user role, team profiles)
  - "Buat Laporan Elite" button generates report via API
  - Existing Elite report displayed with WhatsApp share
  - Result page has Elite CTA card linking to Elite Report page
  - Pricing page updated with Elite & Elite+ section
  - UserResponse model includes tier field (free, elite, elite_plus)
- [x] **Elite+ Tab Integration (Completed - January 7, 2025):**
  - Elite/Elite+ tabs in EliteReportPage for tier switching
  - Elite+ modules: Certification (Level 1-4), AI-Human Coaching, Governance Dashboard
  - Elite+ upgrade notice for non-Elite+ users with CTA button
  - Module toggle switches and configuration forms
- [x] **Elite Progress Tracking Dashboard (Completed - January 7, 2025):**
  - New "Elite Progress" tab in Dashboard for Elite/Elite+ users
  - Stats cards: Tier, Laporan Dibuat, Modul Digunakan
  - Module usage breakdown: Quarterly, Parent-Child, Business, Team
  - Quick Actions: Tes Baru, Buat Elite Report, Upgrade buttons

### Phase 12 - Premium Personality Intelligence Engine (Completed - January 7, 2025)
- [x] **ISO-STYLE AI Report Prompt:**
  - Implemented 7 mandatory sections:
    1. SECTION 1 — EXECUTIVE SELF SNAPSHOT
    2. SECTION 2 — RELATIONAL IMPACT MAP
    3. SECTION 3 — STRESS & BLIND SPOT AWARENESS
    4. SECTION 4 — HOW TO RELATE WITH OTHER PERSONALITY STYLES
    5. SECTION 5 — PERSONAL GROWTH & CALIBRATION PLAN
    6. SECTION 6 — RELATIONSHIP REPAIR & PREVENTION TOOLS
    7. SECTION 7 — ETHICAL SAFETY CLOSING
  - AI Governance compliance (Annex A, B, C)
  - Absolute limits enforcement (no diagnosis, no labeling, no manipulation)
  - Probabilistic language requirement
  - Dual-language support (ID/EN)
- [x] **Deep Dive Premium Report Updated:**
  - Same 7-section ISO-STYLE format
  - Enhanced with Deep Dive specific data (section scores, type interactions)
  - Stress profile integration
- [x] **Force Regenerate Option:**
  - Added `force=true` parameter to regenerate reports with new prompt
  - Uses upsert to replace existing reports
- [x] **Admin Clear Cache Endpoint:**
  - DELETE /api/admin/reports/clear-cache
  - Clears all cached reports for fresh regeneration
- [x] **PDF Download Fix:**
  - Fixed authentication issue (window.open → axios with auth token)
  - Proper blob download with filename
- [x] **WhatsApp Share Feature:**
  - "Bagikan via WhatsApp" button for paid users
  - "Bagikan Hasil ke WhatsApp" button for free results
  - "Share" button in AI Report section for sharing summary
  - Formatted message with emojis, archetype info, and app link
  - Dual-language message templates (ID/EN)
  - Viral loop: encourages friends to take the test
- [x] **Enhanced Admin CMS - Questions Tab:**
  - Add Question form with 4 archetype options
  - Toggle question active/inactive status
  - Delete question functionality
  - Bulk create questions endpoint
  - Questions stats by series
  - Stress marker flag support
  - Question reordering
- [x] **Enhanced Admin CMS - Pricing Tab:**
  - Create pricing tier with IDR/USD prices
  - Edit pricing tier
  - Active/Popular status badges
  - Features list support (ID/EN)
  - Product ID, descriptions, visibility controls
- [x] **Enhanced Admin CMS - Coupons Tab:**
  - Advanced coupon creation with:
    - Discount types: percent, fixed_idr, fixed_usd
    - Valid from/until dates
    - Min purchase requirement
    - Valid products restriction
    - One per user option
  - Toggle coupon active status
  - Coupon usage statistics
  - Quick Add + Advanced form
- [x] **Admin Dashboard Overview:**
  - User stats (total, today, week)
  - Quiz stats (total, today, week)
  - Payment stats (total paid, today, week, revenue month)
  - Archetype distribution
  - Series distribution
- [x] **HITL Analytics Dashboard (Full Implementation):**
  - Risk distribution cards (Level 1, 2, 3 counts)
  - Average response time metric
  - Risk distribution progress bars with percentages
  - Queue status visualization
  - Timeline chart with stacked bars (Level 1/2/3)
  - Keyword trends display (top detected keywords)
  - Moderator performance table (total actions, breakdown)
  - Day range selector (7, 30, 90 days)
  - Export buttons (JSON & CSV)
  - Dual-language support
- [x] **Deep Dive Premium Test:**
  - 16 questions in 4 sections:
    1. Inner Motivation (4 questions)
    2. Stress Response (4 questions)
    3. Relationship Dynamics (4 questions)
    4. Communication Patterns (4 questions)
  - 4 archetype options per question
  - Type interactions data for each archetype
  - **Enhanced AI Report Generation:**
    - Professional system prompt with 9 comprehensive sections
    - Executive Summary
    - Deep Personality Profile (who you are, values, emotional needs)
    - Hidden Motivation Patterns
    - Stress Response Map (triggers, escalation, de-escalation)
    - Impact on 4 Types (detailed analysis for each archetype)
    - Deep Connection Guide (specific scripts for each type)
    - Blind Spots & Growth Areas (3 blind spots + shadow side)
    - 30-Day Transformation Plan (weekly breakdown)
    - Closing transformative message
    - 3500-4500 words premium report
- [x] **SEO Foundation:**
  - SEO component with meta tags
  - sitemap.xml
  - robots.txt
  - Enhanced index.html meta tags

### Phase 14 - HITL Analytics Dashboard Enhancement (Completed - January 7, 2025)
- [x] **Recharts Integration:**
  - Pie Chart: Risk Distribution (Normal/Sensitive/Critical percentages)
  - Bar Chart: Moderation Status (Approved/Pending/Rejected counts)
  - Area Chart: Risk Timeline (Level 1/2/3 trends over time)
  - Horizontal Bar Chart: Top Detected Keywords
- [x] **6 Metrics Cards:**
  - Total Flagged (sum of all risk levels)
  - Level 1/2/3 individual counts
  - Average Response Time
  - Approval Rate percentage
- [x] **Additional Features:**
  - Moderator Performance table with action breakdown
  - Export JSON/CSV buttons
  - Language toggle (ID/EN) in header
- [x] **Language Toggle Re-test:**
  - HITL Analytics page: ID/EN working
  - Elite Report page: ID/EN added and working
  - Dashboard Elite Progress: ID/EN working

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + shadcn/ui
- Auth: JWT + Emergent Google OAuth
- Payments: Midtrans Snap (SANDBOX - Updated from Xendit January 2025)
- AI: OpenAI GPT-5.2 via Emergent LLM Key (WORKING)
- Email: Resend (MOCKED - needs API key)
- PDF: ReportLab
- PWA: Service Worker + manifest.json

## Admin Access
- Email: admin@relasi4warna.com
- Password: Admin123!
- URL: /admin

## Test Credentials
- Email: test@test.com
- Password: testpassword

## Prioritized Backlog

### P0 (Critical) - ALL DONE ✅
- [x] Expand to 24 questions per series
- [x] PDF report generation
- [x] Admin CMS for question/coupon management
- [x] Share feature
- [x] Email delivery integration
- [x] AI-generated personalized reports
- [x] Couples comparison feature
- [x] Legal pages (Terms & Privacy)
- [x] Weekly Communication Tips system
- [x] Full Admin CMS UI with 6 tabs
- [x] Family/Team Pack system
- [x] Communication Challenge with badges
- [x] Blog CMS with full admin CRUD
- [x] Midtrans Payment Integration (Sandbox) - January 2025
- [x] Watermark "Made with Emergent" Removed - January 2025

### P1 (High Priority) - PENDING
- [ ] Midtrans Production Keys (needs production API keys for live payments)
- [ ] Resend real email delivery (needs API key in .env RESEND_API_KEY)
- [x] Compatibility matrices detail view (COMPLETED - January 2025)
- [x] Enhanced Admin CMS (Questions/Pricing/Coupons) - COMPLETED January 7, 2025
- [x] HITL Analytics Dashboard - COMPLETED January 7, 2025
- [x] Deep Dive Premium Test with Enhanced AI Report - COMPLETED January 7, 2025

### P2 (Medium Priority) - BACKLOG
- [x] SEO optimization (meta tags, sitemap) - COMPLETED January 7, 2025
- [ ] Language toggle verification di semua halaman baru
- [ ] Refactoring server.py ke struktur modular (routers, models, services) - server.py ~5700 lines
- [ ] Additional SEO improvements (dynamic meta tags for blog posts)
- [ ] Multi-chapter formatted PDF report

## API Endpoints

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/auth/session (Google OAuth)

### Quiz
- GET /api/quiz/series
- GET /api/quiz/questions/{series}
- POST /api/quiz/start
- POST /api/quiz/submit
- GET /api/quiz/result/{result_id}
- GET /api/quiz/history
- GET /api/quiz/archetypes

### Payment
- GET /api/payment/products
- POST /api/payment/create
- POST /api/payment/simulate-payment/{payment_id}

### Report
- POST /api/report/generate/{result_id}
- GET /api/report/pdf/{result_id}

### Share
- GET /api/share/card/{result_id}
- GET /api/share/data/{result_id}

### Team/Family Pack
- POST /api/team/create-pack
- POST /api/team/invite
- POST /api/team/join/{invite_id}
- POST /api/team/join-link/{pack_id}
- POST /api/team/link-result/{pack_id}
- GET /api/team/pack/{pack_id}
- GET /api/team/my-packs
- POST /api/team/generate-analysis/{pack_id}
- DELETE /api/team/leave/{pack_id}

### Communication Challenge
- GET /api/challenge/active
- POST /api/challenge/start
- POST /api/challenge/complete-day/{challenge_id}
- GET /api/challenge/history
- GET /api/challenge/badges
- GET /api/challenge/unlocked-content
- GET /api/challenge/premium-content/{content_id}

### Blog
- GET /api/blog/categories
- GET /api/blog/articles
- GET /api/blog/articles/{slug}
- GET /api/blog/featured

### Compatibility Matrix
- GET /api/compatibility/matrix
- GET /api/compatibility/pair/{arch1}/{arch2}
- GET /api/compatibility/for/{archetype}

### Admin
- GET /api/admin/stats
- GET /api/admin/dashboard/overview - **NEW** (comprehensive stats)
- GET /api/admin/questions
- POST /api/admin/questions
- POST /api/admin/questions/bulk - **NEW**
- PUT /api/admin/questions/{question_id}
- DELETE /api/admin/questions/{question_id}
- POST /api/admin/questions/{question_id}/toggle - **NEW**
- POST /api/admin/questions/reorder - **NEW**
- GET /api/admin/questions/stats - **NEW**
- GET /api/admin/pricing
- POST /api/admin/pricing - **NEW**
- PUT /api/admin/pricing/{product_id}
- DELETE /api/admin/pricing/{product_id} - **NEW**
- GET /api/admin/coupons
- POST /api/admin/coupons
- POST /api/admin/coupons/advanced - **NEW**
- DELETE /api/admin/coupons/{coupon_id}
- PUT /api/admin/coupons/{coupon_id} - **NEW**
- POST /api/admin/coupons/{coupon_id}/toggle - **NEW**
- GET /api/admin/coupons/usage-stats - **NEW**
- GET /api/admin/users
- GET /api/admin/results
- GET /api/admin/tips-subscribers
- POST /api/admin/send-weekly-tips
- GET /api/admin/blog/articles
- POST /api/admin/blog/articles
- PUT /api/admin/blog/articles/{article_id}
- DELETE /api/admin/blog/articles/{article_id}

### HITL Analytics - **NEW SECTION**
- GET /api/analytics/hitl/overview
- GET /api/analytics/hitl/timeline
- GET /api/analytics/hitl/moderator-performance
- GET /api/analytics/hitl/export

### Deep Dive Premium - **NEW SECTION**
- GET /api/deep-dive/questions
- POST /api/deep-dive/submit
- GET /api/deep-dive/result/{result_id}
- POST /api/deep-dive/generate-report/{result_id}
- GET /api/deep-dive/type-interactions/{archetype}


### Email
- POST /api/email/send-report (requires paid result)

### Couples Comparison
- POST /api/couples/create-pack
- POST /api/couples/invite
- POST /api/couples/join/{pack_id}
- POST /api/couples/link-result/{pack_id}
- GET /api/couples/pack/{pack_id}
- GET /api/couples/my-packs
- POST /api/couples/generate-comparison/{pack_id}

### Weekly Tips
- GET /api/tips/subscription
- POST /api/tips/subscription
- POST /api/tips/generate
- GET /api/tips/history
- GET /api/tips/latest

## Frontend Routes
- / - Landing Page
- /series - Series Selection
- /quiz/:series - Quiz Page
- /result/:resultId - Result Page
- /dashboard - User Dashboard
- /couples - Couples Pack Management
- /couples/:packId - Couples Pack Detail
- /team - Team/Family Pack Management
- /team/:packId - Team Pack Detail
- /team/join/:inviteId - Join Team via Invite
- /challenge - Communication Challenge
- /blog - Blog Listing
- /blog/:slug - Blog Article
- /pricing - Pricing Page
- /how-it-works - How It Works
- /faq - FAQ
- /admin - Admin CMS (8 tabs: Questions, Pricing, Coupons, Users, Results, Tips, Blog, HITL)
- /login - Login
- /register - Register
- /terms - Terms & Conditions
- /privacy - Privacy Policy
- /compatibility - Compatibility Matrix
- /ai-safeguard-policy - AI Safeguard Policy
- /deep-dive/:resultId - Deep Dive Premium Test - **NEW**
- /hitl-analytics - HITL Analytics Dashboard - **NEW**
- /elite-report/:resultId - Elite Report Page with Module Selection - **NEW (January 7, 2025)**

## MOCKED/STUBBED Features
- **Resend Email**: Returns mock success when RESEND_API_KEY is empty
- **Midtrans Payment**: Using SANDBOX keys (SB-Mid-server-xxx) for demo purposes - Updated January 2025

## Backend Architecture (Refactored - January 7, 2025)
```
/app/backend/
├── server.py           # Main entry point (~5800 lines - monolithic, but stable)
├── main.py             # NEW - Future modular entry point (documentation)
├── routes/
│   ├── __init__.py
│   └── auth.py         # Auth routes (created, for future migration)
├── models/
│   ├── __init__.py
│   └── schemas.py      # Pydantic models (created)
├── services/
│   ├── __init__.py
│   └── ai_service.py   # AI generation service (created)
├── utils/
│   ├── __init__.py
│   ├── database.py     # Database connection (created)
│   └── auth.py         # Auth utilities (created)
├── hitl_engine.py      # HITL Engine
├── questions_data.py   # Questions data
└── deep_dive_data.py   # Deep dive questions
```

Refactoring Status:
- [x] utils/database.py - Database connection module
- [x] utils/auth.py - Authentication utilities
- [x] models/schemas.py - All Pydantic models
- [x] services/ai_service.py - AI report generation prompts
- [x] routes/auth.py - Auth routes template
- [ ] Full migration from server.py - Pending (stable as-is)
