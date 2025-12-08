# ReachPay Frontend

The production-ready frontend for ReachPay, built with Next.js, Tailwind CSS, and Solana Wallet Adapter.

## Features

- **Sketchy UI**: Unique hand-drawn aesthetic using Tailwind CSS.
- **Solana Integration**: Full wallet connection (Phantom, Solflare) and Anchor program interaction.
- **Campaign Management**: Create campaigns and view real-time metrics.
- **Responsive Design**: Works seamlessly on desktop and mobile.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_SOLANA_NETWORK=testnet
   ```

3. **Update Program ID**
   Update the `PROGRAM_ID` in `src/hooks/useReachPay.ts` with your deployed program ID.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Project Structure

- `src/components`: UI components (Navbar, Hero, Forms, Dashboard).
- `src/context`: React context providers (Wallet).
- `src/hooks`: Custom hooks (useReachPayProgram).
- `src/lib`: Utilities and API clients.
- `src/types`: TypeScript definitions.

## Styling

Global styles and wallet adapter overrides are in `src/app/globals.css`. The design uses a "sketchy" theme with:
- `Patrick Hand` font for headings.
- `Inter` font for body text.
- Thick black borders and hard shadows.

## License

MIT
