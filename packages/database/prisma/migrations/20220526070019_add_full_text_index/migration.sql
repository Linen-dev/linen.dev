-- Add GIN index to speed up full-text queries.

CREATE EXTENSION pg_trgm;
CREATE EXTENSION btree_gin;
CREATE INDEX messages_body_index
   ON messages USING GIN (to_tsvector('english', body));
