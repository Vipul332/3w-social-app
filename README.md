# 3W Social Post Application

A mini social post feature — signup/login, create text/image posts, a public feed, likes, and comments — built for the 3W Full Stack Internship Assignment, inspired by the Social Page of the TaskPlanet app.

## Overview

Users can create an account, sign in, share a post (text, an image, or both), scroll a public feed of everyone's posts, like/unlike any post, and comment on any post. Likes and comments update in the UI instantly, with no page refresh.

## Features

- Email + password signup and login with hashed passwords (bcrypt) and JWT-based sessions
- Create a post with text only, an image only, or both (validated on the backend, not just the frontend)
- Public feed, newest posts first, with pagination (`?page=&limit=`)
- Like / unlike posts, with duplicate likes prevented server-side; liker usernames are stored and viewable on hover
- Comment on posts; commenter usernames and timestamps are stored and displayed
- Instant UI updates for likes and comments via optimistic React state updates (with rollback on failure)
- Clean, responsive Material UI design that works on mobile, tablet, and desktop
- Centralized error handling, request validation, loading/error/empty states, and toast notifications

## Tech Stack

| Layer      | Technology                                  |
|------------|----------------------------------------------|
| Frontend   | React (Vite), React Router, Material UI, Axios |
| Backend    | Node.js, Express.js                          |
| Database   | MongoDB with Mongoose                        |
| Auth       | JWT + bcryptjs                               |
| Image handling | Multer (local disk storage → URL stored in MongoDB) |

No TailwindCSS is used anywhere in this project, per the assignment's requirement.

## Architecture

```
React (Vite)  ─────HTTP (Axios)────▶  Express API  ─────Mongoose────▶  MongoDB
     │                                     │
     └── JWT stored in localStorage        └── Routes → Controllers → Models
                                                └── Middleware: auth, upload, error handling
```

- **Routes → Controllers → Models**: a thin routing layer maps HTTP verbs/paths to controller functions, which contain all business logic and talk to Mongoose models.
- **Auth middleware** verifies the JWT on every protected route and derives the user's identity from the token — the frontend never sends a raw `userId` that the backend trusts blindly.
- **Centralized error handler** converts thrown errors (validation, duplicate key, invalid ObjectId, Multer upload errors, or explicit `ApiError`s) into consistent JSON responses with correct status codes.

## Project Structure

```
3w-social-app/
├── backend/
│   ├── src/
│   │   ├── config/db.js              # MongoDB connection
│   │   ├── controllers/              # authController, postController
│   │   ├── middleware/               # auth, upload (multer), error handler
│   │   ├── models/                   # User.js, Post.js
│   │   ├── routes/                   # authRoutes, postRoutes
│   │   ├── utils/                    # ApiError, asyncHandler, generateToken, validators
│   │   ├── uploads/                  # locally stored post images (served statically)
│   │   ├── app.js                    # Express app setup
│   │   └── server.js                 # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/               # Navbar, PostCard, CreatePost, LikeButton,
│   │   │                             # CommentSection, CommentItem, Loading,
│   │   │                             # ErrorMessage, EmptyState, ProtectedRoute
│   │   ├── pages/                    # Login.jsx, Signup.jsx, Home.jsx
│   │   ├── context/                  # AuthContext, ToastContext
│   │   ├── hooks/                    # useAuth, useToast
│   │   ├── services/                 # apiClient, authService, postService
│   │   ├── utils/                    # formatters.js
│   │   ├── App.jsx / main.jsx
│   │   └── theme.js                  # MUI theme
│   ├── .env.example
│   └── package.json
└── README.md
```

## Database Design

**Exactly two MongoDB collections are used: `users` and `posts`.** There is no separate `likes` or `comments` collection — both are embedded as sub-documents directly inside each post, as required by the assignment.

### `users` collection

```js
{
  _id: ObjectId,
  username: String,
  email: String,       // unique
  password: String,    // bcrypt hash, never returned in API responses
  createdAt: Date,
  updatedAt: Date
}
```

### `posts` collection

```js
{
  _id: ObjectId,
  user: {
    id: ObjectId,       // ref: User
    username: String
  },
  content: String,      // optional if image is present
  image: String,        // URL, optional if content is present — at least one required
  likes: [
    {
      userId: ObjectId,
      username: String,
      createdAt: Date
    }
  ],
  comments: [
    {
      _id: ObjectId,
      userId: ObjectId,
      username: String,
      text: String,
      createdAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

A post must contain `content`, an `image`, or both — enforced both in the controller and as a Mongoose schema-level validator.

## Environment Variables

### `backend/.env` (copy from `backend/.env.example`)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/3w-social-app
JWT_SECRET=replace_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
MAX_UPLOAD_SIZE=5242880
```

### `frontend/.env` (copy from `frontend/.env.example`)

```
VITE_API_URL=http://localhost:5000/api
```

Never commit real `.env` files — only the `.env.example` templates are checked into git.

## Local Installation

### Prerequisites
- Node.js 18+
- A MongoDB connection string (local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd 3w-social-app

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
# edit .env and set MONGO_URI and JWT_SECRET

cd ../frontend
cp .env.example .env
# edit .env if your backend runs on a different URL
```

## Running Backend

```bash
cd backend
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The API runs on `http://localhost:5000` by default. Health check: `GET http://localhost:5000/api/health`.

## Running Frontend

```bash
cd frontend
npm run dev
```

The app runs on `http://localhost:5173` by default and talks to the backend via `VITE_API_URL`.

## API Documentation

Base URL: `{VITE_API_URL}` (e.g. `http://localhost:5000/api`)

### `POST /api/auth/signup`
- **Auth required:** No
- **Body:** `{ "username": "alice", "email": "alice@example.com", "password": "secret123" }`
- **Success (201):** `{ "success": true, "token": "...", "user": { "id", "username", "email", "createdAt" } }`
- **Error (400):** invalid input · **(409):** `"Email is already registered."`

### `POST /api/auth/login`
- **Auth required:** No
- **Body:** `{ "email": "alice@example.com", "password": "secret123" }`
- **Success (200):** `{ "success": true, "token": "...", "user": {...} }`
- **Error (401):** `"Invalid email or password."`

### `GET /api/auth/me`
- **Auth required:** Yes (`Authorization: Bearer <token>`)
- **Success (200):** `{ "success": true, "user": {...} }`
- **Error (401):** missing/invalid token

### `POST /api/posts`
- **Auth required:** Yes
- **Body:** `multipart/form-data` — `content` (string, optional) and/or `image` (file, optional); at least one is required
- **Success (201):** `{ "success": true, "post": { ...postObject } }`
- **Error (400):** `"Please enter text or select an image."` · **(401):** `"Authentication required."`

### `GET /api/posts?page=1&limit=10`
- **Auth required:** No
- **Success (200):**
  ```json
  {
    "success": true,
    "posts": [ ... ],
    "page": 1,
    "limit": 10,
    "totalPosts": 42,
    "totalPages": 5,
    "hasNextPage": true
  }
  ```

### `POST /api/posts/:postId/like`
- **Auth required:** Yes
- **Body:** none
- **Behavior:** toggles like/unlike for the authenticated user on that post
- **Success (200):** `{ "success": true, "liked": true, "likesCount": 3, "likes": [...] }`
- **Error (404):** `"Post not found."`

### `POST /api/posts/:postId/comments`
- **Auth required:** Yes
- **Body:** `{ "text": "Great post!" }`
- **Success (201):** `{ "success": true, "comment": {...}, "commentsCount": 4 }`
- **Error (400):** `"Comment text is required."`

### Sample curl requests

```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","email":"alice@example.com","password":"secret123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'

# Create a text-only post (replace TOKEN)
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -F "content=Hello from curl!"

# Create a post with an image
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -F "content=Check this out" \
  -F "image=@/path/to/photo.jpg"

# Get feed
curl http://localhost:5000/api/posts?page=1&limit=10

# Like/unlike a post
curl -X POST http://localhost:5000/api/posts/POST_ID/like \
  -H "Authorization: Bearer TOKEN"

# Comment on a post
curl -X POST http://localhost:5000/api/posts/POST_ID/comments \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Nice post!"}'
```

## Testing

This project was manually verified against the full test matrix required by the assignment:

**Auth:** signup with valid data, duplicate email rejected (409), invalid data rejected (400), login with valid/invalid credentials, protected routes reject missing/invalid tokens (401).

**Posts:** text-only, image-only, and text+image posts created successfully; empty post rejected (400) even if attempted directly against the API; feed returns newest-first order; pagination metadata is correct.

**Likes:** liking adds the user once; liking again removes the like (toggle, matching "duplicate like prevented"); like count updates correctly; liker usernames are stored.

**Comments:** comment is added with correct username and timestamp; comment count increments; empty/whitespace-only comments rejected.

**Database:** confirmed only `users` and `posts` collections exist; likes and comments are embedded arrays inside `posts` documents, not separate collections.

**UI:** login state persists across refresh (JWT + `/api/auth/me` bootstrap); feed, like, and comment updates apply instantly without a page reload; responsive layout verified at mobile/tablet/desktop breakpoints; loading, error, and empty states all render correctly.

You can re-verify locally with the curl commands above, or with Postman/Thunder Client using the same requests.

## Deployment

**Target architecture:** Frontend → Vercel/Netlify · Backend → Render · Database → MongoDB Atlas.

### 1. MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access (e.g. `0.0.0.0/0` for simplicity, or Render's IPs).
3. Copy the connection string into `MONGO_URI`.

### 2. Backend on Render
1. Push this repo to GitHub.
2. In Render, create a **Web Service**, pointing to the `backend` folder as the root directory.
3. Build command: `npm install` — Start command: `npm start`.
4. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL` (your deployed frontend URL), `MAX_UPLOAD_SIZE`.
5. Deploy, and note the resulting backend URL (e.g. `https://3w-social-backend.onrender.com`).

> **Note on uploaded images:** Render's free-tier filesystem is ephemeral — files written to disk (including `backend/src/uploads`) do not persist across deploys/restarts. For a fully persistent production setup, swap the storage layer in `uploadMiddleware.js` for a hosted image service (e.g. Cloudinary), storing only the returned URL in MongoDB — the rest of the app (Post model, controllers, frontend) requires no changes since it already treats `image` as a plain URL string.

### 3. Frontend on Vercel/Netlify
1. Import the repo, set the root directory to `frontend`.
2. Build command: `npm run build` — Output directory: `dist`.
3. Add environment variable: `VITE_API_URL=https://<your-render-backend-url>/api`.
4. Deploy, and note the resulting frontend URL.
5. Go back to Render and update `CLIENT_URL` to this frontend URL so CORS allows it.

### 4. Verify
- Visit the deployed frontend, sign up, create a post, like/comment — confirm everything works against the live backend and Atlas database.

**Live URLs** (fill in after deploying):
- Frontend: `<add your Vercel/Netlify URL here>`
- Backend: `<add your Render URL here>`
- GitHub repo: `<add your public GitHub URL here>`

## Screenshots

_Add screenshots of the login page, signup page, and feed (desktop + mobile) here before submission._

## Bonus Features Implemented

- Efficient pagination (`page`/`limit` query params with `totalPages`/`hasNextPage` metadata, backed by MongoDB `skip`/`limit` and an index on `createdAt`)
- Clean, reusable component architecture (no giant files; each component has a single responsibility)
- Optimistic UI updates for likes and comments, with rollback on request failure
- Centralized error handling and consistent JSON response shapes
- MUI theme centralization instead of scattered inline styles

## Future Improvements

- Move image storage to Cloudinary (or similar) for persistence across backend redeploys
- Add automated tests (Jest/Supertest for the API, React Testing Library for components)
- Add edit/delete for posts and comments
- Add infinite scroll instead of a manual "Load more" button
- Add rate limiting on auth and post-creation endpoints

## Author

_Add your name and contact details here._
