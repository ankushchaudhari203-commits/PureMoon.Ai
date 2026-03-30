# 📧 User Email Tracking in Supabase

This guide explains how to track user emails in your Supabase database.

## 🚀 Setup Steps

### 1️⃣ Create the Users Table in Supabase

1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Create a new query and paste the SQL from `SQL_SETUP.sql`
3. Click **RUN** to create the table with indexes and triggers

**Table Structure:**
```
users
├── id (UUID, Primary Key)
├── email (TEXT, Unique)
├── name (TEXT)
├── image (TEXT)
├── created_at (TIMESTAMP)
├── last_login (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### 2️⃣ Import the User Service

The tracking is now automated! The `userService.ts` is already integrated into the dashboard.

**Files involved:**
- `lib/userService.ts` - User tracking functions
- `app/dashboard/page.tsx` - Calls `trackUserEmail()` on login

### 3️⃣ How It Works

When a user logs in via Google:
1. SessionProvider captures their email
2. Dashboard useEffect detects the session
3. `trackUserEmail()` is called automatically
4. **First login**: Creates new user record
5. **Subsequent logins**: Updates `last_login` timestamp

## 📊 Available Functions

### `trackUserEmail(userData)`
```typescript
import { trackUserEmail } from "@/lib/userService";

await trackUserEmail({
  email: "user@example.com",
  name: "John Doe",
  image: "https://..."
});
```
- Creates new user or updates existing
- Tracks last login time
- Returns user object or null

### `getUserByEmail(email)`
```typescript
const user = await getUserByEmail("user@example.com");
```
- Fetches specific user data
- Returns user object or null

### `getAllUsers()`
```typescript
const users = await getAllUsers();
```
- Fetches all users (admin use)
- Returns array of users

## 🔒 Security Features

✅ **Row Level Security (RLS)** - Users can only access their own data
✅ **Unique constraint on email** - Prevents duplicate entries
✅ **Timestamps** - Auto-updated created_at, last_login, updated_at
✅ **Indexed queries** - Fast lookups by email

## 📝 Database Columns Explained

| Column | Type | Purpose |
|--------|------|---------|
| `id` | UUID | Unique identifier |
| `email` | TEXT | User's email (unique) |
| `name` | TEXT | User's full name from Google |
| `image` | TEXT | User's profile picture URL |
| `created_at` | TIMESTAMP | When user first signed up |
| `last_login` | TIMESTAMP | Last time user accessed the app |
| `updated_at` | TIMESTAMP | Last database update |

## ✨ Example Usage

```typescript
// Automatic on login (already implemented)
if (session?.user?.email) {
  trackUserEmail({
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  });
}

// Manual lookup if needed
const userData = await getUserByEmail("user@example.com");
console.log(userData);
// Output:
// {
//   id: "123e4567-e89b-12d3-a456-426614174000",
//   email: "user@example.com",
//   name: "John Doe",
//   image: "https://...",
//   created_at: "2026-03-26T10:00:00",
//   last_login: "2026-03-26T15:30:00",
//   updated_at: "2026-03-26T15:30:00"
// }
```

## 🐛 Troubleshooting

**Q: "Relation users does not exist"**
→ Run the SQL setup script in `SQL_SETUP.sql`

**Q: CORS error or permission denied**
→ Check Supabase RLS policies in SQL_SETUP.sql

**Q: Duplicate key value violates unique constraint**
→ Email is already in database, the update path should handle it

**Q: Email not being tracked**
→ Check that session.user.email is available
→ Open browser console for error messages

## 🔄 What Gets Tracked

When a user logs in:
- ✅ Email address
- ✅ Name (from Google profile)
- ✅ Profile image URL
- ✅ First login timestamp
- ✅ Last login timestamp
- ✅ Update timestamps

## 💾 Database Query Examples

### Get all users
```sql
SELECT * FROM users ORDER BY created_at DESC;
```

### Get active users (logged in last 7 days)
```sql
SELECT * FROM users 
WHERE last_login > NOW() - INTERVAL '7 days'
ORDER BY last_login DESC;
```

### Get total user count
```sql
SELECT COUNT(*) FROM users;
```

### Get users by signup date
```sql
SELECT DATE(created_at), COUNT(*) 
FROM users 
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;
```
