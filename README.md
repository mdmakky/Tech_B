# TechNest (Tech_B)

Server-side rendered tech blogging platform built with Express, EJS, and PostgreSQL.

## Overview

TechNest is a full-featured blog application focused on technical content. It supports:

- User registration and login
- Publishing and editing articles
- Draft and publish workflow
- Comments and replies
- Voting system (upvote/downvote)
- Follow/unfollow between users
- Public author profile page
- Admin dashboard for moderation

## Tech Stack

- Node.js (ES modules)
- Express 5
- EJS templates
- PostgreSQL + `pg`
- Session storage with `express-session` + `connect-pg-simple`
- Password hashing with `bcryptjs`
- Markdown rendering with `marked`
- Slug generation with `slugify`
- Compression middleware

## Project Structure

```text
.
├── app.js
├── index.js
├── src
│   ├── config
│   ├── controllers
│   ├── middlewares
│   ├── modles
│   ├── public
│   ├── routes
│   └── views
└── README.md
```

Note: the folder is named `modles` in this project (not `models`).

## Requirements

- Node.js 18+
- PostgreSQL 13+

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root.

```env
# Server
PORT=8080
NODE_ENV=development

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/technest

# Session
SESSION_SECRET=replace-with-a-strong-random-secret

# Optional pool tuning
DB_POOL_MAX=10
DB_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=15000
```

## Database Setup

This repository does not include migrations. Use the SQL below as a starter schema.

```sql
CREATE TABLE IF NOT EXISTS users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(80) UNIQUE NOT NULL,
	email VARCHAR(180) UNIQUE NOT NULL,
	password TEXT NOT NULL,
	role VARCHAR(20) NOT NULL DEFAULT 'user',
	bio TEXT,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
	id SERIAL PRIMARY KEY,
	author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	slug VARCHAR(220) UNIQUE NOT NULL,
	content TEXT NOT NULL,
	excerpt TEXT,
	meta_title TEXT,
	meta_description TEXT,
	meta_keywords TEXT,
	tags TEXT,
	is_published BOOLEAN NOT NULL DEFAULT false,
	view_count INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
	id SERIAL PRIMARY KEY,
	post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
	content TEXT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
	id SERIAL PRIMARY KEY,
	post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('up', 'down')),
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS follows (
	id SERIAL PRIMARY KEY,
	follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	UNIQUE (follower_id, following_id),
	CHECK (follower_id <> following_id)
);

-- Session table is auto-created by connect-pg-simple (createTableIfMissing: true)
```

## Run the App

```bash
npm start
```

Default URL:

```text
http://localhost:8080
```

## Main Routes

- `/` Home page (latest published posts)
- `/posts` Articles listing
- `/posts/:slug` Single article page
- `/posts/new/create` Create new article (auth required)
- `/posts/:slug/edit` Edit article (owner only)
- `/auth/register` Register
- `/auth/login` Login
- `/profile/me` Logged-in user profile
- `/comments/add` Add comment/reply (auth required)
- `/votes/:postId/:type` Toggle vote (auth required)
- `/follow/:userId` Follow/unfollow user (auth required)
- `/admin` Admin dashboard (admin role required)

## Session and DB Notes

- Sessions are stored in PostgreSQL using `connect-pg-simple`.
- `disableTouch: true` is enabled to reduce unnecessary session writes.
- Database pool uses keepalive and configurable timeout values.

## Current Script

```json
"scripts": {
	"start": "nodemon index.js"
}
```

If you want separate production/dev scripts, consider:

```json
"scripts": {
	"dev": "nodemon index.js",
	"start": "node index.js"
}
```

## Troubleshooting

1. Database connection timeout

- Check `DATABASE_URL`.
- Make sure PostgreSQL is running and reachable.
- Increase `DB_CONNECTION_TIMEOUT_MS` if needed.

2. Sessions not persisting

- Verify `SESSION_SECRET` is set.
- Confirm PostgreSQL user has permission to create/read/write session table.

3. Styles look outdated in browser

- Hard refresh: `Ctrl+Shift+R`.
- Clear cache or disable cache in DevTools while testing.

## License

ISC
