# AI Product Engineering Execution Document
## Mini Library Management System (AI-First)

You are acting as a Senior AI Product Engineer.

This project must demonstrate:
- AI-first thinking
- Clean architecture
- Proper validation
- Role-based permissions
- Secure authentication (SSO)
- Production readiness
- Deployment compatibility (Vercel)

This is NOT just a CRUD demo.

---

# 🛠 Tech Stack

- Next.js (App Router)
- TypeScript
- Prisma ORM
- SQLite (local development)
- NextAuth (Google SSO)
- TailwindCSS (minimal, modern UI)
- OpenAI API
- Zod (validation)

Deployment target: Vercel

---

# 🎯 Core Product Requirements

## 1️⃣ Authentication & Authorization

Implement Google SSO using NextAuth.

Roles:
- Admin
- Librarian
- Member

Permissions:

Admin:
- Manage users
- Full CRUD on books
- View AI insights dashboard

Librarian:
- Add/edit books
- Check-in / Check-out books

Member:
- View/search books
- Borrow books
- Use AI recommendation features

All protected routes must enforce role validation server-side.

---

## 2️⃣ Book Management

Book model must include:

- id
- title
- author
- description
- genre
- publishedYear
- totalCopies
- availableCopies
- createdAt
- updatedAt

Validation requirements:
- Required fields validated with Zod
- Server-side validation
- Proper error handling
- Prevent negative availableCopies
- Prevent checkout if availableCopies = 0

---

## 3️⃣ Borrowing System

Create BorrowRecord model:

- id
- userId
- bookId
- borrowedAt
- returnedAt (nullable)

Logic:

Check-out:
- Reduce availableCopies
- Create BorrowRecord
- Prevent duplicate active borrow

Check-in:
- Increase availableCopies
- Set returnedAt timestamp

Ensure database consistency using Prisma transactions where necessary.

---

## 4️⃣ Search System

Search must support:

- Title (partial match)
- Author
- Genre filter
- Availability filter

Use dynamic Prisma queries.

UI:
- Debounced search input
- Clear empty state
- Loading indicators

---

# 🤖 AI Features (Must Be Meaningful)

AI must add real product value.

---

## AI Feature 1: Smart Book Summary

Given a book description:
- Generate 3-line summary
- Key themes
- Ideal reader profile

Must:
- Request strict JSON output
- Validate JSON response
- Handle parsing failures
- Show fallback message if AI fails

---

## AI Feature 2: Personalized Recommendations

Based on:
- User borrowing history
- Preferred genres

Important:
- Provide AI only with real database book list
- Explicitly instruct AI not to invent books
- Return structured JSON with recommended book IDs
- Validate output against database

---

## AI Feature 3: Admin AI Insights Dashboard

Generate insights such as:
- Most popular genres
- Borrow frequency patterns
- Suggested acquisition categories

Use aggregated DB statistics as prompt input.

Never let AI hallucinate metrics.

---

# 🧠 AI Engineering Rules

- Create `/lib/ai/aiService.ts`
- Centralize all OpenAI calls
- Never call OpenAI directly from components
- Use environment variables
- Add timeout handling
- Wrap calls in try/catch
- Log meaningful errors (dev only)
- Strip console logs in production

Prompt structure must:
- Define role clearly
- Define constraints clearly
- Request structured JSON only
- Forbid hallucinated content

---

# 🧪 Quality & Validation Requirements

Must implement:

- Zod validation
- Graceful error UI
- HTTP status codes
- Loading states
- Empty states
- Skeleton loaders (if reasonable)
- Defensive programming
- Proper type safety

---

# 🎨 UX/UI Requirements

Design must be:

- Minimalistic
- Clean layout
- Sidebar dashboard structure
- Neutral color palette
- Good typography hierarchy
- Responsive
- Clear feedback messages
- Clear call-to-action buttons

Avoid:
- Overcomplicated UI
- Excessive animations
- Visual clutter

---

# 🏗 Architecture Structure

/app  
/components  
/lib  
  /ai  
  /auth  
  /prisma  
/types  
/api  

Keep separation of concerns.

---

# 🚀 Deployment Requirements

Ensure:

- Vercel compatible
- No hardcoded secrets
- `.env.example` provided
- Prisma postinstall script included
- Production build passes
- No unused dependencies
- Clean git history

---

# 📄 README Requirements

The README must include:

- Project overview
- Feature list
- AI features explanation
- Architecture explanation
- Local setup instructions
- Environment variables
- Deployment steps
- Future improvements

---

# 🛑 Development Strategy

We will build incrementally:

1. Initialize project
2. Configure Prisma schema
3. Implement authentication
4. Implement Book CRUD
5. Implement Borrow system
6. Implement Search
7. Implement AI service
8. Add AI features
9. Polish UI
10. Write README

Do NOT generate everything at once.

Before writing major code, summarize understanding.

Ask for clarification if requirements conflict.

---

# 🎯 Engineering Mindset

Prioritize:
- Clarity
- Reliability
- Validation
- Maintainability
- AI safety
- Clean structure

Avoid shortcuts.

This project represents production-quality AI-first engineering.