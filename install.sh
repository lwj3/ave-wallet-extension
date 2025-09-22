#!/bin/bash

# Ave Wallet Extension Installation Script

echo "🚀 Setting up Ave Wallet Extension..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the extension
echo "🔨 Building the extension..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build extension"
    exit 1
fi

echo "✅ Extension built successfully"

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Open Chrome/Edge browser"
echo "2. Go to chrome://extensions/"
echo "3. Enable 'Developer mode'"
echo "4. Click 'Load unpacked'"
echo "5. Select the 'build' folder"
echo ""
echo "For development, run: npm run dev"
echo "For production build, run: npm run build"
echo ""
echo "Happy coding! 🚀"
