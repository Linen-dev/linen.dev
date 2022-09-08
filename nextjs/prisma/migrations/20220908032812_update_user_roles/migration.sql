update users u
set "role" = 'ADMIN'
where u."isAdmin" is true and u."authsId" is null;

update users u
set "role" = 'OWNER'
where u."isAdmin" is true and u."authsId" is not null;