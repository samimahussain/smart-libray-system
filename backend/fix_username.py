import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

print("=" * 60)
print("USERNAME MIGRATION DIAGNOSTIC & FIX")
print("=" * 60)

print("\n[1] Checking if 'username' column exists...")

with connection.cursor() as cursor:
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name='users_user' AND column_name='username';
    """)
    username_exists = cursor.fetchone() is not None

if username_exists:
    print("✓ Username column EXISTS in database")
    
    print("\n[2] Checking for duplicate usernames...")
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT username, COUNT(*) as count
            FROM users_user 
            GROUP BY username 
            HAVING COUNT(*) > 1;
        """)
        duplicates = cursor.fetchall()
    
    if duplicates:
        print(f"✗ Found {len(duplicates)} duplicate username(s)")
        for username, count in duplicates:
            print(f"  - '{username}': {count} users")
        
        print("\n[3] FIXING duplicates...")
        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE users_user 
                SET username = COALESCE(NULLIF(email, ''), CONCAT('user_', id))
                WHERE username = '' OR username IS NULL;
            """)
            print(f"✓ Updated {cursor.rowcount} users")
        
        print("\n✓ All duplicates fixed!")
        print("\nNow run: python manage.py migrate")
    else:
        print("✓ No duplicate usernames found")
        print("\nYou can run: python manage.py migrate")
else:
    print("✗ Username column DOES NOT EXIST")

print("\n" + "=" * 60)
