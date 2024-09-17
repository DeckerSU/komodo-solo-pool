#!/bin/bash

docker_subnet=$(docker network inspect bridge | grep Subnet | awk '{print $2}' | tr -d '",')
docker_gateway=$(docker network inspect bridge | grep Gateway | awk '{print $2}' | tr -d '",')

echo "Add to komodo.conf (or COIN.conf) the following lines:"
echo "-------------------------"
echo "rpcallowip=$docker_subnet"
echo "rpcbind=$docker_gateway"
echo "server=1"
echo "-------------------------"
