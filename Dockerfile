# Use official Node.js image
FROM node:18-alpine  

# Set the working directory in the container
WORKDIR /app  

# Copy package.json and install dependencies
COPY package*.json ./  
RUN npm install  

# Copy the entire project into the container
COPY . .  

# Expose the port your app runs on
EXPOSE 3000  

# Start the app
CMD ["node", "app.js"]
