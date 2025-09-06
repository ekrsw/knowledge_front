# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build for production**: `npm run build` (also uses Turbopack)
- **Start production server**: `npm start`
- **Run linting**: `npm run lint` (uses ESLint with Next.js TypeScript config)

## Project Architecture

This is a Next.js 15 application using the App Router with TypeScript and Tailwind CSS v4.

### Key Structure
- **App Router**: Uses `app/` directory structure (Next.js 13+ pattern)
- **TypeScript**: Strict mode enabled with modern ES2017+ target
- **Styling**: Tailwind CSS v4 with PostCSS, includes Geist fonts (sans and mono)
- **Path Aliases**: `@/*` maps to project root for clean imports

### Technology Stack
- Next.js 15.5.2 with React 19.1.0
- TypeScript with strict configuration
- Tailwind CSS v4 (@tailwindcss/postcss)
- ESLint with Next.js TypeScript rules
- Turbopack for development and builds

### File Organization
- `app/layout.tsx`: Root layout with font configuration and metadata
- `app/page.tsx`: Home page component
- `app/globals.css`: Global Tailwind styles
- TypeScript path mapping configured for `@/*` imports

### Development Notes
- Uses Turbopack for faster development and build times
- Font optimization with next/font using Geist family
- Dark mode CSS variables configured in Tailwind
- ESLint ignores standard Next.js build directories