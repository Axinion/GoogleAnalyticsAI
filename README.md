# Google Analytics Clone - Next.js Dashboard

A modern analytics dashboard built with Next.js, React, TypeScript, and Tailwind CSS.

## Project Structure

```
src/
├── app/                 # App Router pages and layouts
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # Reusable React components
├── lib/               # Utility functions and helpers
└── styles/            # Additional stylesheets

public/               # Static assets
```

## Technology Stack

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build

Create a production build:

```bash
npm run build
```

### Production

Start the production server:

```bash
npm start
```

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Configuration Files

- **tsconfig.json** - TypeScript configuration with path aliases (@/*)
- **tailwind.config.ts** - Tailwind CSS configuration
- **next.config.ts** - Next.js configuration
- **postcss.config.mjs** - PostCSS configuration
- **.eslintrc.json** - ESLint configuration

## Development Workflow

1. Create pages in `src/app/`
2. Build reusable components in `src/components/`
3. Add utilities to `src/lib/`
4. Use Tailwind CSS for styling
5. Run linting to ensure code quality

## Path Aliases

The project is configured to use path aliases for cleaner imports:

```typescript
// Instead of:
import { helper } from '../../../lib/helpers'

// Use:
import { helper } from '@/lib/helpers'
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## License

This project is open source and available under the MIT License.
