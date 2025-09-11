# Launching Mr.FLEN Music

This guide covers how to run the app on both desktop web browsers and as a native mobile application.

## Desktop (Progressive Web App)
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd mr-flen-music
   ```
2. **Set up environment variables**
   - Copy `.env.example` to `.env` and supply your OAuth client IDs.
3. **Launch the PWA**
   - Open `public/index.html` in any modern browser, or serve the `public/` directory with a static HTTP server.
4. *(Optional)* **Install as an app**
   - In Chrome or Edge, use the browser menu to add the site to your desktop for an app-like experience.

## Mobile (Expo)
1. **Navigate to the mobile project**
   ```bash
   cd mobile
   ```
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Start the development server**
   ```bash
   pnpm start
   ```
4. **Run on a device or emulator**
   - Use the Expo Go app to scan the QR code, or press the on-screen instructions to launch Android/iOS simulators.

## Testing
To verify the project, run unit tests from the repository root:
```bash
pnpm test
```
