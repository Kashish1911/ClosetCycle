# closetcycle — Figma Make Prompt

Create a polished, clickable, responsive multi-page web app called **closetcycle**, a clothing exchange platform for college students and young adults. Users list pre-loved clothes, browse community listings, request direct swaps, or use internal swap credits. The goal is to make clothing reuse affordable and easy.

## Visual direction

- Fashion-led, warm, welcoming, sustainable; avoid looking like a generic online store or charity site.
- Cream/off-white backgrounds, forest-green primary color, sage secondary color, restrained terracotta accents, dark readable text, accessible contrast.
- Refined sans-serif typography, generous whitespace, rounded cards, subtle borders/shadows, consistent spacing and reusable components.
- Use realistic, diverse clothing photography and fictional sample users/items.
- Responsive desktop, tablet, and mobile layouts. On mobile use a compact header and bottom navigation where useful.
- Use plain language. Whenever credits appear, explain: “Swap credits are platform points, not cash.”

## Global navigation

Desktop header: closetcycle wordmark/icon; Browse; How it works; My wardrobe; Credits; profile/sign in; primary “List an item” button. Mobile: Browse, Saved, Add, Exchanges, Profile. Show active navigation state. All links and primary actions should work in the prototype.

## Pages

### 1. Home with animated hero

Hero text: “Good clothes deserve another go.” Supporting copy: “Swap pre-loved pieces with your community. Find something new to you, give clothes a second life, and keep fashion moving.” Buttons: “Explore clothes” and “How closetcycle works.” Add a small note: “Free to browse · Swap locally · Wear what you love.”

Create an editorial hero composition with 3–5 clothing cards/cutouts around a circular swap symbol. Gently animate garment cards floating or drifting; cards briefly move toward the center, exchange positions, and settle, suggesting a swap. Add tiny labels like “Listed today,” “Size M,” and “120 credits.” Keep text still and readable. Respect reduced-motion settings with a still composition.

Below hero: clearly labelled illustrative impact stats; featured listings grid; three-step “How it works”; direct swap vs credits explainer; community/editorial section; final browse CTA; full footer with About, Safety, Help, Terms, Privacy, and social links.

### 2. Marketplace / Browse

Heading “Find something new to you.” Include search, category/size/condition/color/credit filters, sort by Recommended/Recently listed/Lowest credits, removable filter chips, clear-all, result count, responsive item grid, and load-more or pagination. Cards show photo, name, size, condition, credit value, broad area, and save button. Include loading skeletons and a helpful no-results state. Example listings: denim jacket, floral dress, wool coat, black jeans, striped shirt, canvas tote.

### 3. Item details

Breadcrumbs, image gallery, item name/value/category/size/condition/color/brand, description, fit note, owner card with fictional avatar/name/broad area, “Request this item” and “Save item” buttons. Explain meetup/delivery is arranged by users after acceptance; do not promise a delivery service. Include related listings, report link, and saved confirmation.

### 4. Exchange request flow

Use clear progress steps. Let user choose **Direct swap** (select one of their own listings) or **Use credits**. Show both item values and any credit difference; never hide a deduction. For credit requests, show current balance, item value, and remaining balance. Explain credits settle only after completion. Final review shows item(s), people, amount, and exchange details; include confirmation checkbox and “Send exchange request.” Success state links to exchanges.

Include validation/error states: no item to offer, insufficient credits, item unavailable, own listing, network error. No purchase checkout or real payment.

### 5. My wardrobe

Tabs: My listings, Incoming requests, Sent requests, Saved items. Listing cards show photo, title, size, credits, availability/status (Draft, Available, Exchange pending, Exchanged, Archived), and edit/archive actions. Requests show other user, items, type/value, date, status; incoming requests have Accept/Decline, sent pending requests have Cancel. Confirm consequential actions. Accepted/pending listings cannot be offered in another exchange. Unavailable saved listings are clearly marked.

### 6. Exchanges

List filters: All, Needs my action, In progress, Completed, Cancelled. Detail page shows both people/items, date, who acts next, and status timeline: Requested → Accepted → Meetup/delivery arranged → Completed; also Rejected/Cancelled. Provide status-appropriate actions and confirmations. Explain that accepting is not completion and credits settle after both parties confirm completion (or visibly label a simpler prototype rule). Include neutral safe-meetup guidance and report-problem link. No chat.

### 7. Credits wallet

Show available swap-credit balance, clear explanation that credits balance exchanges, are not money, cannot be withdrawn or used outside closetcycle. Activity list with date, related exchange, status, and earned/spent amount; filters All/Earned/Spent; new-user empty state. No cash symbols, bank details, withdrawal, or payment forms.

### 8. How it works

Explain listing an item, finding a piece, choosing a direct swap or credits, arranging a safe meetup/delivery, and confirming completion. Add simple flow diagram, examples of equal-value and credit-balanced swaps, item-quality guidance, safety section, browse/list CTAs.

### 9. Create/edit listing

Form fields: up to 5 photos (preview/reorder/remove), title, category, size, condition (Like new/Very good/Good), color, optional brand, description, suggested credit value with note it is for exchange balancing not sale, broad meetup area, ownership/accuracy checkbox. Buttons Save draft, Preview, Publish. Include inline validation, upload error, unsaved-changes warning, populated edit mode, and published success page.

### 10. Sign in / account creation / password reset

Sign-in: email/password. Sign-up: name/email/password/confirm and Terms/Privacy agreement. Include password visibility, validation/errors, forgot-password and reset confirmation, links between pages. Keep accessible and mobile friendly. Avoid claiming backend verification is implemented.

### 11. Profile/settings

Fictional avatar, display name, broad area, bio, counts for listings/completed exchanges/saved items, exchange history, edit profile, account and notification settings, privacy note not to publish full address/sensitive details, sign out and help/report link.

### 12. Safety, help, terms, privacy

Simple pages for safe exchanges, reporting, listing/request rules, privacy overview and consent, sample terms (ownership, honest condition, cancellation, prohibited items), and help form with confirmation. Mark legal copy as sample UI text requiring review before launch; do not make legal guarantees.

### 13. Basic admin/moderation view

Clearly labelled admin-only desktop dashboard with summary cards (active listings, pending reports, active exchanges, users); listings and reports tables; review actions to mark report reviewed, remove listing, or suspend account; confirmation dialogs and small audit history. Keep simple.

## Prototype interactions and states

Connect navigation and the main journey: Home → Browse → Item details → Direct swap/credits request → Exchanges → Complete → Wallet activity. Search/filter controls, save toggles, tabs, dropdowns, dialogs, toasts, and forms should visibly respond. Include hover, focus, pressed, selected, disabled, loading, empty, validation, error, and success states. Forms need labels and keyboard navigation. Listing creation should lead to preview and publish confirmation. Exchange actions should update the timeline.

## Motion

Keep motion restrained: hero swap animation is the main loop; use gentle page fades, subtle card hover, and small success feedback. Avoid distracting movement/parallax. Honor reduced-motion preferences.

## Deliverable and scope

Generate a cohesive multi-page clickable website with reusable components. Provide desktop and mobile designs at least for Home, Marketplace, Item details, Exchange request, Wardrobe, and Wallet. Use fictional demo data. Keep the MVP realistic for a student project. Do not add real payment gateways, cash transfers, withdrawals, AI recommendations, or chat.
