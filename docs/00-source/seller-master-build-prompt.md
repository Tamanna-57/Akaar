AKAAR — MASTER BUILD PROMPT
Production-ready Android mobile application • Product + UX + AI + Architecture
Act as a senior Android architect, Kotlin developer, Jetpack Compose developer, AI/ML engineer, backend architect, UX/UI designer, product designer, security engineer, and hackathon mentor.
We are building an Android-first mobile application called “Akaar” for marginalized Indian artisans and buyers.
CORE INSTRUCTION
Build Akaar as a polished, production-ready MOBILE APP from scratch. It must feel intentionally designed by a professional product/UI team — NOT AI-generated, “vibecoded,” or like a generic SaaS/AI dashboard.
Mobile application only:
Android first; no Android or web application initially.
Use Kotlin, Jetpack Compose, Kotlin Coroutines, MVVM/Clean Architecture, Room, CameraX, Android Photo Picker, ML Kit/TensorFlow Lite where useful, Retrofit/OkHttp, Android Keystore, JUnit/AndroidX testing, accessibility, and localization.
A backend is allowed, preferably Python FastAPI, PostgreSQL, object storage, Redis/background workers, and REST APIs.
Build a single role-based Android app with Seller, Buyer, Cluster Manager, and Admin modes.
The MVP must be realistic for a student/hackathon team.
Do not generate the entire codebase at once. Build one complete vertical slice at a time.
==================================================
1. DESIGN SYSTEM — ESTABLISH THIS FIRST
==================================================
Before implementing screens, establish a consistent mobile design system for the entire app:
Typography hierarchy and type scale.
Deliberate, restrained color palette.
Spacing system.
Moderate, consistent corner radii.
Component styles.
Iconography.
Navigation patterns.
Buttons, inputs, cards, sheets, dialogs and lists.
Loading, empty, error, success, offline and permission-denied states.
Interaction and animation principles.
Accessibility rules.
Localization rules.
Safe-area and touch-target rules.
Every screen must use this system. Do not design screens independently.
AVOID THESE 30 “VIBECODED” PATTERNS:
Harsh gradients
Generic Lucide icons everywhere
Pure white backgrounds everywhere
Rainbow/multi-color UI
Heavy drop shadows
Repetitive 3-feature-card layouts
Emojis as UI elements
Excessive glassmorphism/liquid glass
Decorative em-dashes
Generic Inter/Geist/Space Grotesk typography
Decorative colored left stripes
Fake testimonials
Generic bento grids
Decorative terminal/code windows
“It’s not X, it’s Y” marketing copy
Checkmark bullets everywhere
Unnecessary 3-tier pricing
Fake/unsupported product demonstrations
Excessively rounded corners
Predictable purple + black AI aesthetic
Missing skeleton loading states
Decorative radial orbs
Dot-grid backgrounds
Sparkle icons
Excessive animated arrows
Missing Terms of Service
Missing Privacy Policy
Hover animations everywhere
Neon colors
Generic pastel cards
MOBILE APP DESIGN PRINCIPLES:
Design mobile-first.
Use a deliberate, restrained color palette.
Create strong visual hierarchy and readable typography.
Use moderate, consistent corner radii rather than making everything pill-shaped.
Prefer subtle borders, tonal contrast and spacing over excessive shadows.
Use icons only when they communicate something useful.
Use proper bottom navigation/tab navigation where appropriate.
Respect safe areas, touch targets and mobile interaction patterns.
Include proper loading, empty, error and success states.
Use skeleton loaders for asynchronous content.
Keep animations subtle, smooth and purposeful.
Avoid excessive bouncing, glowing, floating, scaling or flashy transitions.
Make scrolling and navigation feel natural.
Ensure accessibility and sufficient contrast.
Do not make every section look like a card.
Use real content and meaningful UI instead of decorative filler.
Keep layouts clean without making them feel empty or generic.
IMPORTANT:
Do NOT blindly copy modern SaaS, AI-dashboard, Dribbble or startup landing-page trends.
The app must have its OWN visual identity.
Every component must have a clear purpose. If an element is purely decorative and does not improve comprehension, usability or brand identity, remove it.
The final app should feel:
professional • trustworthy • distinctive • intuitive • refined • production-ready
Treat this as a REAL MOBILE PRODUCT, not a visual concept or landing page. Prioritize UX, usability, information hierarchy and consistency over decorative visuals.
==================================================
2. PRODUCT GOAL
==================================================
Help low-literacy, rural, regional-language-speaking artisans create professional, trusted, fairly priced, buyer-ready catalogs using only a phone camera, voice input, and simple guided questions.
Positioning:
“Akaar turns a regional-language voice note and a phone photo into a trusted, fairly priced, buyer-ready craft catalog.”
Do not build a generic marketplace or chatbot.
Differentiation:
Voice-first artisan onboarding.
Low-literacy UX.
Craft-specific AI.
Authenticity-safe image enhancement.
Labor-inclusive and explainable pricing.
B2B buyer matching.
Marketplace-ready catalog export.
Offline or retryable workflows.
Human approval before publishing.
==================================================
3. SELLER FEATURES
==================================================
Design and implement:
Mobile/OTP authentication and language selection.
Simple artisan profile:
   - Name, language, state/district, craft, region, capacity, cooperative/cluster status.
Voice-first product creation:
   - Record, pause, replay, rerecord.
   - Language detection.
   - Speech-to-text.
   - Translation.
   - Voice correction.
Camera and AI image studio:
   - Framing and lighting guidance.
   - Background removal.
   - Clutter removal.
   - Lighting and white-balance correction.
   - Cropping and e-commerce formatting.
   - Blur, low-light, and occlusion detection.
   - Before/after comparison.
   - Original image preservation.
   - No alteration of embroidery, texture, colors, shape, or actual product.
   - Optional AI lifestyle background, clearly labeled.
Structured catalog generation:
   - Product type, craft, region, material, technique, color, dimensions, weight, production time, quantity, MOQ, capacity, lead time, customization, care instructions, artisan story, costs, price, and confidence scores.
Hindi and English:
   - Titles, descriptions, bullet points, SEO keywords, craft explanations, care instructions, wholesale summaries, and audio playback.
   - Support Hindi plus one regional language initially; design for future Indic languages.
Human approval:
   - Seller must review, edit, regenerate, reject, or approve every AI result.
   - Never invent missing attributes, certifications, cultural history, sustainability claims, or artisan stories.
Fair Price Shield:
   - Calculate minimum sustainable price from materials, labor time/rate, packaging, overhead, shipping, fees, and margin.
   - Show D2C price and wholesale range.
   - Show cost breakdown, confidence, uncertainty, and expected seller earnings.
   - Never recommend below the sustainable floor by default.
   - Explain why the price changed.
Inventory and production:
   - Quantity, made-to-order status, MOQ, capacity, lead time, customization, and seasonal availability.
Catalog export:
   - Canonical product schema.
   - CSV/JSON/social sharing/buyer quotation export.
   - Design adapters for ONDC, IndiaHandmade, and GeM, but do not claim live integrations without authorization.
==================================================
4. BUYER FEATURES
==================================================
Prioritize B2B buyers such as boutiques, exporters, retailers, corporate gifting companies, and ethical buyers.
Build:
Buyer/organization profile.
Discover products and artisans.
Search and filter by:
   - Product, craft, region, material, technique, price, wholesale range, MOQ, capacity, lead time, customization, and verification.
Product detail page:
   - Original and enhanced images.
   - Product attributes.
   - Artisan story.
   - Craft, region, material, MOQ, capacity, wholesale price, lead time, care instructions, and provenance.
Buyer RFQ:
   - Product/craft, quantity, budget, delivery location, deadline, customization, packaging, and sample requirement.
Seller matching based on:
   - Craft, material, region, capacity, MOQ, lead time, price, customization, and reliability.
Inquiry workflow:
   - Send inquiry.
   - Request sample.
   - Ask questions.
   - Send quotation.
   - Negotiate.
   - Confirm order intent.
Use inquiry/RFQ instead of a complex cart and logistics system for the MVP.
==================================================
5. INNOVATIVE FEATURES
==================================================
Prioritize only feasible and meaningful innovations:
Fair Price Shield protecting labor value.
Authenticity-safe image processing with original-image comparison.
Craft knowledge graph connecting craft, region, material, technique, motifs, and care.
Voice Business Assistant answering questions from the seller’s own data.
B2B capability and RFQ matching.
One canonical catalog converted into multiple marketplace formats.
Offline-first product drafts and upload retry.
QR-based product storytelling without exposing sensitive personal data.
Hindi/audio explanations of price and missing information.
Cluster Manager mode for assisted onboarding and approval.
Avoid unnecessary features such as social feeds, blockchain without partners, automated price changes, AR, unrelated recommendation systems, and a large D2C marketplace.
==================================================
6. AI ARCHITECTURE
==================================================
Use a controlled pipeline:
Voice
→ language identification
→ speech-to-text
→ translation/normalization
→ structured attribute extraction
→ craft taxonomy matching
→ missing-field detection
→ seller confirmation
→ catalog generation
→ pricing
→ quality validation
→ approval
→ export
Image pipeline:
Original image
→ quality assessment
→ segmentation
→ bounded enhancement
→ formatting
→ authenticity check
→ seller approval
Pricing pipeline:
Seller inputs + AI attributes + materials + labor + fees + shipping + market references
→ cost floor
→ price range
→ D2C recommendation
→ wholesale recommendation
→ explanation and confidence
Evaluate Bhashini, AI4Bharat/IndicTrans2, Google Speech-to-Text, Whisper alternatives, OpenCV, ML Kit/TensorFlow Lite, rembg/U2Net-style models, multimodal LLMs, scikit-learn, XGBoost/LightGBM, embeddings, and pgvector.
For every AI component explain:
Best practical option.
Alternative.
Open-source option.
Training/data requirement.
Cost and latency.
Privacy implications.
Hackathon feasibility.
Fallback if the model fails.
Use strict JSON schemas, confidence scores, source tracking, model/prompt versioning, validation, safe fallbacks, and audit logs.
==================================================
7. ANDROID UX REQUIREMENTS
==================================================
Design for low-literacy and first-time smartphone users:
Large controls.
One primary action per screen.
Icons plus simple text.
Audio instructions.
One question at a time.
Minimal typing.
Hindi-ready localization.
Replay and correction.
Clear progress.
Simple language.
Large Dynamic Type.
VoiceOver labels.
Dark mode.
Reduced motion.
Loading, empty, error, permission-denied, and offline states.
Friendly recovery when AI or network fails.
Suggested seller tabs:
Home
Add Product
My Products
Inquiries
Business Assistant
Suggested buyer tabs:
Discover
Search
RFQs
Messages
Profile
==================================================
8. BACKEND, SECURITY, AND DATA
==================================================
Recommend a scalable but simple architecture using:
FastAPI.
PostgreSQL.
Object storage.
Redis/background workers.
REST APIs.
Role-based authorization.
Search and semantic matching.
Marketplace adapter layer.
Define database models for:
Users
Roles
Artisan profiles
Buyer profiles
Clusters
Products
Attributes
Media
Voice inputs
Transcripts
AI extractions
Price inputs
Recommendations
Inventory
RFQs
Matches
Inquiries
Quotations
Orders
Payments
Notifications
Consent
Audit logs
Marketplace exports
Security requirements:
- HTTPS.
Android Keystore token storage.
Encryption.
Secure authentication.
Role-based access.
Consent and deletion.
Minimal audio retention.
No API keys inside the Android app.
No sensitive data in logs.
Original-image protection.
Privacy-preserving region display.
Fraud/scam warnings.
Rate limiting and validation.
==================================================
9. MVP SCOPE
==================================================
MUST BUILD:
Android Seller and Buyer roles.
Seller profile.
Hindi voice input.
Product photo capture.
Speech-to-text.
Structured attribute extraction.
Image cleanup/background removal.
Hindi and English catalog generation.
Seller approval.
Material and labor cost input.
Explainable price floor and recommendation.
Seller catalog.
Buyer search and filters.
Buyer RFQ/inquiry.
Seller response.
Local draft saving or upload retry.
Basic in-app cluster/admin approval.
Basic analytics.
SHOULD BUILD:
One additional regional language.
Craft knowledge graph.
QR story.
Buyer matching.
MOQ/capacity/lead time.
Voice playback.
Before/after image comparison.
Simulated ONDC-style export.
Scam warnings.
MOCK/FUTURE:
Live GeM, IndiaHandmade, or ONDC publishing without official access.
Real payment settlement.
Full logistics.
Large-scale demand forecasting.
Blockchain certificates.
Automated dynamic repricing.
Complete consumer cart/review ecosystem.
==================================================
10. LIVE DEMO
==================================================
Create this demo:
Artisan Meena selects Hindi.
She photographs a hand-embroidered bag.
The app detects poor lighting and gives an audio suggestion.
She describes the product in Hindi.
The app transcribes the voice.
AI extracts craft, material, technique, region, production time, and cost.
The image is cleaned without changing the product.
The app asks for missing labor, packaging, quantity, MOQ, and lead time.
Fair Price Shield calculates sustainable floor, D2C price, wholesale range, and net earnings.
Meena hears the explanation in Hindi and approves the listing.
A boutique buyer searches by craft, MOQ, price, capacity, and delivery time.
The system matches Meena.
The buyer sends an RFQ.
Meena receives and responds to the inquiry.
The app exports a marketplace-ready catalog.
Show metrics:
   - Listing creation time.
   - Typing actions.
   - Fields completed by voice.
   - Image quality result.
   - Price floor.
   - Buyer match.
==================================================
11. OUTPUT / DEVELOPMENT PROCESS
==================================================
Do NOT immediately generate the full codebase.
FIRST provide:
Product understanding.
Seller and buyer personas.
Recommended seller-first development order.
MVP boundaries.
Complete seller journey.
Complete buyer journey.
Screen inventory.
Navigation structure.
Domain model.
Database model.
API contracts.
Android architecture.
AI architecture.
Security/privacy design.
Offline strategy.
Risks and unsupported assumptions.
Innovation and differentiation strategy.
Hackathon demo plan.
Phased implementation backlog.
First vertical slice.
The first vertical slice must be:
Seller login
→ seller profile
→ product photo
→ voice recording
→ speech-to-text
→ structured extraction
→ image enhancement
→ price calculation
→ seller approval
→ saved catalog item
After presenting the plan, WAIT FOR APPROVAL before generating code.
WHEN GENERATING CODE:
Provide complete compilable files.
State the filename and folder.
Include imports and setup.
Use current stable Android APIs.
Do not expose API keys.
Do not use pseudo-code when real code is possible.
Include error handling.
Include loading, empty, offline, and permission states.
Include accessibility and localization.
Keep the code modular.
Build and test one feature at a time.
==================================================
12. QUALITY BAR / FINAL PRINCIPLE
==================================================
At every stage, challenge the implementation against these questions:
Does this feel like a real mobile product?
Is every element purposeful?
Is the hierarchy immediately understandable?
Does the UI support low-literacy users rather than overwhelm them?
Is the visual identity distinctive without relying on trends?
Are AI outputs explainable, bounded, reviewable and trustworthy?
Are unsupported claims clearly avoided?
Are loading, failure, offline and permission states designed?
Is the implementation realistic for a student/hackathon team?
Is the code maintainable and testable?
Does the experience feel polished enough to withstand a professional product review?
Final principle:
Build a seller-first, buyer-informed, Android-only mobile application that is technically credible, socially meaningful, explainable, privacy-conscious, and difficult to dismiss as merely “another AI wrapper.”