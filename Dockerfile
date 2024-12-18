
# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy the application files into the working directory
COPY package*.json ./

COPY . .
# Install the application dependencies
EXPOSE 500 
RUN npm install

# Define the entry point for the container
CMD ["node", "app.js"]