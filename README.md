# Simple GPS Location HTTP Server (Node.js + PostgreSQL)

This project is a lightweight Node.js HTTP server (no Express) for receiving GPS location data via POST requests and storing it in a PostgreSQL database. It also serves basic read and health-check endpoints via GET.

---

## 📦 Features

- Accepts GPS location data (latitude, longitude, and metadata) via POST
- Prevents duplicate entries based on lat/lon
- Returns the most recent location and total record count via GET
- Provides a health check at `/health`
- Logs incoming requests and outgoing responses
- Written in native Node.js HTTP (no Express)
- Clean, modular structure with JSDoc annotations

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/location-server.git
cd location-server
````

### 2. Set up PostgreSQL

Create a `locations` table:

```sql
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  acc DOUBLE PRECISION,
  alt DOUBLE PRECISION,
  batt DOUBLE PRECISION,
  bs TEXT,
  tst BIGINT,
  vac DOUBLE PRECISION,
  vel DOUBLE PRECISION,
  conn TEXT,
  topic TEXT,
  inregions TEXT,
  ssid TEXT,
  bssid TEXT
);
```

Make sure your PostgreSQL credentials are set via environment variables or `.env`.

### 3. Install dependencies

```bash
npm install pg
```

### 4. Start the server

```bash
node index.js
```

Server runs on port **3000**.

---

## 📬 API Endpoints

### `POST /`

Submit GPS data as JSON:

```json
{
  "lat": 11.1234,
  "lon": 11.5678,
  "acc": 5,
  "alt": 600,
  "batt": 85,
  "bs": "mybase",
  "tst": 1720100000,
  "vac": 0,
  "vel": 0,
  "conn": "wifi",
  "topic": "device/location",
  "inregions": "regionA",
  "ssid": "myWiFi",
  "bssid": "00:11:22:33:44:55"
}
```

📌 Responds with:

* `201 Created` on success
* `409 Conflict` if duplicate
* `400 Bad Request` if invalid/missing data

---

### `GET /`

Returns the **latest location** and the total number of stored records:

```json
{
  "lat": 1.1234,
  "lon": 1.5678,
  "batt": 85,
  "bs": "mybase",
  "count": 24
}
```

---

### `GET /health`

Health check endpoint:

```json
{
  "status": "ok",
  "uptime": 120.45,
  "timestamp": "2025-07-13T12:00:00.000Z"
}
```

---

## 🛠 Environment Configuration

You can configure the PostgreSQL connection using [node-postgres environment variables](https://node-postgres.com/features/connecting):

* `PGHOST`
* `PGUSER`
* `PGPASSWORD`
* `PGDATABASE`
* `PGPORT`

Example `.env` (if using dotenv):

```env
PGHOST=localhost
PGUSER=youruser
PGPASSWORD=yourpass
PGDATABASE=yourdb
PGPORT=5432
```

---

## 📄 License

MIT – use freely and modify for your needs.

```