# Convex Backend - DriveHouse

This directory contains the Convex backend implementation for DriveHouse, including database schema, queries, mutations, and security logic.

## Structure

```
convex/
├── schema.ts           # Database schema definitions
├── users.ts            # User management (queries & mutations)
├── lib/
│   └── acl.ts         # Access Control List helpers
└── README.md          # This file
```

## Data Model

### Users Table

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | Firebase UID (indexed) |
| `email` | string? | User email address |
| `displayName` | string? | User display name |
| `photoURL` | string? | Profile photo URL |
| `totalPoints` | number | Gamification points |
| `premiumStatus` | boolean | Premium subscription status |
| `createdAt` | number | Account creation timestamp |
| `lastLoginAt` | number | Last login timestamp |

## Security Model

All data access in DriveHouse is secured using **Access Control Lists (ACLs)** based on the authenticated user's Firebase UID.

### Data Ownership Patterns

#### 1. Private Data
Resources owned by a single user (e.g., personal notes, tasks)

**Access Rule:** `resource.userId === currentUserId`

```typescript
// Example query for private data
const myNotes = await ctx.db
  .query("notes")
  .filter((q) => q.eq(q.field("userId"), currentUserId))
  .collect();
```

#### 2. Shared Data
Resources in a workspace (e.g., team projects, shared documents)

**Access Rule:** `currentUserId in workspace.members`

```typescript
// Example query for shared data
const workspace = await ctx.db.get(workspaceId);
if (!workspace.members.includes(currentUserId)) {
  throw new Error("Access denied");
}
```

### Implementation Checklist

Current implementation status:

- [x] Users table schema
- [x] Create/update user mutation
- [x] Get user by userId query
- [x] ACL helper functions (placeholder)
- [ ] Extract userId from Firebase JWT in HTTP middleware
- [ ] Pass authenticated userId to all queries/mutations via context
- [ ] Implement workspace table and membership validation
- [ ] Add ACL checks to all data access functions
- [ ] Add audit logging for sensitive operations
- [ ] Set up Convex HTTP endpoints for Firebase token validation

## API Reference

### Mutations

#### `createUser`
Creates a new user or updates an existing user's information.

**Args:**
- `userId` (string): Firebase UID
- `email` (string?, optional): User email
- `displayName` (string?, optional): Display name
- `photoURL` (string?, optional): Profile photo URL

**Returns:**
- `userId` (string): The user's Firebase UID
- `isNew` (boolean): True if a new user was created

**Example:**
```typescript
const result = await createUser({
  userId: "firebase-uid-123",
  email: "user@example.com",
  displayName: "John Doe",
});
// { userId: "firebase-uid-123", isNew: true }
```

### Queries

#### `getUserByUserId`
Retrieves a user by their Firebase UID.

**Args:**
- `userId` (string): Firebase UID

**Returns:** User object or null

**Example:**
```typescript
const user = await getUserByUserId({ userId: "firebase-uid-123" });
```

#### `getCurrentUser`
Gets the current user's full profile.

**Args:**
- `userId` (string): Firebase UID

**Returns:** User object

**Example:**
```typescript
const currentUser = await getCurrentUser({ userId: "firebase-uid-123" });
```

## Future Enhancements

### Authentication Integration
- [ ] Implement Convex HTTP auth endpoints
- [ ] Integrate Firebase Admin SDK for token verification
- [ ] Pass authenticated user context to all functions
- [ ] Add rate limiting per user

### Permission System
- [ ] Define permission levels (view, edit, admin)
- [ ] Implement role-based access control (RBAC)
- [ ] Add permission checks to mutations

### Data Protection
- [ ] Implement data encryption at rest
- [ ] Add audit trail for compliance
- [ ] Set up automated backups
- [ ] Implement soft deletes for data recovery

### Performance
- [ ] Add caching layer for frequently accessed data
- [ ] Optimize queries with compound indexes
- [ ] Implement pagination for large datasets

## Development

### Running Convex Dev Server

```bash
npx convex dev
```

This will:
1. Start the Convex development server
2. Watch for changes in the `convex/` directory
3. Automatically push schema and function updates
4. Generate TypeScript types in `convex/_generated/`

### Accessing Convex Dashboard

After running `npx convex dev`, you can access the Convex dashboard at the URL shown in the terminal. The dashboard allows you to:

- View and query data tables
- Test mutations and queries
- Monitor function logs
- Manage deployments

## Troubleshooting

### "ConvexError: Invalid deployment URL"
- Make sure `npx convex dev` is running
- Check that `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`
- Restart your Next.js dev server after Convex is initialized

### Schema changes not taking effect
- Convex dev server automatically pushes changes
- If stuck, try stopping and restarting `npx convex dev`
- Check the terminal for any schema validation errors

### User not being created
- Check browser console for errors
- Verify the mutation is being called with correct arguments
- Check Convex dashboard logs for server-side errors

## Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Schema Guide](https://docs.convex.dev/database/schemas)
- [Convex Security](https://docs.convex.dev/production/security)
