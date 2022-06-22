CREATE MATERIALIZED VIEW "channels_stats" AS
select c."accountId", st."channelId", COUNT(1)
FROM "public"."slackThreads" st 
left join "public"."channels" c on c."id" = st."channelId" 
WHERE st."messageCount" > 1
group by 1,2;

CREATE INDEX channels_stats_idx_accountId
  ON "public"."channels_stats" ("accountId");
 
CREATE INDEX channels_stats_idx_channelId
  ON "public"."channels_stats" ("channelId");
