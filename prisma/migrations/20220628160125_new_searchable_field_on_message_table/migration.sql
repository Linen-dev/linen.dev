-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "textsearchable_index_col" tsvector
    GENERATED ALWAYS AS (to_tsvector('english', coalesce(body,''))) STORED;

-- CreateIndex
CREATE INDEX "messages_textsearchable_index_col_idx" ON "messages" USING GIN ("textsearchable_index_col");