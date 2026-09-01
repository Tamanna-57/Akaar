## [Title] SIH 2026 – Problem Statement 26090AI-Driven Market Linkage & Smart Cataloging Platform
Android + Backend + Buyer Portal + Seller Portal + Admin DashboardClaude Code Prompt-Chaining Blueprint
## [Heading1] 1. Product Vision
Build a three-sided digital commerce ecosystem for marginalized Indian artisans, weavers and micro-entrepreneurs. The platform should let an artisan digitize products with minimal typing, while AI handles cataloging, translation, image enhancement, pricing assistance, buyer matching and business support.
Core loop:
Artisan → Speak/Photograph → AI Catalog → Marketplace → Buyer Discovery → Offer/Negotiation → Custom Request → Order → Artisan Income
North-star positioning: “From Karigar to Commerce, in one conversation.”
## [Heading1] 2. Android-First Technical Direction
Mobile: Android-first using Kotlin + Jetpack Compose.
Architecture: MVVM/Clean Architecture with repository pattern and clear feature modules.
Backend: REST API with authentication, marketplace, offers, orders, customization and AI orchestration.
Database: PostgreSQL or equivalent relational database.
Storage: Object storage for product images, artisan media and reference images.
AI: Provider-agnostic AI gateway so Gemini/Groq or another model can be swapped without rewriting app logic.
Voice: speech-to-text pipeline, followed by structured extraction and translation.
Localization: native Android localization for UI; AI/translation services for user-generated product content.
Admin: responsive web dashboard rather than a second mobile app.
Keep business logic server-side so iOS/web clients can be added later.
## [Heading1] 3. Product Modules
Seller: Phone/OTP onboarding, language selection, voice profile creation, product capture, AI cataloging, image enhancement, pricing assistant, inventory, orders, negotiations, custom requests, earnings and AI assistant.
Buyer: Marketplace, search, filters, AI discovery, product pages, artisan stories, make-an-offer, negotiation, customization/RFQ, orders and AI assistant.
Admin: Artisan/buyer/product/order management, moderation, cluster analytics, craft analytics, impact dashboard, AI insights and platform controls.
AI Layer: Voice-to-text, structured information extraction, translation, product description generation, image understanding, image quality assistance, pricing, recommendations, buyer matching and role-aware chatbot.
## [Heading1] 4. Differentiators to Protect in the MVP
Voice-first artisan onboarding: speak instead of filling long forms.
AI-assisted product cataloging: photograph + voice → professional listing.
AI-assisted bargaining: seller defines a private negotiation corridor; buyer proposes an offer; seller accepts/counters/rejects.
Customization marketplace: structured requests for size, dimensions, material, design, color, quantity and deadline.
Craft Passport: artisan story, craft origin, process and authenticity/provenance fields.
AI business manager: different assistants for buyer, seller and admin.
B2B flow: bulk quantity, MOQ, capacity, lead time, customization and RFQ.
Government/cluster intelligence: map and dashboard showing artisan participation, demand, sales and craft health.
## [Heading1] 5. Important Product Principles
AI proposes; artisan confirms. Never silently assert craft/material/heritage facts.
Do not expose the seller’s minimum acceptable price to buyers.
Use deterministic rules for permissions, offer limits, order states and other critical business logic.
Do not use an LLM for ordinary database retrieval or basic marketplace filtering.
Use pre-translated Android UI strings for supported languages; use AI/translation for user-generated content.
Design for low literacy: large actions, icons, voice, confirmation steps and minimal typing.
Do not build every feature for SIH. Make one end-to-end journey work exceptionally well.
## [Heading1] 6. Research Data to Collect
Artisan: Location, Craft, Language, Digital literacy, Current sales channels, Pricing method, Production capacity, Customization practices, Key pain points
Product: Craft, Material, Technique, Price, Production time, Customization, MOQ, Dimensions, Images
Buyer: Buyer type, Budget, MOQ, Craft preference, Customization, Delivery, Location, Trust requirements
Negotiation: Listed price, Offer, Counter-offer, Accepted price, Quantity, Time, Outcome
Customization: Original product, Requested changes, Quantity, Deadline, Feasibility, Final price, Outcome
## [Heading1] 7. Suggested SIH Demo Story
1. Artisan selects Hindi and speaks a short description of a Banarasi dupatta.
2. System converts speech to structured product fields and generates Hindi/English listing text.
3. Artisan captures a product photo; AI assists with background, lighting and e-commerce framing.
4. AI pricing assistant suggests a competitive range using product attributes, costs and available market data.
5. Buyer searches for a blue handwoven dupatta under ₹2,500.
6. Buyer opens the product and uses Make an Offer.
7. Seller receives the offer and accepts/counters/rejects without exposing the private minimum price.
8. Buyer sends a custom request for 20 pieces with specified color, dimensions and deadline.
9. Seller sees a structured RFQ and an AI feasibility suggestion.
10. Admin dashboard shows the new artisan, listing, buyer interaction and order/impact metrics.

## [Heading1] 8. Claude Code Prompt-Chaining Plan
Use the prompts below sequentially. Each prompt is intentionally scoped so Claude Code can inspect the existing project, make a focused change, run tests/build checks and report what changed. Do not ask it to rebuild unrelated modules unless a later prompt explicitly requires it.
## [Heading2] Prompt 01 – Project Audit & Architecture
You are the lead Android/backend engineer for SIH Problem Statement 26090. Inspect the current repository before changing anything. Identify the Android stack, backend stack if present, build configuration, package structure, existing dependencies, tests, assets and environment configuration. Then propose a production-minded architecture for an Android-first artisan marketplace with Buyer, Seller and Admin roles. Use Kotlin + Jetpack Compose for Android, MVVM/Clean Architecture, repository pattern, REST APIs, PostgreSQL, object storage and a provider-agnostic AI gateway. Do not rewrite working code. Create/update ARCHITECTURE.md with the agreed structure, data flow, modules, API boundaries and future extensibility for iOS/web. Run the safest available build/tests and report findings.
## [Heading2] Prompt 02 – Android Foundation
Implement the Android foundation described in ARCHITECTURE.md. Use Kotlin and Jetpack Compose. Set up navigation, theme, dependency injection if appropriate, networking layer, repository interfaces, local persistence where needed, error/loading states, and a clean feature-based package structure. Keep secrets out of source control. Add a minimal launch screen and make the app compile. Do not implement marketplace features yet. Run the Android build and fix only issues introduced by this step.
## [Heading2] Prompt 03 – Authentication & Language Onboarding
Build the first real user flow: role selection, phone/OTP-oriented login/signup UI, language selection and basic profile setup. Support Buyer and Seller roles now, while keeping Admin role server-authorized. Make the UI low-literacy friendly with large controls, icons and minimal typing. Store selected language and role through the proper repository/session layer. Do not dynamically translate Android UI with an LLM; use localization resources for UI strings. Leave hooks for voice onboarding and translation services. Add tests for navigation and validation. Build the app.
## [Heading2] Prompt 04 – Seller Voice-First Onboarding
Implement Seller onboarding after authentication. Provide a large voice-recording action and a fallback text input. The user should be able to describe their name, location, craft and experience naturally. Define a backend DTO for voice transcription and structured profile extraction. The AI integration must go through an AI gateway interface, not directly from UI code. Display extracted fields for artisan confirmation before saving. Implement mock/local AI responses if real credentials are unavailable. Add clear loading, retry and confirmation states.
## [Heading2] Prompt 05 – Seller Dashboard
Create the seller home dashboard optimized for low digital literacy. Prioritize five actions: Add Product, My Products, Buyer Requests, My Sales and Ask AI. Keep the visual hierarchy simple. Add empty/loading/error states and role-based navigation. Use reusable Compose components and localization resources. Do not add unrelated analytics yet.
## [Heading2] Prompt 06 – Product Capture & Smart Cataloging
Implement the seller Add Product flow. Allow camera/gallery image selection, product title/short voice description, category/craft/material fields and confirmation. Define the smart-catalog pipeline: image + voice/text → transcription → structured extraction → professional Hindi/English description → seller confirmation → product draft. Never silently invent craft or material facts. Show AI-proposed values with editable fields and a clear confirmation step. Use mocked AI responses if no key is configured. Add unit tests for mapping/extraction DTOs.
## [Heading2] Prompt 07 – AI Image Studio
Implement the product image studio interface. It should support capture/import, preview, crop/aspect ratio, background-cleanup request, lighting/quality enhancement request and e-commerce-ready preview. Keep actual AI image processing behind an ImageEnhancementService interface with a mock implementation if the provider is unavailable. The UI must clearly distinguish original and enhanced images and allow the artisan to approve/revert. Do not claim enhancement succeeded unless the service returns success.
## [Heading2] Prompt 08 – Marketplace Backend
Implement the marketplace backend/data model for users, artisan profiles, products, product media, categories, crafts, materials, inventory and basic product status. Create REST endpoints needed by Buyer and Seller clients. Add validation, pagination, filtering primitives and authorization. Use migrations/schema management and seed realistic demo data representing Indian handicrafts without making unsupported heritage claims. Document the API contracts. Add backend tests.
## [Heading2] Prompt 09 – Buyer Marketplace
Implement the Buyer marketplace in Android. Use an Amazon-like commerce structure but make the experience craft-centric. Include product cards with image, name, price, location, artisan, craft/material badges and negotiable/customizable indicators. Add search, pagination and filters for category, price, location, craft, material, technique, handmade/handwoven, customizable and B2B relevance. Keep filtering server-driven where practical. Add loading, empty and error states.
## [Heading2] Prompt 10 – Product Detail & Craft Story
Implement the Buyer product detail screen. Include large product imagery, price, artisan name/location, craft/material information, product details, artisan story, customization availability and actions for Buy/Request, Make an Offer and Customize. Add a Craft Passport section for structured craft story/provenance fields, but label unverified information clearly. Keep the seller as the authority for product facts. Use reusable components and tests.
## [Heading2] Prompt 11 – Dynamic Pricing Assistant
Implement the pricing assistant as a backend service with a clean interface. Inputs should include product attributes, raw material cost, labor/time estimate, quantity, location/market context and available comparable-market data. Return a suggested range plus a confidence/explanation payload, never a fake precise market fact. Keep the pricing model/provider replaceable. Add a seller confirmation screen and persist the seller-selected final price. Include a deterministic fallback when market data or AI is unavailable.
## [Heading2] Prompt 12 – Bargaining / Make an Offer
Implement the negotiation system end to end. Seller sets listed price, preferred price and private minimum acceptable price. Buyer only sees the public listed price and that negotiation is available. Provide an intuitive offer interaction including slider or drag gesture with a sensible public range, then Send Offer. Seller can Accept, Counter or Reject. Persist an offer thread and status history. Never expose the seller's private minimum. Add server-side authorization and validation so clients cannot bypass negotiation rules. Add tests for offer state transitions.
## [Heading2] Prompt 13 – AI-Assisted Fair Offer
Extend negotiation with an AI-assisted fair-offer indicator. Given product attributes, public price, quantity and available market evidence, return a coarse label such as Below Typical Range, Reasonable Range or Strong Offer. Do not reveal private seller thresholds. Make the AI explanation generic and evidence-based. If evidence is unavailable, return an honest unavailable state rather than hallucinating. Keep this advisory only; final negotiation decisions remain with buyer/seller.
## [Heading2] Prompt 14 – Customization / RFQ
Implement buyer customization requests. Support size, dimensions, material/composition, color, design/reference image, quantity, deadline, budget and voice instructions. Let buyers describe requests naturally and optionally convert voice/text into structured fields using the AI gateway. Show an editable confirmation step before submission. On the seller side, display the request as a structured RFQ with Accept, Counter and Decline actions. Add backend persistence, authorization and status transitions.
## [Heading2] Prompt 15 – AI Feasibility Assistant
Add seller-side feasibility analysis for custom requests. Inputs: requested quantity, current inventory/capacity, estimated production time, requested deadline, materials and seller constraints. Return Possible / Needs Negotiation / Unlikely with a short reason and suggested adjustment. This is advisory only and must never automatically promise a delivery date. Add tests for deterministic edge cases and a mock AI implementation.
## [Heading2] Prompt 16 – Role-Aware AI Chatbot
Implement the AI assistant as a role-aware feature for Buyer and Seller. Buyer capabilities: product discovery, filters, gift/budget recommendations and order/product help. Seller capabilities: profile setup, product listing, pricing guidance, inventory/order help and custom-request guidance. Use an AI gateway abstraction supporting Gemini or Groq later. Do not let the LLM directly perform privileged actions. For actions such as updating inventory or submitting an offer, require explicit structured confirmation and route the final operation through normal backend APIs. Store only necessary chat data.
## [Heading2] Prompt 17 – B2B Marketplace
Add B2B buyer capabilities. Product pages should expose MOQ, production capacity, lead time, customization availability and bulk pricing when provided by the seller. Add Request Bulk Quote/RFQ, quantity, target price, deadline and requirements. Add seller-side B2B request management. Keep consumer and B2B experiences distinct but share the same marketplace data model.
## [Heading2] Prompt 18 – Orders, Inventory & Seller Earnings
Implement the core order lifecycle after an accepted purchase/offer/custom RFQ. Add order states, inventory reservation/update rules, seller order management, buyer order tracking and simple earnings summary. Keep payment integration abstracted behind a PaymentService interface if real payments are not required for the SIH prototype. Never mark an order paid without a verified backend state. Add tests for inventory and order transitions.
## [Heading2] Prompt 19 – Admin Portal
Implement a responsive web admin dashboard for SIH Problem Statement 26090. Include artisan management, buyer management, product moderation, orders, offers, custom RFQs, crafts/categories, platform metrics and basic cluster/location analytics. Add role-based authorization and audit-friendly actions. Prioritize clarity over visual complexity. Use demo data to show how government/cluster administrators can understand adoption and marketplace activity.
## [Heading2] Prompt 20 – Craft Health & Impact Analytics
Add admin analytics focused on Heritage & Culture impact. Track artisan participation, active products, buyer demand, orders, sales value, digital adoption and craft/category activity. Where enough data exists, compute simple trend indicators. Add a Craft Health view with active artisans, demand trend, younger/older participation only if such data is legitimately collected, and risk flags based on transparent rules. Do not invent demographic data. Provide an India/district/cluster view if location data is available and consented.
## [Heading2] Prompt 21 – Craft Passport & Trust
Implement the Craft Passport data model and UI. Store artisan-approved craft name, region, technique, material, artisan story, process, media and optional certification/GI references. Distinguish seller-provided, admin-verified and external-reference information. Never generate unsupported authenticity or GI claims. Add a QR/deep-link-ready passport identifier without implementing blockchain. Show the passport on product details.
## [Heading2] Prompt 22 – AI Gateway & Provider Switching
Refactor all AI calls behind explicit interfaces such as TextGenerationService, SpeechToTextService, TranslationService, VisionService, ImageEnhancementService and PricingService. Provide Gemini and/or Groq adapters where appropriate, but keep provider selection configurable through backend environment configuration. Never expose API keys in the Android app. Add mock adapters for local development and tests. Document environment variables and failure behavior.
## [Heading2] Prompt 23 – Localization & Accessibility Pass
Audit the Android app for low-literacy and multilingual use. Move UI strings into Android localization resources, add supported-language structure, large touch targets, accessible content descriptions, readable typography and clear confirmation states. Keep user-generated content translation separate from UI localization. Ensure the core Seller journey can be completed with minimal typing and strong voice affordances. Test at small and large font sizes.
## [Heading2] Prompt 24 – Security & Privacy
Perform a security pass across Android and backend. Check authentication/session handling, authorization, input validation, file upload restrictions, API key handling, logging, sensitive data exposure, object storage permissions and AI prompt injection risks. Ensure LLM output is treated as untrusted data and cannot bypass backend authorization. Add rate limits and safe error messages where appropriate. Document security decisions and unresolved risks.
## [Heading2] Prompt 25 – Offline/Low-Connectivity Resilience
Improve resilience for rural/low-connectivity users. Cache essential marketplace/profile data, support retry queues for safe operations, preserve incomplete product drafts locally, compress images before upload and clearly show sync state. Do not pretend an operation succeeded offline if the backend has not confirmed it. Identify which workflows can safely work offline and document limitations.
## [Heading2] Prompt 26 – Testing & Demo Data
Create a coherent SIH demo dataset: several artisans across different Indian regions, multiple craft categories, products, buyer profiles, offers, custom RFQs and orders. Do not use real people's personal data. Add unit, integration and UI tests for the critical journey: seller onboarding → add product → AI catalog → publish → buyer search → offer → counter → customization → order. Ensure deterministic mock AI responses for automated tests.
## [Heading2] Prompt 27 – End-to-End Polish
Act as a senior product engineer and run an end-to-end review of the entire SIH 26090 prototype. Fix broken navigation, inconsistent states, crashes, poor loading behavior, missing empty/error states, duplicated components, obvious accessibility issues and visual inconsistencies. Preserve the architecture. Prioritize the demo journey and avoid adding new major features. Run builds/tests and report any remaining blockers.
## [Heading2] Prompt 28 – SIH Demo & Judging Readiness
Prepare the repository for a 4–5 minute SIH demonstration. Create DEMO_SCRIPT.md describing the exact sequence: artisan voice onboarding, AI cataloging, image studio, pricing, marketplace discovery, bargaining, customization/RFQ, seller feasibility and admin impact dashboard. Create JUDGES_FAQ.md answering: why this is different from existing marketplaces, why AI is necessary, how rural/tribal users benefit, how hallucinations are controlled, how bargaining is fair, how privacy is protected, how the system scales, and how existing government/commerce ecosystems could be integrated later. Do not exaggerate capabilities that are not implemented.
## [Heading1] 9. Recommended Build Order
Foundation → Authentication → Language → Seller onboarding
Seller dashboard → Product capture → AI catalog → Image studio
Marketplace backend → Buyer marketplace → Product details
Pricing → Bargaining → Customization/RFQ
AI chatbot → B2B → Orders/inventory
Admin portal → Craft Passport → Impact analytics
Localization/accessibility → Security → Offline resilience → Testing
Final polish → Demo script → Judges FAQ
## [Heading1] 10. What Not to Build First
Full payment/logistics ecosystem
Global marketplace
30-language support before validating the core flow
Autonomous AI negotiation
Blockchain provenance
Complex recommendation ML before you have meaningful interaction data
Multiple native apps at once
Large analytics suite with little real data
## [Heading1] 11. Final Success Criteria
The prototype should prove one thing exceptionally well: an artisan with limited digital skills can enter the digital marketplace through voice and guided workflows, while buyers can discover, negotiate and customize products, and administrators can see measurable ecosystem impact.
The strongest implementation is not the one with the most features. It is the one where the complete artisan → AI → marketplace → negotiation → customization → order loop feels credible, fast and easy to understand.