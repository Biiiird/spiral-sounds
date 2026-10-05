# Spiral Sounds

An online store for classic vinyl records, built as a Node.js/Express backend with a vanilla HTML/CSS/JavaScript frontend, backed by SQLite.

## How it works

### Architecture

- **Server**: [server.js](server.js) boots an Express app on port `8000`, wires up session handling, serves the static frontend from [public/](public/), and mounts the API routers.
- **Routes → Controllers**: Each feature area has a router in [routes/](routes/) that maps HTTP endpoints to handler functions in [controllers/](controllers/).
- **Database**: [db/db.js](db/db.js) opens a connection to a SQLite file (`database.db`) at the project root using `sqlite`/`sqlite3`. Controllers open a fresh connection per request and query directly with SQL (no ORM).
- **Auth & sessions**: Authentication is session-based via `express-session`. On login/register, the user's id is stored in `req.session.userId`. The [requireAuth](middleware/requireAuth.js) middleware protects the cart routes, rejecting requests with no active session.
- **Frontend**: Static pages in [public/](public/) ([index.html](public/index.html), [cart.html](public/cart.html), [login.html](public/login.html), [signup.html](public/signup.html)) are plain HTML/CSS, with page behavior in [public/js/](public/js/) calling the JSON API via `fetch`.

### Data model

SQLite database (`database.db`) with three tables:

- **products** — id, title, artist, price, image, year, genre, stock
- **users** — id, name, email (unique), username (unique), password (bcrypt hash), created_at
- **cart_items** — id, user_id, product_id, quantity (one row per user/product pair; quantity increments on repeat add-to-cart)

### API

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| GET | `/api/products` | No | List products; supports `?genre=` or `?search=` query filters |
| GET | `/api/products/genres` | No | List distinct genres |
| POST | `/api/auth/register` | No | Create a user account (name, email, username, password) and log in |
| POST | `/api/auth/login` | No | Log in with username/password |
| GET | `/api/auth/logout` | No | Destroy the current session |
| GET | `/api/auth/me` | No | Get current session's login status/name |
| POST | `/api/cart/add` | Yes | Add a product to the current user's cart (increments quantity if already present) |
| GET | `/api/cart` | Yes | List current user's cart items, joined with product info |
| GET | `/api/cart/cart-count` | Yes | Get total quantity of items in the current user's cart |
| DELETE | `/api/cart/:itemId` | Yes | Remove a single cart item |
| DELETE | `/api/cart/all` | Yes | Clear the current user's cart |

Passwords are hashed with `bcryptjs`; emails/usernames are validated with `validator` and a username format check before insertion.

## Running the project

### Prerequisites

- Node.js (with npm)
- The `database.db` SQLite file already exists at the project root with sample data.

### Install dependencies

```bash
npm install
```

### Start the server

```bash
npm start
```

This runs `node server.js`, which starts the server at [http://localhost:8000](http://localhost:8000). Open that URL in a browser to browse products, sign up/log in, and use the cart.

### Configuration

- `SPIRAL_SESSION_SECRET` — session cookie signing secret. Optional in development (a default is used); required when `NODE_ENV=production`, otherwise the server refuses to start.
- `NODE_ENV=production` — marks session cookies `Secure` (HTTPS only). The app trusts the first proxy hop, so run it behind an HTTPS reverse proxy such as nginx.
- `DB_PATH` — path to the SQLite file (defaults to `database.db` in the project root). In production, point this at a copy outside the repo so runtime writes never conflict with `git pull`; the committed `database.db` serves as seed data.

### Inspecting the database

[logTable.js](logTable.js) is a small dev utility that prints the contents of a table (`cart_items` by default — edit the `tableName` constant to switch to `products` or `users`) to the console:

```bash
node logTable.js
```
