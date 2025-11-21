# Use a lightweight Node.js image
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first
# This caches our 'npm install' layer
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project source code
COPY . .

# Expose the default Vite port
EXPOSE 5173

# The command to run when the container starts
CMD ["npm", "run", "dev"]