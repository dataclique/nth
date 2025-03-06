DROP TABLE IF EXISTS locked_objects;

CREATE TABLE locked_objects (
    id SERIAL PRIMARY KEY,
    object_id VARCHAR(255) NOT NULL UNIQUE,
    key_id VARCHAR(255),
    creator VARCHAR(255),
    item_id VARCHAR(255),
    deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX locked_objects_creator_idx ON locked_objects(creator);
CREATE INDEX locked_objects_deleted_idx ON locked_objects(deleted);



-- /// Our swap objects list
-- model Escrow {
-- 	// Keeping an ID so we can use as a pagination cursor
-- 	// There's an issue with BigInt for sqlite, so we're using a plain ID.
-- 	id Int @id @default(autoincrement())
-- 	objectId String @unique
-- 	sender String?
-- 	recipient String?
-- 	keyId String?
-- 	itemId String?
-- 	swapped Boolean @default(false)
-- 	cancelled Boolean @default(false)
	
-- 	@@index([recipient])
-- 	@@index([sender])
-- }

-- /// Saves the latest cursor for a given key.
-- model Cursor {
-- 	id String @id
-- 	eventSeq String
-- 	txDigest String
-- }