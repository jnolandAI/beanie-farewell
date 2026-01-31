# Bean Bye

A mobile app for valuing Beanie Babies using AI-powered image recognition.

## Overview

Bean Bye is an iOS application that helps users identify and value their Beanie Baby collection. Using camera integration and Claude AI, the app provides accurate valuations based on photos.

## Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **AI**: Anthropic Claude API
- **State Management**: Zustand
- **Camera**: expo-camera, expo-image-picker
- **Secure Storage**: expo-secure-store

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- iOS device or simulator
- Anthropic API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Anthropic API key to `.env`

### Running the App

```bash
npm run ios
```

## Project Structure

```
/app          - Screens and navigation
/components   - Reusable UI components
/lib          - API clients and utilities
/data         - Beanie Baby database
/types        - TypeScript type definitions
/assets       - Images and fonts
```

## Features (Coming Soon)

- Camera integration for Beanie Baby photos
- AI-powered identification
- Real-time valuation
- Collection tracking

## License

Private project
