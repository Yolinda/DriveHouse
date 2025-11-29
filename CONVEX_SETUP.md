# Convex Setup Instructions

Follow these steps to set up the Convex backend for DriveHouse:

## 1. Initialize Convex Project

Run the following command in your terminal:

```bash
npx convex dev
```

This will:
1. Prompt you to create a Convex account (if you don't have one)
2. Create a new Convex project (or let you select an existing one)
3. Generate `convex/_generated/` directory with TypeScript types
4. Add `NEXT_PUBLIC_CONVEX_URL` to your `.env.local` file
5. Start watching for changes in the `convex/` directory

### First-time Setup

If this is your first time using Convex:

1. You'll be prompted to authenticate via browser
2. Choose "Create a new project"
3. Name it `drivehouse` (or your preferred name)
4. Select your preferred region (closest to your users)

### Using Existing Convex Account

If you already have a Convex account:

1. The CLI will list your existing projects
2. You can create a new project or select an existing one
3. Press Enter to confirm

## 2. Verify Environment Variables

After running `npx convex dev`, check that `.env.local` has been updated:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-123
```

**Note:** These values are auto-generated. Do NOT edit them manually.

## 3. Access Convex Dashboard

The terminal will show a URL like:

```
Dashboard: https://dashboard.convex.dev/t/your-team/your-project
```

Click this URL to open the Convex dashboard where you can:
- View the `users` table (will be empty initially)
- Test queries and mutations
- Monitor logs
- View schema

## 4. Verify Schema Deployment

In the Convex dashboard:

1. Go to the "Data" tab
2. You should see the `users` table
3. Click on it to see the schema fields:
   - `userId` (string, indexed)
   - `email` (optional string)
   - `displayName` (optional string)
   - `photoURL` (optional string)
   - `totalPoints` (number)
   - `premiumStatus` (boolean)
   - `createdAt` (number)
   - `lastLoginAt` (number)

## 5. Test the Setup

After both Firebase and Convex are configured:

1. Make sure `npx convex dev` is running in one terminal
2. In another terminal, start the Next.js dev server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)
4. The app should:
   - Show loading spinner briefly
   - Automatically sign in (anonymously via Firebase)
   - Sync user to Convex
   - Display main app with userId in sidebar

## 6. Verify User Creation

After the app loads:

1. Check browser console for:
   - ✅ `"✅ User authenticated: [firebase-uid]"`
   - ✅ `"✅ User synced to Convex: { userId: '...', isNew: true }"`

2. In Convex Dashboard:
   - Go to Data → users table
   - You should see a new user record
   - Click on it to see the full data
   - Verify `totalPoints: 0` and `premiumStatus: false`

## Troubleshooting

### "ConvexError: No deployment URL"

**Solution:**
- Make sure `npx convex dev` is running
- Check that `.env.local` has `NEXT_PUBLIC_CONVEX_URL`
- Restart Next.js dev server: Stop `npm run dev` and run it again

### "Module not found: Can't resolve 'convex/react'"

**Solution:**
```bash
npm install convex
```

### Schema changes not deploying

**Solution:**
- Make sure `npx convex dev` is running
- Check the terminal for schema errors
- Try stopping and restarting `npx convex dev`

### User record not being created

**Solution:**
1. Check browser console for errors
2. In Convex Dashboard → Logs, look for mutation errors
3. Verify Firebase auth is working (check for Firebase UID in console)

### "TypeError: Cannot read property 'mutate' of undefined"

**Solution:**
- Make sure ConvexProvider is wrapping your app in `layout.tsx`
- Verify `NEXT_PUBLIC_CONVEX_URL` is set correctly
- Try clearing Next.js cache: `rm -rf .next && npm run dev`

## Development Workflow

### Running Both Servers

You'll need TWO terminal windows:

**Terminal 1 - Convex Dev Server:**
```bash
npx convex dev
```
Keep this running to watch for backend changes

**Terminal 2 - Next.js Dev Server:**
```bash
npm run dev
```
Your app runs here

### Making Schema Changes

1. Edit `convex/schema.ts`
2. Save the file
3. Convex dev server automatically pushes changes
4. Check terminal for confirmation
5. Refresh your browser

### Adding New Functions

1. Create or edit files in `convex/` directory
2. Convex dev automatically deploys changes
3. New functions appear in `convex/_generated/api.ts`
4. Import and use in your React components:

```typescript
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

// In your component
const createUser = useMutation(api.users.createUser);
const user = useQuery(api.users.getUserByUserId, { userId: "..." });
```

## Next Steps

After Convex is set up:

1. ✅ Users table is ready
2. ✅ Authentication flow works end-to-end
3. 📋 Ready to add new features (notes, tasks, properties)
4. 📋 Ready to implement workspaces and sharing

See [AUTHENTICATION_IMPLEMENTATION_PLAN.md](./AUTHENTICATION_IMPLEMENTATION_PLAN.md) for the complete feature roadmap.

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex React Guide](https://docs.convex.dev/client/react)
- [Convex Schema Reference](https://docs.convex.dev/database/schemas)
- [Convex CLI Reference](https://docs.convex.dev/cli)
