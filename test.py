import time
import json
import psycopg2
import requests

# ────────────────────────────────────────────────────────────
# CONFIG
# ────────────────────────────────────────────────────────────

DB_CONFIG = {
    "host": "100.73.38.54",
    "dbname": "mxdcodes",
    "user": "max",
    "password": "B73g948jcab!",
    "port": 5432,
}

DAWARICH_URL = "https://dawarich.mxd.codes/api/v1/owntracks/points?"
DAWARICH_API_KEY = "ad6b2a710db4a0d549e58bb6073e33e4"
DELAY_SECONDS = 0.0025  # throttle

# ────────────────────────────────────────────────────────────
# MAIN
# ────────────────────────────────────────────────────────────

def main():
    print("Connecting to database...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    print(f"Fetching locations...")
    cur.execute(f"""
        SELECT
            lat,
            lon,
            acc,
            alt,
            batt,
            bs,
            tst,
            vac,
            vel,
            conn,
            topic,
            inregions,
            ssid,
            bssid
        FROM locations
        ORDER BY id ASC
    """)

    rows = cur.fetchall()
    columns = [desc[0] for desc in cur.description]

    print(f"Found {len(rows)} locations\n")

    success = 0
    failed = 0

    for idx, row in enumerate(rows, 1):
        payload = dict(zip(columns, row))
        #print(f"[{idx}/{len(rows)}] Sending payload: lat={payload['lat']}, lon={payload['lon']}")

        try:
            response = requests.post(
                DAWARICH_URL,
                params={"api_key": DAWARICH_API_KEY},
                json=payload,
                timeout=10,
                verify=True  # setze auf False nur zum Testen, wenn SSL Fehler auftreten
            )

            if response.status_code >= 300:
                failed += 1
                print(f"❌ Dawarich rejected point ({response.status_code}): {response.text}")
            else:
                success += 1
                print(f"✅ Dawarich accepted point")

        except requests.RequestException as e:
            failed += 1
            print(f"❌ Request failed: {e}")

        if DELAY_SECONDS > 0:
            time.sleep(DELAY_SECONDS)

    print("\nBackfill finished")
    print(f"✅ Success: {success}")
    print(f"❌ Failed: {failed}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
