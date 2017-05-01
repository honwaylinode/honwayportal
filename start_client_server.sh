killall node
killall npm

# first make sure we have nginx reload
echo starting nginx
sh start_nginx.sh

echo starting api server
# now start the server and piple it to server.log
~/.nvm/versions/node/v7.6.0/bin/node server/server.js dev > server.log 2>&1 &

echo starting web client hot loading
# now start the web client 
cd webclient
npm run dev > ../webclient.log 2>&1 &
cd ..
cd ..
