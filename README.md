# 🧠 NeuralSign

> **Neural Networks Teaching Sign Language**

An AI-powered interactive sign language learning platform that combines 3D hand models with real-time AI validation to make learning sign language accessible, engaging, and effective.

---

## 🎯 About

NeuralSign is an innovative web application designed to teach sign language through interactive lessons, real-time practice with AI feedback, and gamified progress tracking. Built for **KitaHack 2026**, this project aligns with **SDG 4: Quality Education** by making sign language education accessible to everyone.

### Key Features

- 🖐️ **Interactive 3D Hand Models** - Learn signs with detailed, animated 3D visualizations
- 🤖 **AI-Powered Validation** - Real-time hand gesture recognition using MediaPipe and Gemini AI
- 📝 **Sentence Builder** - Combine learned signs to form complete sentences
- 📊 **Progress Tracking** - Track your learning journey with streaks and achievements
- 🎮 **Gamified Learning** - Earn points and unlock levels as you master new signs

---

## 🏆 KitaHack 2026

This project was built for **KitaHack 2026**, a hackathon focused on creating impactful solutions using Google technologies.

### SDG Alignment

- **SDG 10: Reduced Inequalities** - NeuralSign directly enables greater participation in everyday society by breaking down communication barriers for the deaf and hard-of-hearing community.
- **SDG 4: Quality Education** - NeuralSign promotes inclusive and equitable quality education by making sign language learning accessible to everyone, breaking down communication barriers for the deaf and hard-of-hearing community.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** - Modern, fast development experience
- **Three.js** + **React Three Fiber** - 3D graphics and hand model rendering
- **Tailwind CSS** - Utility-first styling with custom Neural Network Blue theme
- **Framer Motion** - Smooth animations and transitions
- **Zustand** - Lightweight state management

### Backend & AI
- **Firebase** - Authentication, Firestore database, and hosting
- **Gemini AI** - Intelligent feedback and sign language assistance
- **MediaPipe** - Real-time hand tracking and gesture recognition

### Google Technologies Used
- ✅ Firebase Authentication
- ✅ Cloud Firestore
- ✅ Firebase Hosting
- ✅ Gemini AI API
- ✅ MediaPipe Hands

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project (for backend features)
- Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/neuralsign.git
   cd neuralsign
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your Firebase and Gemini API credentials.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

---

## � User Guide

Welcome to NeuralSign! Here's how you can make the most out of your sign language learning journey:

### 1. Learning New Signs
- **Explore Lessons:** Navigate to the **Learn** section to select a topic.
- **Interactive 3D Models:** Use the 3D hand models to view signs from any angle—rotate and zoom to understand the exact hand shape.
- **Video Demonstrations:** Switch to the video tab (where available) to see continuous, real-life examples of how signs are performed in motion.

### 2. Practice & Real-Time Validation
- **Webcam Tracking:** Head over to the **Practice** area and allow webcam access. All video processing happens locally on your device for complete privacy.
- **Real-Time Feedback:** Perform the signs you've learned. The AI engine will map your hand landmarks in real-time and validate if your gesture matches the target sign.

### 3. Sentence Builder & AI Tutor
- **Combine Signs:** Use the Sentence Builder to practice chaining multiple signs together.
- **Ask Gemini:** Engage with the conversational AI tutor for personalized guidance, technique corrections, and natural language feedback.

### 4. Track Your Progress
- **Gamified Learning:** Earn Experience Points (XP) for completing lessons and successful practice sessions.
- **Streaks & Achievements:** Maintain your daily learning streak and unlock achievements as you expand your sign language vocabulary.

---

## �📁 Project Structure

```
neuralsign/
├── public/
│   ├── models/          # 3D hand models
│   └── assets/          # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── layout/      # Navbar, Footer, PageContainer
│   │   ├── common/      # Buttons, Modals, Loading
│   │   ├── learning/    # Learning-specific components
│   │   ├── practice/    # Practice mode components
│   │   ├── 3d/          # Three.js components
│   │   └── camera/      # Camera/MediaPipe components
│   ├── pages/           # Page components
│   ├── services/        # Firebase, API services
│   ├── store/           # Zustand stores
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utilities and helpers
│   └── styles/          # Global styles and theme
└── ...config files
```

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#6366F1` | Main brand color (Indigo) |
| Secondary | `#8B5CF6` | Accents (Purple) |
| Accent | `#EC4899` | Highlights (Hot Pink) |
| Success | `#10B981` | Success states (Emerald) |
| Warning | `#F59E0B` | Warnings (Amber) |
| Error | `#EF4444` | Errors (Red) |
| Background | `#0F172A` | Dark background (Slate 900) |
| Surface | `#1E293B` | Card backgrounds (Slate 800) |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 👥 Team

- **Bryan Low Zhern Yang** - Team Leader
- **Evin Kor Kar Hei** - Team Member
- **Ng Xue Qing** - Team Member
- **Gooi Hooi Qi** - Team Member

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for KitaHack 2026</p>
  <p>Powered by Google Technologies</p>
</div>
