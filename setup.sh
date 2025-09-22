#!/bin/bash

# Ave Wallet Extension Setup Script
echo "🚀 Setting up Ave Wallet Extension..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
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

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Infura Project ID (for RPC connections)
REACT_APP_INFURA_PROJECT_ID=your_infura_project_id

# App Configuration
REACT_APP_APP_NAME=Ave Wallet
REACT_APP_VERSION=1.0.0
EOF
    echo "✅ .env file created. Please update with your Infura Project ID."
else
    echo "✅ .env file already exists"
fi

# Build the extension
echo "🔨 Building extension..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build extension"
    exit 1
fi

echo "✅ Extension built successfully"

# Create installation instructions
echo "📋 Installation Instructions:"
echo ""
echo "1. Open Chrome/Edge browser"
echo "2. Go to chrome://extensions/"
echo "3. Enable 'Developer mode'"
echo "4. Click 'Load unpacked'"
echo "5. Select the 'build' folder from this project"
echo ""
echo "🎉 Setup complete! Your Ave Wallet Extension is ready to use."
echo ""
echo "Next steps:"
echo "- Update .env file with your Infura Project ID"
echo "- Run 'npm run dev' for development mode"
echo "- Run 'npm run build' to rebuild after changes"
