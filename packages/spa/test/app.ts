import Server from './server';

const server = new Server();
server.start({ port: process.env.PORT || 8000 });
