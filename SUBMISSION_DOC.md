# CivicMind AI

## 🚀 Elevator Pitch
CivicMind AI is an intelligent, gamified civic engagement platform that empowers citizens to report, track, and resolve local infrastructure and community issues. By leveraging AI for voice-to-text reporting, automated issue verification, and predictive analytics, CivicMind AI bridges the gap between citizens and local authorities to build smarter, safer, and more responsive cities.

---

## 🛑 The Problem
In modern cities, reporting civic issues (like potholes, water leaks, or broken streetlights) is often a frustrating, bureaucratic, and opaque process. 
- **High Friction:** Reporting systems are outdated, requiring users to fill out complex forms.
- **Duplicate Reports:** Authorities are overwhelmed by hundreds of duplicate reports for the same issue.
- **Lack of Transparency:** Citizens rarely get updates on the status of their reports.
- **Low Engagement:** There is no incentive for citizens to actively participate in community upkeep.

---

## 💡 The Solution
CivicMind AI reimagines civic engagement by combining **Artificial Intelligence, Real-time Mapping, and Social Gamification**. 
Users can report issues seamlessly using voice or images, while the AI automatically categorizes, verifies, and deduplicates reports. A transparent social feed and gamified leaderboard incentivize continuous community participation.

---

## ✨ Key Features

### 1. 🎙️ AI-Powered Voice Reporting
Reporting an issue is as easy as sending a voice note. CivicMind AI uses **Google Gemini AI** to transcribe voice reports, extract key details (location, severity, category), and automatically generate a structured issue report without manual typing.

### 2. 🗺️ Real-Time Civic Map
A dynamic, interactive map that visualizes all active issues in the city. Users can explore problems in their neighborhood, view heatmaps of recurring issues, and track resolutions geographically.

### 3. 🤖 Smart Deduplication & Verification
To prevent authorities from being spammed with identical reports, our AI automatically detects similar or duplicate issues in the same vicinity and groups them together. It also scores the validity of reports based on uploaded image evidence.

### 4. 📈 Predictive Analytics & Dashboards
Authorities and power users have access to an analytics dashboard that visualizes issue trends over time. The platform uses historical data to **predict future infrastructure failures** (e.g., predicting waterlogging in specific wards during monsoon season).

### 5. 🎮 Gamification & Social Feed
Civic engagement is turned into a community effort. Users earn points, badges, and climb the **Leaderboard** for verifying issues, submitting accurate reports, and actively participating. The **Social Feed** allows citizens to upvote, comment on, and share updates on community problems.

---

## 🛠️ Technology Stack

We built CivicMind AI using a modern, scalable, and highly responsive technology stack, prioritizing performance and user experience.

- **Frontend Framework:** Next.js 15 (App Router) & React 19
- **Styling & UI:** Tailwind CSS, Shadcn UI, Framer Motion (for fluid micro-animations)
- **Backend & Database:** Firebase (Firestore, Firebase Auth, Cloud Storage)
- **Artificial Intelligence:** Google Gemini API (`@google/generative-ai`)
- **Mapping:** React Leaflet / Custom Map Integrations
- **Deployment:** Vercel (Frontend & Serverless API Routes)

---

## 🏗️ System Architecture

1. **Client Layer:** A mobile-first, dark-mode-optimized Next.js web application ensuring accessibility and a premium UX.
2. **Serverless API Layer:** Next.js Route Handlers securely process AI prompts, handle deduplication logic, and interact with the Gemini SDK.
3. **Data Layer:** Firebase Firestore manages real-time syncing of issues, social comments, upvotes, and user profiles. Firebase Storage handles secure image uploads.
4. **AI Layer:** Gemini processes unstructured data (voice transcripts, images, textual descriptions) and returns structured JSON used for analytics and categorization.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Firebase Project configured with Firestore and Storage
- Google Gemini API Key

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Manu-ok/civicmind.git
   cd civicmind-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add your keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🎯 Impact & Future Scope
CivicMind AI transforms passive citizens into active community stakeholders. Future plans include direct API integrations with municipal ticketing systems (like Open311), multi-language voice support, and SMS-based offline reporting to ensure accessibility for all demographics.
