killall node
killall npm

# first make sure we have nginx reload
echo starting nginx
sh start_nginx.sh

echo starting api server
# now start the server and piple it to server.log
node --harmony-async-await server/server.js dev > server.log 2>&1 &

echo starting web client hot loading
# now start the web client 
cd webclient
http-server . > ../webclient.log 2>&1 &
cd ..
cd ..
