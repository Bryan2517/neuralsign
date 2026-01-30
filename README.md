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

## 📁 Project Structure

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

## 🏆 KitaHack 2026

This project was built for **KitaHack 2026**, a hackathon focused on creating impactful solutions using Google technologies.

### SDG Alignment

**SDG 4: Quality Education** - NeuralSign promotes inclusive and equitable quality education by making sign language learning accessible to everyone, breaking down communication barriers for the deaf and hard-of-hearing community.

---

## 👥 Team

- **Team Member 1** - Role
- **Team Member 2** - Role  
- **Team Member 3** - Role

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for KitaHack 2026</p>
  <p>Powered by Google Technologies</p>
</div>
