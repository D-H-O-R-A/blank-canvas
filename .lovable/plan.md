

# Plan: Mobile Optimization + Registration System with Firebase Auth/Firestore + Mercado Pago Integration + Login/Dashboard

## Overview

This plan covers mobile responsiveness fixes, updating the "+5K Likes" visual, implementing a full registration flow with Firebase Auth + Firestore, Mercado Pago recurring payments via Firebase Cloud Functions, and a Login/Dashboard page for returning users. All data access goes through API with JWT validation -- no direct Firestore reads from client.

---

## 1. Mobile Responsiveness Fixes

**Files:** `HeroSection.tsx`, `AboutSection.tsx`, `HowItWorksSection.tsx`, `ProfessionalSection.tsx`, `TestimonialsSection.tsx`, `CTASection.tsx`, `Footer.tsx`, `index.css`

- Hero: Reduce title to `text-3xl` on mobile, hide phone mockup below `md`, reduce padding
- About: Stack stat grids to 2-col on mobile
- HowItWorks: 1-col on mobile, 2-col on tablet
- ProfessionalSection: Single-col form fields on mobile in modal
- Testimonials: 1-col on mobile, 2-col on tablet
- Footer: Stack columns
- Global: `section-padding` becomes `py-16 lg:py-32`

## 2. Hero "+5K Likes" -- 3 Overlapping Avatars

**File:** `HeroSection.tsx`

Replace `likesPeople` image with 3 circular overlapping avatars using `person-1.jpg`, `person-2.jpg`, `person-3.jpg` with negative margins:

```
[👤][👤][👤] +5K Likes
```

## 3. Registration Modal Revamp

**File:** `ProfessionalSection.tsx`

New form fields: Nome, Email, WhatsApp, Profissão, **Senha** (password). Remove payment method selection (Mercado Pago handles it). Only 2 plans:

| Plan | Price | Features |
|------|-------|----------|
| 1 mês | R$25/mês | Perfil básico, 5 propostas/mês, Suporte por email, Badge verificado |
| 6 meses | R$23/mês (10% OFF) | Perfil premium, Propostas ilimitadas, Suporte prioritário, Destaque nas buscas |

On submit:
1. Call Firebase Auth `createUserWithEmailAndPassword`
2. Call a Firebase Cloud Function API (`/api/createSubscription`) passing JWT token + profile data + plan
3. Function saves profile to Firestore, creates Mercado Pago preapproval, returns payment URL
4. Show success dialog: "Cadastro iniciado! Redirecionando para o Mercado Pago..."
5. Redirect to payment URL

If email already exists (`auth/email-already-in-use`), show toast and redirect to `/login`.

## 4. Firebase Setup

**File:** `src/lib/firebase.ts`

Add `getAuth` and `getFirestore` exports. Firestore is accessed only via Cloud Functions API (not directly from client).

## 5. Firebase Cloud Functions (scaffolding + instructions)

**Files to create:** `functions/src/index.ts`, `functions/package.json`, `functions/tsconfig.json`

Three functions:

### `createSubscription` (HTTPS callable)
- Validates Firebase Auth JWT token from `Authorization: Bearer <token>`
- Extracts `uid` from token
- Saves professional profile to Firestore `professionals/{uid}`: name, email, whatsapp, profession, plan, subscriptionStatus: 'pending', createdAt
- Calls Mercado Pago Preapproval API to create recurring subscription
- Returns Mercado Pago `init_point` URL

### `mercadoPagoWebhook` (HTTPS endpoint)
- Validates webhook signature
- On successful payment: updates `professionals/{uid}.subscriptionStatus = 'active'`, sets `paidUntil` date
- Stores payment history in `professionals/{uid}/payments` subcollection

### `getProfile` (HTTPS callable)
- Validates JWT, returns profile data from Firestore
- Used by Dashboard page

### `updateProfile` (HTTPS callable)
- Validates JWT, updates profile fields in Firestore

**Credentials:** Mercado Pago access token stored as Firebase environment config:
```bash
firebase functions:config:set mercadopago.access_token="YOUR_ACCESS_TOKEN"
```

Instructions file will detail exactly where to get credentials and how to deploy.

## 6. Success Dialog Component

**File:** `src/components/RegistrationSuccessDialog.tsx`

Modal showing "Cadastro iniciado com sucesso!" with countdown redirect to Mercado Pago URL.

## 7. Login Page

**File:** `src/pages/Login.tsx`

- Email/password login form using Firebase Auth `signInWithEmailAndPassword`
- On success, redirect to `/dashboard`
- Link back to home page

## 8. Dashboard Page

**File:** `src/pages/Dashboard.tsx`

- Protected route (redirects to `/login` if not authenticated)
- Fetches profile via Cloud Function API (JWT validated)
- Sections: Edit profile (photo, social links, about), subscription history, make new payment button
- All reads/writes go through Cloud Functions with JWT -- no direct Firestore access

## 9. Auth Context + Protected Route

**Files:** `src/contexts/AuthContext.tsx`, `src/components/ProtectedRoute.tsx`

- AuthContext wraps app with `onAuthStateChanged` listener
- ProtectedRoute checks auth state, redirects to `/login`

## 10. Routes Update

**File:** `src/App.tsx`

Add `/login` and `/dashboard` routes wrapped in AuthContext.

---

## Technical Details

### Mercado Pago Recurring (Preapproval API)
- `POST https://api.mercadopago.com/preapproval`
- Body: `reason`, `auto_recurring` (frequency: 1 month, transaction_amount), `payer_email`, `back_url`
- User subscribes with credit card only
- Cancellation: manual (contact support)

### Security Model
- Client gets Firebase Auth JWT after login/signup
- All API calls include `Authorization: Bearer <jwt>`
- Cloud Functions validate JWT via `admin.auth().verifyIdToken(token)` to get `uid`
- No direct Firestore access from client

### File Changes Summary

| Action | File |
|--------|------|
| Edit | `src/lib/firebase.ts` |
| Edit | `src/components/HeroSection.tsx` |
| Edit | `src/components/ProfessionalSection.tsx` |
| Edit | `src/components/AboutSection.tsx` |
| Edit | `src/components/HowItWorksSection.tsx` |
| Edit | `src/components/TestimonialsSection.tsx` |
| Edit | `src/components/CTASection.tsx` |
| Edit | `src/components/Footer.tsx` |
| Edit | `src/index.css` |
| Edit | `src/App.tsx` |
| Create | `src/pages/Login.tsx` |
| Create | `src/pages/Dashboard.tsx` |
| Create | `src/contexts/AuthContext.tsx` |
| Create | `src/components/ProtectedRoute.tsx` |
| Create | `src/components/RegistrationSuccessDialog.tsx` |
| Create | `functions/src/index.ts` |
| Create | `functions/package.json` |
| Create | `functions/tsconfig.json` |
| Create | `FIREBASE_FUNCTIONS_SETUP.md` (deployment instructions) |

