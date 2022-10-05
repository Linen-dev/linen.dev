### pm2

for development only

### install dependencies

```bash
sudo npm install pm2 -g
brew install ngrok/ngrok/ngrok # https://ngrok.com/download
cd nextjs && npm install
cd push_service && mix local.hex && mix local.rebar && mix deps.get
```

### database

```bash
source nextjs/.env
docker-compose up -d
cd nextjs && npx prisma migrate dev
```

### how to start

```bash
source nextjs/.env
pm2 start ecosystem.config.js
```

### how to pm2

```bash
# dashboard monitor
pm2 monit
# for all logs
pm2 logs
# for specific logs, pm2 logs <appName>
pm2 logs nextjs
# Start all applications
pm2 start ecosystem.config.js
# Stop all
pm2 stop ecosystem.config.js
# Restart all
pm2 restart ecosystem.config.js
# Reload all
pm2 reload ecosystem.config.js
# Delete all
pm2 delete ecosystem.config.js
```
