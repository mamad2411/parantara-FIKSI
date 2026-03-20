-- Mark the users migration as already run so Laravel won't try to create it again
INSERT INTO migrations (migration, batch) 
VALUES ('0001_01_01_000000_create_users_table', 1)
ON CONFLICT DO NOTHING;
