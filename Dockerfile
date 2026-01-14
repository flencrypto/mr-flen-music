# Use nginx alpine for a lightweight web server
FROM nginx:alpine

# Copy the public directory to nginx html directory
# This contains the main web application
COPY public/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
