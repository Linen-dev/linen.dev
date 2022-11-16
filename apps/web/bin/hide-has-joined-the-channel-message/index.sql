  UPDATE
    threads 
  SET
    hidden = true
  FROM messages
  WHERE messages."threadId"=threads.id
  AND body like '%has joined the channel' 
  AND hidden = false;