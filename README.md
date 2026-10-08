# Remix of MindGuard AI

Project Title: MindGuard AI - Multi-modal Early Mental Health Risk Detection System.

Objective: Create a comprehensive, multi-page professional web application for a graduation project. The system uses AI to analyze text and images to detect early signs of depression and mental stress. The design must be modern, empathetic, and highly functional.

Design Language:

Theme: "Serene & Trustworthy" (Soft blues, teals, and clean whites).

UI Style: Modern Glassmorphism, Bento Grid layout for dashboard, and smooth transitions.

Accessibility: High contrast for readability and empathetic micro-copy.

Core Pages to Build:

Landing Page: A high-converting hero section, "How it Works" (explaining NLP & CV), "Why MindGuard?", and a footer.

Auth System: Professional Login and Signup pages integrated with Supabase.

User Dashboard: A summary view showing "Current Mental State," "Trend Over Time" (using charts), and "Recent Activity."

Analysis Center (The Core):

A multi-modal input area: A text area for "Social Media Style Posts" and a "Drag & Drop Image Upload" for visual mood analysis.

An "Analyze Now" button with a sophisticated AI-loading animation.

Results Page:

A "Risk Meter" (Low, Medium, High).

A section for "AI Insights" (NLP sentiment & CV visual patterns).

A placeholder for "SHAP Explanation" (Visualizing why the AI made this decision).

Analysis History: A searchable table/list of all past reports stored in Supabase.

Resources & Recommendations: A helpful page providing mental health tips, breathing exercises, and emergency contact links based on risk levels.

Technical Requirements:

Supabase Integration: Create tables for profiles (user data) and analyses (storing text, image_url, risk_level, and date).

API Integration Strategy: Create a dedicated service/function called fetchAIRisk. Leave the BASE_URL empty as a constant (e.g., const API_URL = "").

Logic: When the user clicks "Analyze", the app should first upload the image to Supabase Storage, then send the Text and Image URL to the API_URL.

Mock Mode: Until the API_URL is provided, implement a "Demo Mode" that simulates a 2-second AI processing time and returns a random result so the UI can be tested.

Tone of Voice: Professional, supportive, and clinical yet accessible.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4eaf8907-91eb-42f4-a39d-d3852ab92507).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
