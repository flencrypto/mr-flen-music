# Docker Deployment Guide

## Overview

This Docker setup containerizes the Mr.FLEN Music application as a static web application served by nginx.

## Building the Docker Image

To build the Docker image:

```bash
docker build -t mr-flen-music:latest .
```

This will create a lightweight (~62MB) Docker image containing:
- nginx Alpine Linux base image  
- All static web files from the `public/` directory (HTML, JavaScript, CSS, manifest, etc.)

## Running the Container

To run the container:

```bash
docker run -d -p 8080:80 --name mr-flen-music mr-flen-music:latest
```

This will:
- Start the container in detached mode (`-d`)
- Map port 8080 on your host to port 80 in the container (`-p 8080:80`)
- Name the container `mr-flen-music` (`--name`)

Access the application at: `http://localhost:8080`

## Docker Commands

### Stop the container
```bash
docker stop mr-flen-music
```

### Start the container
```bash
docker start mr-flen-music
```

### Remove the container
```bash
docker rm mr-flen-music
```

### View container logs
```bash
docker logs mr-flen-music
```

### View running containers
```bash
docker ps
```

## Environment Variables

The application configuration is loaded from the HTML files. If you need to customize API keys or other configuration:

1. Create a `.env` file based on `.env.example`
2. Update the configuration in the relevant HTML/JavaScript files before building the image

## Image Details

- **Base Image**: nginx:alpine
- **Size**: ~62MB
- **Exposed Port**: 80
- **Working Directory**: `/usr/share/nginx/html/`

## Production Deployment

For production deployment, consider:

1. Using a reverse proxy (like Traefik or nginx) in front of the container
2. Enabling HTTPS with SSL certificates
3. Using Docker Compose for easier management
4. Setting up health checks
5. Configuring resource limits

Example with custom port:
```bash
docker run -d -p 3000:80 --name mr-flen-music mr-flen-music:latest
```

## Troubleshooting

### Container won't start
Check the logs:
```bash
docker logs mr-flen-music
```

### Port already in use
Change the host port in the `docker run` command:
```bash
docker run -d -p 9090:80 --name mr-flen-music mr-flen-music:latest
```

### Rebuild after changes
```bash
docker build --no-cache -t mr-flen-music:latest .
```
