# Simple GPS Location API Server (Node.js + Express + PostgreSQL)

This project is a lightweight Express-based HTTP server written in TypeScript for receiving and storing GPS location data in PostgreSQL. It supports POST and GET endpoints for location tracking, along with a health-check route.

---

## 📦 Features

- Accepts GPS location data (latitude, longitude, and metadata) via POST
- Returns the most recent location and total record count via GET
- Provides a health check at `/health` (no authentication)
- All other endpoints are protected with an API key
- Prevents duplicate entries by coordinate
- Logs incoming requests and bodies
- Uses Express and a modular structure with route handlers and middleware
- TypeScript with typings and clear separation of concerns

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/dietrichmax/locations-webhook
cd locations-webhook
```

### 2. Set up PostgreSQL

Create a `locations` table:

```sql
CREATE TABLE public.locations (
	id bigserial PRIMARY KEY,
	created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
	lat float8,
	lon float8,
	acc int4,
	alt int4,
	batt int4,
	bs int4,
	cog float8,
	rad int4,
	t varchar(255),
	tid varchar(255),
	tst int4,
	vac int4,
	vel int4,
	p float8,
	conn varchar(255),
	topic varchar(255),
	inregions jsonb,
	ssid varchar(255),
	bssid varchar(255),
	CONSTRAINT unique_lat_lon UNIQUE (lat, lon)
);

CREATE INDEX lat_idx ON locations (lat);
CREATE INDEX lon_idx ON locations (lon);
CREATE INDEX alt_idx ON locations (alt);
CREATE INDEX vel_idx ON locations (vel);
CREATE INDEX created_at_idx ON locations (created_at);
CREATE INDEX lat_lon_idx ON locations (lat, lon);
```

> ⚠️ Consider removing `UNIQUE (lat, lon)` if near-duplicate coordinates are allowed.

### 3. Configure environment

Create a `.env` file (or set these variables in your environment):

```env
PGHOST=localhost
PGUSER=youruser
PGPASSWORD=yourpass
PGDATABASE=yourdb
PGPORT=5432
API_KEY=your-secret-key
```

### 4. Install dependencies

```bash
npm install
```

### 5. Start the server

```bash
npm run build     # Compile TypeScript
npm start         # Run compiled app
```

Or during development:

```bash
npm run dev       # Uses ts-node + nodemon
```

Server runs on port **3000** by default.

---

## 📬 API Endpoints

> 🔐 All endpoints except `/health` require an `x-api-key` header.

### `POST /tracking/locations`

Submit GPS data as JSON:

```json
{
  "lat": 11.1234,
  "lon": 11.5678,
  "acc": 5,
  "alt": 600,
  "batt": 85,
  "bs": 100,
  "tst": 1720100000,
  "vac": 0,
  "vel": 0,
  "conn": "wifi",
  "topic": "device/location",
  "inregions": {"region": "A"},
  "ssid": "myWiFi",
  "bssid": "00:11:22:33:44:55"
}
```

📌 Responds with:

* `201 Created` on success
* `409 Conflict` if duplicate
* `400 Bad Request` if required fields are missing

---

### `GET /tracking`

Returns the latest location and total count:

```json
{
  "lat": 11.1234,
  "lon": 11.5678,
  "batt": 85,
  "bs": 100,
  "count": 24
}
```

---

### `GET /health`

Health check endpoint (no authentication required):

```json
{
  "status": "ok",
  "uptime": 123.45
}
```

---

## 🔐 Authentication

All routes (except `/health`) require an API key via HTTP header:

```
x-api-key: your-secret-key
```

Set your secret key in `.env` under `API_KEY`.

---

## 📄 License

MIT – use freely and modify for your needs.