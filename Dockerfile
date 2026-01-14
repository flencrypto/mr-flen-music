# Use nginx alpine for a lightweight web server
FROM nginx:alpine

# Copy the public directory to nginx html directory
COPY public/ /usr/share/nginx/html/

# Copy root level HTML and JS files that are part of the app
COPY index.html /usr/share/nginx/html/
COPY audius.js /usr/share/nginx/html/
COPY auth.js /usr/share/nginx/html/
COPY format-time.js /usr/share/nginx/html/
COPY spotify.js /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY playlist.html /usr/share/nginx/html/
COPY releases.html /usr/share/nginx/html/
COPY track.html /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
