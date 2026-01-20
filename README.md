# Pengory

## Project info

Pengory is a beautiful, minimal calendar dashboard to manage your tasks and schedule with ease.

## Local Setup

### Prerequisites

- **Node.js**: Version 18 or higher (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) to manage Node versions)
- **npm**: Comes with Node.js

### Installation Steps

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```sh
   cp .env.example .env
   ```
   
   Then edit `.env` and fill in the required values:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: Your Supabase anon/public key
   
   **Where to get these values:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to Settings → API
   - Copy the "Project URL" for `VITE_SUPABASE_URL`
   - Copy the "anon public" key for `VITE_SUPABASE_PUBLISHABLE_KEY`

4. **Start the development server**
   ```sh
   npm run dev
   ```
   
   The app will be available at **http://localhost:8080**

### Available Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## How can I edit this code?

You can edit this code using your preferred IDE or text editor.

**Use your preferred IDE**

Clone this repo and make changes locally. Push changes to update the repository.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

This project can be deployed to any static hosting service such as:
- Cloudflare Pages
- Vercel
- Netlify
- GitHub Pages

Simply connect your repository and configure the build command: `npm run build`
