# AI Podcast Generator

A modern web application that generates professional podcasts using AI. Create engaging content in minutes with a beautiful dark-themed interface.

## Features

- 🎙️ Generate professional podcasts with AI
- 🎨 Modern dark theme interface
- 📊 Real-time progress tracking with beautiful animations
- 🎛️ Customizable podcast settings:
  - Multiple speaker options
  - Various voice selections
  - Duration control
  - Language selection
- 🔊 High-quality audio output
- 💾 Easy download functionality
- 🎯 User-friendly interface

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- FAL.ai API for text-to-speech
- Gemini API for content generation

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ai-podcast-generator.git
cd ai-podcast-generator
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
GEMINI_API_KEY=your_openai_api_key
FAL_KEY=your_fal_ai_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter your podcast topic and optional subtopic
2. Choose the number of speakers and their voices
3. Select the desired duration and language
4. Click "Generate Professional Podcast"
5. Wait for the generation process to complete
6. Download or play your generated podcast

## Features in Detail

### Dark Theme

The application features a sophisticated dark theme with:

- Dark backgrounds with proper contrast
- Gradient accents
- Animated elements
- Modern UI components

### Progress Tracking

- Real-time progress bar with percentage
- Animated loading indicators
- Smooth transitions
- Visual feedback during generation

### Audio Generation

- High-quality voice synthesis
- Multiple speaker support
- Various voice options
- Downloadable audio files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- GEMINI for the GEMINI API
- FAL.ai for the text-to-speech capabilities
- Next.js team for the amazing framework
- Tailwind CSS for the styling system

<p align="center">
  <a href="https://nextjs-fastapi-starter.vercel.app/">
    <img src="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png" height="96">
    <h3 align="center">Next.js FastAPI Starter</h3>
  </a>
</p>

<p align="center">Simple Next.j 14 boilerplate that uses <a href="https://fastapi.tiangolo.com/">FastAPI</a> as the API backend.</p>

<br/>

## Introduction

This is a hybrid Next.js 14 + Python template. One great use case of this is to write Next.js apps that use Python AI libraries on the backend, while still having the benefits of Next.js Route Handlers and Server Side Rendering.

## How It Works

The Python/FastAPI server is mapped into to Next.js app under `/api/`.

This is implemented using [`next.config.js` rewrites](https://github.com/digitros/nextjs-fastapi/blob/main/next.config.js) to map any request to `/api/py/:path*` to the FastAPI API, which is hosted in the `/api` folder.

Also, the app/api routes are available on the same domain, so you can use NextJs Route Handlers and make requests to `/api/...`.

On localhost, the rewrite will be made to the `127.0.0.1:8000` port, which is where the FastAPI server is running.

In production, the FastAPI server is hosted as [Python serverless functions](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python) on Vercel.

## Demo

https://nextjs-fastapi-starter.vercel.app/

## Deploy Your Own

You can clone & deploy it to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdigitros%2Fnextjs-fastapi%2Ftree%2Fmain)

## Developing Locally

You can clone & create this repo with the following command

```bash
npx create-next-app nextjs-fastapi --example "https://github.com/digitros/nextjs-fastapi"
```

## Getting Started

First, create and activate a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Then, install the dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Then, run the development server(python dependencies will be installed automatically here):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The FastApi server will be running on [http://127.0.0.1:8000](http://127.0.0.1:8000) – feel free to change the port in `package.json` (you'll also need to update it in `next.config.js`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [FastAPI Documentation](https://fastapi.tiangolo.com/) - learn about FastAPI features and API.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
