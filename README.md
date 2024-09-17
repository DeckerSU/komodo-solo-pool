#### Build the container
```bash
docker build -t komodo-solo-pool .
```

#### Run the Container with Host Networking (Linux Only)

```bash
docker run --rm -d \
  --env-file .env \
  --network host \
  --user $(id -u):$(id -g) \
  --name kmd-pool \
  komodo-solo-pool
```
`.env` file in this case should have DAEMON_HOST as localhost:
```
DAEMON_HOST=127.0.0.1
```

#### Run the Container with Bridge Networking

Add to the daemon configuration file (komodo.conf) the following lines:
```
rpcallowip=172.17.0.0/16
rpcbind=172.17.0.1
server=1
```
Where 172.17.0.1 is your `docker0` interface and 172.17.0.0/16 its subnet. You can use `daemon-config-params.sh` to get this params.

Edit `.env` file that way:
```
DAEMON_HOST=host.docker.internal
```
Run the container:
```bash
docker run --rm -d \
  -p 3333:3333 \
  -p 4444:4444 \
  --env-file .env \
  --add-host=host.docker.internal:host-gateway \
  --user $(id -u):$(id -g) \
  --name kmd-pool \
  komodo-solo-pool
```
If you would like to run a container in interactive mode, use the following command:
```bash
docker run --init --rm -it \
  -p 3333:3333 \
  -p 4444:4444 \
  --env-file .env \
  --add-host=host.docker.internal:host-gateway \
  --user $(id -u):$(id -g) \
  --name kmd-pool \
  komodo-solo-pool
```

#### Check RPC working correctly
```bash
curl --user rpcuser:rpcpass \
     --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getinfo", "params": [] }' \
     -H 'Content-Type: text/plain;' \
     http://127.0.0.1:7771/
```
