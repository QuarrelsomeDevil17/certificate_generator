#!/bin/bash

# Certificate Generator Setup Script
echo "Setting up Certificate Generator..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python 3 found"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Please run this script from the certificate_generator directory"
    exit 1
fi

echo "Found package.json"

# Create necessary directories
mkdir -p generated-certificates
mkdir -p exports
mkdir -p assets

echo "Created project directories"

# Start the development server
echo "Starting development server..."
echo "Open http://localhost:8000 in your browser"
echo "Test page available at http://localhost:8000/test.html"
echo "Demo page available at http://localhost:8000/demo.html"
echo ""
echo "Press Ctrl+C to stop the server"

python3 -m http.server 8000
