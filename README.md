# 🧠 LoopReview AI (or your chosen name)

> AI reviewing AI-generated code — finally.

LoopReview is an AI-powered code analysis platform that reviews GitHub repositories for **security vulnerabilities** and **scalability issues**, delivering **line-level insights**, **severity markers**, and an **overall AI audit score**.

Built with a strong focus on **clarity and accessibility**, it makes code reviews understandable even for non-technical users.

---

## ✨ Why this exists

With the rise of vibe coding and AI-generated code, a massive amount of **unchecked, low-quality, and potentially unsafe code** is being shipped daily.

This project explores a simple but powerful idea:

> *What if AI reviewed AI-generated code — and made it understandable for everyone?*

---

## 🔍 What it does

- 📂 Import any GitHub repository (specific branches supported)
- 🧠 Analyze code using structured AI context
- ⚠️ Detect:
  - Security vulnerabilities
  - Scalability bottlenecks
- 📍 Highlight exact lines where issues occur
- 🚨 Assign severity levels to each issue
- 📊 Generate an overall AI Review Score

---
## 🔑 Environment Setup

Create a `.env` file:

GEMINI_API_KEY=your_key_here

## 🧩 Key Features

### 🧠 AI-Powered Code Review
Custom-trained prompting system that helps AI deeply understand code context and identify real issues (not generic fluff).

### 📍 Line-Level Insights
Pinpoints exactly where the issue exists — no vague feedback.

### 🚨 Severity Marking System
Issues are categorized based on impact, helping prioritize fixes.

### 📊 AI Review Score
A quick summary metric to evaluate overall code health.

### 🎯 Built for Non-Tech Users
Clean UI and simplified explanations reduce technical overwhelm.

---

## 🛠 Tech Stack

- **Frontend:** JavaScript  
- **Backend / Logic:** Python  
- **AI Integration:** Gemini API (configurable for others)

---

## ⚙️ How it works

1. User connects their AI API key
2. Selects a GitHub repository + branch
3. Code is parsed and structured into AI-friendly context
4. AI analyzes for:
   - Security flaws
   - Scalability issues
5. Results are returned with:
   - Line references
   - Severity levels
   - Final score

---

## 🧪 Current Status

🚧 This project is still in progress.

Expect:
- Improvements in analysis accuracy
- Better scoring models
- Expanded AI compatibility

---

## 🤝 Contributing

This project is open to feedback, ideas, and contributions.

If you have suggestions on:
- Improving AI prompts
- Enhancing analysis accuracy
- UI/UX improvements
- Performance optimizations

Feel free to open an issue or PR.

---

## 💡 Inspiration

Inspired by tools like CodeRabbit and TestSprite — but designed to be:
- Simpler
- More accessible
- Less intimidating for non-developers

---

## 📌 Future Roadmap

- [ ] Multi-model AI comparison (Gemini vs others)
- [ ] Real-time code review
- [ ] Plugin for GitHub / VS Code
- [ ] Improved scoring transparency
- [ ] Team collaboration features

---

## 🧑‍💻 Author

Built as an experimental side project exploring the intersection of:
AI × Code Quality × Accessibility

---

## ⭐ If you like this project

Give it a star — it helps more people discover it!
