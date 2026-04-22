---
name: behance-to-portfolio
description: Automates the end-to-end conversion of Behance case study images into a fully coded, premium portfolio webpage. Use when the user provides images/screenshots of a UX/UI case study or Behance presentation and asks to recreate it, code it, build it, or add it to the portfolio.
---

# Behance to Portfolio Webpage Converter

This skill orchestrates the entire process of transforming a static set of Behance portfolio images into a fully functional, senior-level (13+ years experience) React/Tailwind/Framer Motion case study webpage. 

## The Core Principle
**Never lose data, but always elevate the framing.** You must transcribe 100% of the original text, metrics, questions, and persona details verbatim. Then, wrap that raw data in a "senior UX" narrative (Double Diamond, heuristics, business goals) without inventing new facts or contradicting the original data.

## Workflow

Copy this checklist and track progress in a `[project-name]_task_tracker.md` file:

```markdown
Task Progress:
- [ ] Step 1: Analyze Images & Extract Content
- [ ] Step 2: Enhance Content Narrative
- [ ] Step 3: Extract Theme & Design System
- [ ] Step 4: Develop React Webpage
- [ ] Step 5: Update Router & Carousel
- [ ] Step 6: Verify & Refine
```

### Step 1: Analyze Images & Extract Content
Look closely at every provided image in the case study.
Create a file named `[project-name]_original_content.md` and transcribe **everything** verbatim.
- Copy all titles, tags, and descriptions.
- Copy all interview questions exactly as written.
- Copy all survey data points, numbers, and Yes/No percentages.
- Copy all persona details, empathy map bullets, and user flow steps.
- Note the locations where images, wireframes, flowcharts, or UI screens appear.

### Step 2: Enhance Content Narrative
Create a file named `[project-name]_enhanced_content.md`.
Write a senior-level case study narrative based on the original content.
- Add an Executive Summary and Role Framing.
- Reframe "The Problem" into a sharper business/user thesis.
- Categorize research into Qualitative (Interviews), Quantitative (Surveys), and Competitive Benchmarks.
- Synthesize raw bullet points into "Themes" or "Actionable Insights" (e.g., turning "People worry about fakes" into "The Trust Deficit").
- **CRITICAL:** Do NOT invent new data metrics, do NOT contradict the original findings, and do NOT omit any original section.

### Step 3: Extract Theme & Design System
Analyze the colors and typography from the Behance images.
- Identify the Primary (Background/Base), Secondary (Accent/Brand), and Text (High Contrast) colors.
- Define Tailwind hex codes (e.g., `bg-[#FAF8F5] text-[#2C2A29] selection:bg-[#E8DCC4]`).

### Step 4: Develop React Webpage
Create a new file `src/app/pages/[ProjectName]ProjectPage.tsx`.
- Use React, Framer Motion, and Tailwind CSS.
- Build a premium, scrollable page using the extracted colors.
- **Scroll Effects:** Implement subtle, classy background scroll effects (e.g., heavily blurred, `mix-blend-multiply` fixed blobs tied to `useTransform(scrollY)`).
- **Navigation:** Include a "Back to Home" pill component that fades in on scroll and is fully legible.
- **Content:** Use the enhanced narrative. Map the data into premium UI components (e.g., dual-bar charts for survey data, styled quotes for interviews, grid cards for competitive analysis).
- **Placeholders:** Every time an image, flowchart, wireframe, or UI mockup appeared in the original case study, render an `ImageSlot` component with an appropriate aspect ratio (e.g., `aspect-[16/9]`, `aspect-[4/3]`) and a clear label so the user can easily swap in their actual assets later.
- **Completeness Check:** Ensure EVERY section from the original Behance presentation is represented on the page.

### Step 5: Update Router & Carousel
1. Add the new page to `src/main.tsx` as a lazy-loaded route.
2. Add a new project card to `src/imports/carousel_projects.json`.
   - Provide a title, an Unsplash placeholder thumbnail, and a `cardUrl` pointing to the new route.
   - Do NOT add GitHub or external live links unless explicitly requested.

### Step 6: Verify & Refine
- Run `npm run build` or `npx vite build` to ensure the TypeScript/React code compiles without errors.
- Ensure all hooks (`useScroll`, `useTransform`) are used correctly at the component level, not inside JSX conditionals or loops.
- Fix any UI overlaps by using explicit spacing (`py-20`, `gap-16`), alternating background colors (`bg-[#FAF8F5]` vs `bg-[#F4EFE6]`), and ensuring all major sections are `relative z-10` to sit above background decor.
- Run `ReadLints` on the new file to catch any immediate errors.
