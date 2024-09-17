# Use the Node.js 18 Alpine image as the base
FROM node:18-alpine3.20

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
