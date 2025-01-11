# Use Ubuntu 24.04 (Noble Numbat) as base image
FROM ubuntu:24.04

# Install Python3 and pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg

# Set working directory
WORKDIR /app

# Copy just the requirements file first
COPY requirements.txt /app/

# Install Python dependencies
RUN pip3 install -r requirements.txt --break-system-packages

# Copy the rest of the application
COPY . /app/

# Command to run the application
CMD ["python3", "./backend.py", "--port", "80"]
