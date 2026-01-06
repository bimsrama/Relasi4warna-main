# Relasi4Warna / 4Color Relating - PRD

## Original Problem Statement
Build a production-ready, monetizable web platform for an ORIGINAL relationship communication assessment system with:
- 4 proprietary archetypes (Driver, Spark, Anchor, Analyst)
- 4 series (Family, Business, Friendship, Couples)
- Dual-language (Indonesian/English)
- Quiz engine with 24 questions per series
- Free results + Paid detailed reports
- Payment integration (Xendit)
- Admin CMS
- PWA for mobile installation

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

## Tech Stack
- Backend: FastAPI + MongoDB
- Frontend: React + Tailwind + shadcn/ui
- Auth: JWT + Emergent Google OAuth
- Payments: Xendit (SIMULATED)
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

### P1 (High Priority) - PENDING
- [ ] Xendit real payment integration (needs API keys)
- [ ] Resend real email delivery (needs API key in .env RESEND_API_KEY)
- [x] Compatibility matrices detail view (COMPLETED - January 2025)

### P2 (Medium Priority) - BACKLOG
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Analytics dashboard enhancements

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
- GET /api/admin/questions
- POST /api/admin/questions
- PUT /api/admin/questions/{question_id}
- DELETE /api/admin/questions/{question_id}
- GET /api/admin/pricing
- PUT /api/admin/pricing/{product_id}
- GET /api/admin/coupons
- POST /api/admin/coupons
- DELETE /api/admin/coupons/{coupon_id}
- GET /api/admin/users
- GET /api/admin/results
- GET /api/admin/tips-subscribers
- POST /api/admin/send-weekly-tips
- GET /api/admin/blog/articles
- POST /api/admin/blog/articles
- PUT /api/admin/blog/articles/{article_id}
- DELETE /api/admin/blog/articles/{article_id}


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
- /admin - Admin CMS (6 tabs: Questions, Users, Results, Coupons, Tips, Blog)
- /login - Login
- /register - Register
- /terms - Terms & Conditions
- /privacy - Privacy Policy
- /compatibility - Compatibility Matrix

## MOCKED/STUBBED Features
- **Resend Email**: Returns mock success when RESEND_API_KEY is empty
- **Xendit Payment**: Uses /api/payment/simulate-payment for demo purposes
