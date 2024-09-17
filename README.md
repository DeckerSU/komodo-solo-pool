
# Komodo Solo Pool

`komodo-solo-pool` is a project designed for solo-mining Komodo (KMD) and its assetchains using NiceHash or multiple Equihash ASICs. This pool allows miners to connect and mine directly to their own daemon, providing an efficient and straightforward way to participate in the Komodo ecosystem.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Building the Docker Image](#building-the-docker-image)
- [Running the Pool](#running-the-pool)
  - [Run the Container with Host Networking (Recommended)](#run-the-container-with-host-networking-recommended)
  - [Run the Container with Bridge Networking](#run-the-container-with-bridge-networking)
- [Stratum Ports](#stratum-ports)
- [Testing the RPC Connection](#testing-the-rpc-connection)
- [License](#license)

## Overview

`komodo-solo-pool` is based on the `node-stratum-pool` module from the [joshuayabut repository](https://github.com/joshuayabut/node-stratum-pool) but includes several improvements for compatibility with modern Node.js versions and enhanced functionality.

One significant enhancement is the rewriting of the `equihashverify` package to be compatible with the new V8 API. This is achieved using the [NAN (Native Abstraction for Node.js)](https://github.com/nodejs/nan) library, ensuring compatibility across different Node.js and V8 versions.

The pool is dockerized, allowing for easy deployment and management. It reads configuration parameters from a `.env` file, providing a simple way to customize settings without modifying the code.

## Features

- **Solo Mining Support**: Ideal for miners looking to solo mine KMD and its assetchains.
- **NiceHash Compatibility**: Configured to work seamlessly with NiceHash for hash power rental.
- **Modern Node.js Compatibility**: Updated to work with the latest versions of Node.js.
- **Dockerized Deployment**: Simplifies installation and management using Docker containers.
- **Flexible Networking Options**: Supports both host networking (recommended) and bridged networking modes.
- **Multiple Stratum Ports**: Offers two stratum ports for different local difficulty levels.

## Prerequisites

- **Docker**: Ensure Docker is installed on your system.
- **Komodo Daemon**: A running instance of the Komodo daemon or assetchain daemon you wish to mine.

## Installation

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/yourusername/komodo-solo-pool.git
cd komodo-solo-pool
```

## Configuration

Create a `.env` file in the project root directory with the following content:

```dotenv
# Coin and Pool Settings
COIN=Komodo
ADDRESS=YOUR_WALLET_ADDRESS

# Stratum Ports
STRATUM_HIGH_DIFF_PORT=3333
STRATUM_LOW_DIFF_PORT=4444

# Daemon Configuration
DAEMON_HOST=127.0.0.1
DAEMON_RPC_PORT=YOUR_DAEMON_RPC_PORT
DAEMON_RPC_USER=YOUR_DAEMON_RPC_USER
DAEMON_RPC_PASS=YOUR_DAEMON_RPC_PASSWORD
DAEMON_P2P_PORT=YOUR_DAEMON_P2P_PORT
```

**Replace the placeholders** with your actual configuration values.

## Building the Docker Image

Build the Docker image:

```bash
docker build -t komodo-solo-pool .
```

## Running the Pool

There are two main methods to run the pool: using host networking and using bridge networking. We recommend using host networking in most cases.

### Run the Container with Host Networking (Recommended)

Host networking allows the container to share the host's network stack, which simplifies network configurations and improves performance.

#### Run the Container

```bash
docker run --rm -d \
  --env-file .env \
  --network host \
  --user $(id -u):$(id -g) \
  --name kmd-pool \
  komodo-solo-pool
```

In this case, the `.env` file should have `DAEMON_HOST` set to localhost:

```dotenv
DAEMON_HOST=127.0.0.1
```

**Note**: When using host networking, you do not need to map ports using the `-p` option.

### Run the Container with Bridge Networking

If you prefer or require bridged networking, you can run the container as follows. This method requires additional configuration to allow the container to communicate with the Komodo daemon running on the host.

#### Configure the Komodo Daemon

Add the following lines to your daemon configuration file (`komodo.conf`):

```conf
rpcallowip=172.17.0.0/16
rpcbind=172.17.0.1
server=1
```

- **`rpcallowip`**: Allows RPC connections from the Docker subnet (`172.17.0.0/16`).
- **`rpcbind`**: Binds the RPC service to the Docker bridge interface (`172.17.0.1`).
- **`server=1`**: Enables the daemon to accept RPC commands.

**Note**: `172.17.0.1` is the default IP address of the `docker0` interface, and `172.17.0.0/16` is its subnet. You can use the `daemon-config-params.sh` script to retrieve these parameters.

#### Edit the `.env` File

Set `DAEMON_HOST` to `host.docker.internal` in your `.env` file:

```dotenv
DAEMON_HOST=host.docker.internal
```

#### Run the Container

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

- **`-p 3333:3333 -p 4444:4444`**: Maps the container's stratum ports to the host.
- **`--add-host=host.docker.internal:host-gateway`**: Maps `host.docker.internal` to the host's gateway IP address, allowing the container to communicate with services running on the host.

If you would like to run the container in interactive mode, use the following command:

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

**Note**: The `--init` flag runs an init inside the container that forwards signals and reaps processes.

## Stratum Ports

After running the Docker container, two stratum ports will be available:

1. **High Difficulty Port (`3333`)**: Configured for NiceHash or mining rigs with high hash rates.
2. **Low Difficulty Port (`4444`)**: Suitable for single GPUs or ASICs, useful for starting new assetchains.

## Testing the RPC Connection

Before starting mining, ensure that the pool can communicate with the Komodo daemon via RPC. You can test the RPC connection using the following `curl` command:

```bash
curl --user YOUR_DAEMON_RPC_USER:YOUR_DAEMON_RPC_PASSWORD \
     --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getinfo", "params": [] }' \
     -H 'Content-Type: text/plain;' \
     http://127.0.0.1:YOUR_DAEMON_RPC_PORT/
```

**Replace the placeholders** with your actual daemon RPC user, password, and port.

If the RPC connection is working correctly, you should receive a JSON response containing the daemon's information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
