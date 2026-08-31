# Contributing to Kanzan Learn Next.js

Thank you for your interest in contributing! This is primarily a personal learning repository, but suggestions, fixes, and improvements are always welcome.

---

## 📋 How to Contribute

### 1. Fork & Clone

```bash
# Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/Kanzan_Learn_NextJs.git
cd Kanzan_Learn_NextJs
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

### 4. Create a Feature Branch

```bash
# Use a descriptive branch name
git checkout -b feature/add-app-router-example
# or
git checkout -b fix/typo-in-data-fetching-notes
```

### 5. Make Your Changes

- Follow the existing code style and comment conventions
- Add comments explaining **what**, **why**, and **how** — this is a learning repo, so verbosity is appreciated
- Keep each commit focused on a single change

### 6. Check for Errors

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build (make sure it compiles)
npm run build
```

### 7. Commit & Push

```bash
git add .
git commit -m "feat: add App Router layout example with comments"
git push origin feature/add-app-router-example
```

### 8. Open a Pull Request

Go to GitHub and open a Pull Request against the `main` branch. Fill in the PR description:

---

## ✅ PR Checklist

- [ ] Code compiles without TypeScript errors (`npx tsc --noEmit`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code includes helpful inline comments
- [ ] PR title is clear and descriptive
- [ ] Changes are scoped — one topic per PR

---

## 💬 Style Guide

| Rule | Details |
|------|---------|
| Language | TypeScript (`.tsx` / `.ts`) |
| Comments | English, verbose — explain intent, not just what |
| Naming | camelCase for variables/functions, PascalCase for components |
| Formatting | Prettier-compatible (2 spaces, single quotes) |

---

## 🐛 Reporting Issues

Found a bug or a concept that's explained incorrectly? Open an [issue](https://github.com/kanzankazu/Kanzan_Learn_NextJs/issues) with:

1. A clear title
2. What you expected
3. What actually happened
4. Steps to reproduce (if applicable)

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](../LICENSE).

---

*Questions? Reach out at kanzankazu46@gmail.com*
