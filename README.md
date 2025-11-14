# Photobooth App - For One Piece Fans Like Me

A modern, interactive photobooth application built with Next.js that allows users to capture photos, add stickers, apply different head accesories, and create personalized photo posters.

## Features

-  **Live Camera Feed** - Real-time camera preview with countdown timer
- **Capture Multiple Photos** - Take up to 4 photos in sequence
- **Photo Editing** - Add stickers, text, and apply filters to your photos
- **Custom Frames** - Choose from various decorative frames
- **Personalization** - Add your name to create a custom poster
- **Download** - Save your edited photos and final poster

## 📸 Screenshots

![Photobooth App](./screenshots/image.png)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 How to Use

1. **Start Camera** - Click the camera button to enable your webcam
2. **Capture Photos** - Click the capture button to start a 3-second countdown, then strike a pose!
3. **Create Poster** - Enter your name to generate a personalized photo poster
4. **Download** - Save your edited photos or the final poster

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Fabric.js** - Canvas manipulation and image editing
- **Tailwind CSS** - Styling and responsive design
- **HTML5 Canvas** - Image processing and rendering

## 📁 Project Structure

```
photobooth_app/
├── app/
│   ├── page.tsx          # Main photobooth component
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── public/
│   ├── stickers/         # Sticker images
│   ├── frame/            # Frame overlays
│   ├── character/        # Character decorations
│   └── images/           # Background images
└── screenshots/          # App screenshots
```

## 🎨 Available Features

### Stickers
- 14 different sticker designs
- Drag and drop placement
- Resizable and rotatable

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
