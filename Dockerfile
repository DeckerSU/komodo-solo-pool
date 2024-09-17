# Use the Node.js 18 Alpine image as the base
FROM node:18-alpine3.20

# Install necessary packages:
# - git: To clone repositories from GitHub
# - python3: Python 3 required by node-gyp@10.2.0
# - make: Build tool required by node-gyp
# - g++: C++ compiler required by node-gyp
# - libsodium-dev: Development files for libsodium (provides sodium.h)
# - boost-dev: Boost development files (includes boost-system)
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    libsodium-dev \
    boost-dev \
    && ln -sf python3 /usr/bin/python  # Symlink python command to python3

# Set the working directory
WORKDIR /app

# Install dependencies
RUN npm install https://github.com/DeckerSU/node-stratum-pool dotenv

# Copy your pool.js file into the container
COPY pool.js .

# Expose the necessary ports (these can be overridden at runtime)
EXPOSE 3333 4444

# Start the application
CMD ["node", "pool.js"]
