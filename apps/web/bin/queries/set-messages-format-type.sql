update messages
set "messageFormat" = 'DISCORD'
from messages as m
join threads on m."threadId" = threads.id  
join channels on threads."channelId" = channels.id 
join accounts on channels."accountId" = accounts.id 
where accounts."discordServerId" is not null 
and m."messageFormat" is null
and m.id = messages.id;

update messages
set "messageFormat" = 'SLACK'
from messages as m
join threads on m."threadId" = threads.id  
join channels on threads."channelId" = channels.id 
join accounts on channels."accountId" = accounts.id 
where accounts."slackTeamId" is not null 
and m."messageFormat" is null
and m.id = messages.id;
