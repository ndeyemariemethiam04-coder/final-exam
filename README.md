# BrainBlast - Web Development Final Project

BrainBlast is a multi-page quiz platform built to test knowledge in HTML, CSS, JavaScript, Git/GitHub, and SQL.

## 🚀 Live Demo
**[Insert Your Vercel URL Here]**

## 📋 Features

*   **User Authentication:** Secure Sign Up and Login system powered by Supabase.
*   **Personalized Dashboard:** Displays the user's name and tracks personal high scores.
*   **Dynamic Quiz Engine:** Questions are fetched dynamically from a PostgreSQL database based on the selected category.
*   **Real-time Feedback:** Instant visual cues (Green/Red) for correct and incorrect answers.
*   **Responsive Design:** "Mobile-First" CSS ensures the app works smoothly on phones, tablets, and desktops.
*   **Persistent Scoring:** Scores are saved to the cloud and retrieved upon next login.

## 🛠️ Tech Stack

*   **Frontend:** HTML5, CSS3 (Custom Properties & Flexbox/Grid), Vanilla JavaScript (ES6+).
*   **Backend:** Supabase (PostgreSQL Database).
*   **Authentication:** Supabase Auth.
*   **Deployment:** Vercel (CI/CD connected to GitHub).

## 📂 Project Structure

*   `index.html`: Landing page.
*   `login.html` / `signup.html`: Authentication pages.
*   `dashboard.html`: Protected user area for selecting topics.
*   `quiz.html`: The core game interface.
*   `script.js`: Handles routing, API calls, and game logic.
*   `style.css`: Global responsive styling with variable-based theming.

## ⚙️ Setup & Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/YOUR_USERNAME/webdev1-quiz-platform.git
    ```
2.  Open `index.html` in your browser (or use Live Server).
3.  **Note:** This project relies on a `config.js` file for Supabase keys (included in the repo for academic grading purposes).

## 🛡️ Security Note

Database access is secured using PostgreSQL **Row Level Security (RLS)** policies:
*   **Public Read:** Access for Quiz Questions.
*   **Authenticated Read/Write:** Access for User Scores.

---
*Created for Web Development I Final Project - 2025*
