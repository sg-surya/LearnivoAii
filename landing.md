# Prompt for Sahayak AI Landing Page

**Objective:** Create a modern, professional, and inspiring landing page for "Sahayak AI," an AI-powered educational platform for Indian teachers and students.

---

### **1. Overall Theme & Tone:**

*   **Theme:** "Empowering India's Educators." The design should be clean, futuristic, and trustworthy.
*   **Color Palette:**
    *   **Primary:** A deep, inspiring purple (e.g., `hsl(265, 89%, 65%)`).
    *   **Background:** A very light grey or off-white for the light theme (`hsl(0, 0%, 98%)`) and a dark charcoal for the dark theme (`hsl(240, 6%, 10%)`).
    *   **Accent:** Lighter shades of the primary purple for gradients, highlights, and hover effects.
*   **Typography:**
    *   **Headlines:** Use a modern, slightly technical sans-serif font like **"Space Grotesk"**.
    *   **Body Text:** Use a clean, highly readable sans-serif font like **"Inter"**.
*   **Tone:** Professional, empathetic, inspiring, and clear. It should resonate with the challenges faced by educators and offer a hopeful solution.

---

### **2. Required Sections & Content:**

**A. Header:**
*   **Logo:** "Sahayak AI" with a simple book/brain icon.
*   **Navigation:** "Features", "Pricing", "About Us".
*   **CTAs:** "Login" (ghost button) and "Get Started" (filled primary button). Should show a "Dashboard" link if the user is logged in.

**B. Hero Section:**
*   **Background:** Use a subtle dot pattern or a faint radial gradient emanating from the primary color.
*   **Headline:** `Unlock Your Potential. Transform Education.` with the second line in the primary color.
*   **Sub-headline:** "A powerful AI-driven platform for Indian educators and students. Automate lesson planning, master complex topics, and manage learning tasks securely and efficiently."
*   **Primary CTAs:**
    *   A filled button: "Get Started" (navigates to signup).
    *   An outline button: "Learn More" (scrolls to features).
*   **Social Proof (Below CTAs):**
    *   A small group of user avatars (placeholders).
    *   Text: "Trusted by over 5,000 educators" and "Saving an average of 10+ hours per week."
*   **Visual:** A stylized, abstract representation or wireframe of the app's dashboard to the right of the text. It should look clean and modern.

**C. Features Section (`#features`):**
*   **Headline:** "Empowering Education, One Tool at a Time."
*   **Sub-headline:** "Sahayak AI provides a suite of intelligent tools designed to tackle daily challenges, freeing up teachers to teach and students to learn."
*   **Layout:** A 3-column grid of "Spotlight" cards. Each card should have a subtle hover effect (like a glowing border or background light).
*   **Feature Cards (6 total):**
    1.  **AI Lesson Planner** (Icon: DraftingCompass)
    2.  **Visual Aids Generator** (Icon: Layers)
    3.  **Hyper-Local Content** (Icon: Map)
    4.  **Quiz & Rubric Generation** (Icon: HelpCircle)
    5.  **Parent Communication** (Icon: Mail)
    6.  **Paper Digitizer** (Icon: ScanLine)
    *Each card must contain the icon, title, and a one-sentence description.*

**D. Pricing Section (`#pricing`):**
*   **Headline:** "A Plan for Every Classroom."
*   **Sub-headline:** "Choose the plan that fits your needs. Start for free and upgrade anytime."
*   **Layout:** A 3-tier pricing table for "Basic" (Free), "Pro" (e.g., ₹499/mo), and "Institute" (Custom).
*   **Highlight:** The "Pro" plan should be visually highlighted as the "Most Popular" with a badge and a colored border.
*   **Content:** Each plan should clearly list its key features (e.g., number of AI generations, access to premium tools, storage limits, support level).

**E. Testimonials Section:**
*   **Headline:** "Loved by Educators Across India."
*   **Layout:** A 3-column grid of testimonial cards.
*   **Content:** Each card should feature:
    *   A 5-star rating.
    *   A short, impactful quote from a teacher.
    *   An avatar, the teacher's name, and their school.

**F. Final CTA / Newsletter Section:**
*   **Headline:** "Join our newsletter to stay updated."
*   **Layout:** A simple, centered section with an input field for email and a "Subscribe" button.

**G. Footer:**
*   **Layout:** Multi-column layout.
*   **Content:**
    *   Column 1: Logo and short mission statement. Social media icons.
    *   Column 2 (Support): About Us, Contact, FAQ.
    *   Column 3 (Policy): Terms of Service, Privacy Policy.
    *   Column 4 (Contact): Phone, Location, Email icons with details.
*   **Bottom Bar:** "© [Current Year] Sahayak AI. All rights reserved."

---

### **3. Components & Styling:**

*   Use `ShadCN/UI` components as the base (Button, Card, Avatar, Input, etc.).
*   Create a custom "SpotlightCard" component that reveals a radial gradient background on mouse hover for a modern, interactive feel.
*   The page must be fully responsive and look great on all devices.
*   Ensure all images have `data-ai-hint` attributes for future replacement.
