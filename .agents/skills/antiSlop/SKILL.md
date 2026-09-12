---
name: distinctive-fullstack-nextjs
description: Use this skill whenever building a full-stack website or web app with Next.js/React — landing pages, dashboards, SaaS products, portfolios, internal tools, anything with a UI. It enforces a hard ban on the visual patterns that make sites look like generic AI output (specific colors, fonts, layout clichés) and gives a Next.js full-stack scaffolding default (App Router, API routes/Server Actions, DB choice). Trigger this any time the user asks to "build a website," "build an app," "make a landing page," "create a dashboard," or similar — even if they don't explicitly mention design or say it should look different from other AI sites. Always consult this before writing any UI code.
---

# Distinctive Full-Stack Next.js

Two jobs happen together here: (1) scaffold a real full-stack Next.js app, and (2) make sure it does not look like it came out of an AI website generator. Job 2 is not optional polish — treat the banned-pattern list below as build constraints as hard as "the login form must work."

Read `/mnt/skills/public/frontend-design/SKILL.md` too and follow its process (brainstorm token system → critique against genericness → build → critique again). This skill adds a **stricter, zero-tolerance layer** on top of that one for the specific patterns listed below, plus the tech-stack default. Where the two overlap, this skill's hard bans win.

## The hard-banned list

Never use these unless the user's brief explicitly and specifically asks for them by name. Being a "safe, tasteful, professional" choice is not an exception — these are exactly the choices that read as AI-generated regardless of how tastefully they're used.

**Banned colors (as dominant palette or primary accent):**
- Indigo/violet/purple gradients as a hero or background treatment (`#6366f1`, `#8b5cf6`, `#a855f7` and near neighbors)
- The "AI accent" terracotta/clay orange (`#D97757` and near neighbors)
- Generic SaaS blue-on-white (`#2563eb` / `#3b82f6` as the primary brand color on a white background)
- Cream background + high-contrast serif + warm-clay accent, as a combo
- Near-black background + single acid-green or vermilion accent, as a combo

**Banned fonts:**
- Inter, as the only or primary typeface, used at default weights
- Any pairing where both display and body text are the same neutral geometric sans (Inter, Manrope, DM Sans, Plus Jakarta Sans) with no contrast between them

**Banned layout/component clichés:**
- Hero pattern: centered headline + subhead + two pill buttons + gradient blob/mesh background
- Bento-grid feature sections where every cell is a rounded card with an icon-in-a-circle, a bold heading, and one line of gray body text
- Icon-in-a-tinted-rounded-square as the default way to represent every feature
- Numbered steps (01 / 02 / 03) used as decoration rather than because the content is an actual sequence
- Uniform `border-radius: 12–16px` applied to every card, button, and input with no variation
- Testimonial cards that are all identical rounded rectangles with a circular avatar, name, and 2-line quote
- Stats bar with big number + small gray label, used as the hero's supporting content by default
- Glassmorphism (frosted blur panels) as a default surface treatment
- Drop shadows as the primary way to create depth on every card

None of these are permanently off-limits in the abstract — a fintech dashboard might legitimately want blue, a real 3-step onboarding flow might legitimately want numbered steps. The ban is on using them **by default, unexamined, because they're the safe AI answer.** If the brief's content genuinely calls for one, name that reasoning explicitly before using it.

## Process

1. **Read the brief for real constraints.** Subject, audience, the one job this page/app does. If the user hasn't specified, pin it down yourself and state the assumption (per proactivity norms) rather than asking, unless it's truly ambiguous.
2. **Run the frontend-design brainstorm pass**: token system (4–6 named hex colors, 2+ typefaces with real contrast between display/body, layout concept, one signature element), grounded in the subject's own world, not a generic template.
3. **Check the plan against the banned list above, explicitly, item by item.** If anything on the plan matches a banned pattern, replace it and note what changed and why. Do this before writing code, not after.
4. **Scaffold the full stack** per the defaults below.
5. **Build, then self-critique once more** against both this list and frontend-design's genericness check.

## Full-stack default: Next.js

Unless the user specifies a different stack, default to:

- **Framework**: Next.js (App Router), TypeScript
- **Styling**: Tailwind CSS, but with a real custom theme (extend `tailwind.config` with the token system's named colors and font families — never ship raw Tailwind defaults like `indigo-500` or `slate` grays as the brand palette)
- **Backend**: Next.js Route Handlers (`app/api/**/route.ts`) or Server Actions for mutations — pick Server Actions for form-driven CRUD, Route Handlers for anything that needs to be called from outside the app (webhooks, external clients)
- **Database**: ask the user if unclear (Postgres via Prisma is the reasonable default for a relational app; suggest it as an assumption rather than blocking on it for a prototype — SQLite via Prisma is fine for local/demo)
- **Auth**: only scaffold if the brief needs it; don't add auth machinery to a static marketing site

State these defaults briefly to the user before scaffolding if they haven't specified a stack, so they can redirect if they had something else in mind — this isn't worth a full clarifying-question round trip, just a one-line assumption stated inline.

See `references/component-patterns.md` for distinctive alternatives to each banned cliché (what to do instead, not just what to avoid).
