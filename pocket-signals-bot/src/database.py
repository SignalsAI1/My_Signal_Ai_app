import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'users.db')

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS users 
                          (user_id INTEGER PRIMARY KEY, pocket_id TEXT, is_active INTEGER DEFAULT 0)''')
        conn.commit()

def add_user(user_id, pocket_id):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO users (user_id, pocket_id) VALUES (?, ?)", (user_id, pocket_id))
        conn.commit()

def update_status(pocket_id, status=1):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_active = ? WHERE pocket_id = ?", (status, pocket_id))
        conn.commit()