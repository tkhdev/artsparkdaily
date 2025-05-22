
# 🎨 Art Spark Daily

**Art Spark Daily** is a web application that delivers a fresh AI-generated prompt each day and empowers users to create, generate, and share AI-powered art. It’s designed to spark creativity, build consistent artistic habits, and foster a vibrant community of artists and enthusiasts.

---

## 📚 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Instructions](#setup-instructions)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🚀 Features

- 🔐 **Google Authentication** via Firebase
- 🧑‍🎨 **User Profiles** with editable bio, display name, and custom avatar
- 📆 **Daily Prompts** generated and updated at 00:00 UTC
- 🤖 **AI Art Generation** powered by the Pollinations API
- 🖼️ **Art Submission Gallery** for each prompt with likes and comments
- 🏆 **Leaderboard & Achievements** based on activity and engagement
- 📲 **Social Sharing** with pre-filled hashtags and image preview
- 🔔 **Real-time Notifications** for new prompts, comments, likes, and badges
- 🎯 **Gamification** with badges and daily streaks

---

## 🛠️ Tech Stack

- **Frontend:** React + Vite
- **Authentication:** Firebase Authentication (Google Sign-In)
- **Database:** Firebase Firestore
- **Backend Logic:** Firebase Cloud Functions
- **Storage:** Firebase Storage
- **AI Integration:** [Pollinations API](https://www.pollinations.ai)

---

## ⚙️ Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/art-spark-daily.git
   cd art-spark-daily
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (see [Environment Variables](#environment-variables) section)

4. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 🧪 Available Scripts

| Script             | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start local dev server                   |
| `npm run build`    | Build the project for production         |
| `npm run preview`  | Preview the production build locally     |
| `npm run lint`     | Lint code with ESLint                    |
| `npm run format`   | Format code with Prettier                |

---

## 🔐 Environment Variables

Create a `.env` file in the root directory and include the following variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_POLLINATIONS_API_URL=https://your_pollinations_endpoint
```

---

## 🗂️ Project Structure

```
src/
│
├── assets/              # Static images and assets
├── components/          # Shared React components
├── context/             # Global state via Context + useReducer
├── hooks/               # Custom React hooks
├── pages/               # Route-based components
├── services/            # Firebase, API clients
├── utils/               # Utility functions
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

Made with 💡 and 🎨 by the Art Spark Daily team.
