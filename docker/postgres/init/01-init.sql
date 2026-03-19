-- Docker init script - minimal setup
-- Full schema is managed through migrations (api/src/db/migrations/)
-- This script only ensures the database and extensions exist
-- NOTE: init scripts are loaded from api/src/db/migrations/ (000_ prefix runs first)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
