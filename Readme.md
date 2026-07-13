# RS React Final Project: Swagger-Editor-App

**Swagger-Editor-App** is a powerful, full-featured tool that combines the capabilities of a visual OpenAPI/Swagger specification editor and a flexible REST client within a single application. Designed for developers and QA engineers, it enables users to design, validate, and instantly test APIs without running into CORS issues, thanks to server-side execution (SSR/Proxy). The application features an authentication system, server-side request history tracking with detailed analytics, internationalization (i18n) support, and a responsive interface.

## 🦄 Team - She-Devs

| Role                   | Name      | GitHub                               |
| ---------------------- | --------- | -------------------------------------|
| **Mentor**             | Diana     | (https://github.com/bt-diana)        |
| **Mentor**             | Margarita | (https://github.com/Margaryta-Maletz)|
| **Developer (TL)**     | Margarita | (https://github.com/solarsungai)     |
| **Developer**          | Marta     | (https://github.com/27moon)          |
| **Developer**          | Vika      | (https://github.com/oneilcode)       |

## ⚒️ Tech Stack

- **Frontend** | React, TypeScript, Next.js
- **Design System** | Mantine
- **Routing** |  Next.js App Router
- **Forms** | React Hook Form
- **Validation** | Zod
- **State Management** | Zustand
- **Database & Auth** | Supabase
- **API Parsing** | Swagger Parser, OpenAPI Types
- **Build Tool** | Next.js (Turbopack for dev)
- **Code Quality** | ESLint, Husky
- **Testing** | Vitest, React Testing Library
- **CI/CD** | GitHub Actions (Dev → Staging, Main → Production)

## 📂 Project Structure

```
src/
├── app/
│   ├── api/                                 # API routes
│   │
│   ├── [locale]/                            # Internationalized routes
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── history/
│   │   │   └── page.tsx
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   ├── sign-up/
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   ├── layout.module.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── favicon.ico
│   ├── globals.css
│   ├── global-error.tsx
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── theme.ts
│
├── components/
│   ├── ui/                                   # Reusable UI components
│   │   └── Button/
│   │       ├── Button.module.css
│   │       ├── Button.test.tsx
│   │       └── Button.tsx
│   │
│   ├── layouts/                              # Layout components
│   │   ├── Footer/
│   │   └── Header/
│   │
│   └── features/                             # Feature-based components
│
├── i18n/                                     # Internationalization
│   ├── navigation.ts
│   ├── request.ts
│   └── routing.ts
│
├── lib/                                      # Shared libraries
│
├── locales/                                  # Translation files
│   ├── en.json
│   └── ru.json
│
├── store/                                    # State management
│
├── utils/                                    # Utilities
│
├── constants/
│   └── index.ts                              # Single entry point
│
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md

public/                                       # Static assets
```

#### ✅ Deploy - [Swagger-Editor-App](https://swagger-editor-app.netlify.app/) 
#### 📺 Video-presentation - [Swagger-Editor-App](https://youtu.be/E1m8sfXt1iY) 


### 📈 Test coverage

![Test all](/public/test-all.JPG)