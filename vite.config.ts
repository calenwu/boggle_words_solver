import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
// Automatically set base path based on repository name for GitHub Pages
// If GITHUB_REPOSITORY is set (in CI), use it; otherwise default to repo name
const getBasePath = () => {
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    // If repo is username.github.io, deploy to root
    if (repoName.includes('.github.io')) {
      return '/';
    }
    // Otherwise deploy to subdirectory
    return `/${repoName}/`;
  }
  // Default for local development or manual override
  return '/boggle-party/'; // Change this to '/' for root deployment
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: getBasePath(),
});
