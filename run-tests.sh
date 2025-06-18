#!/bin/bash

echo "🧪 Inner AI Clone - Test Suite Runner"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to run tests with nice output
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "\n${YELLOW}Running $test_name...${NC}"
    if eval $test_command; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        return 0
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        return 1
    fi
}

# Check if dependencies are installed
echo "Checking test dependencies..."
if ! command -v npx &> /dev/null; then
    echo -e "${RED}npx not found. Please install npm first.${NC}"
    exit 1
fi

# Install test dependencies if needed
if [ ! -d "node_modules/@playwright" ] || [ ! -d "node_modules/jest" ]; then
    echo "Installing test dependencies..."
    npm install --save-dev @playwright/test puppeteer jest @testing-library/react @testing-library/jest-dom
    npx playwright install
fi

# Run different test suites
echo -e "\n${YELLOW}Starting Test Suites${NC}"
echo "===================="

# Unit Tests
if [ "$1" == "unit" ] || [ -z "$1" ]; then
    run_test "Unit Tests" "npm run test:unit"
fi

# Integration Tests
if [ "$1" == "integration" ] || [ -z "$1" ]; then
    run_test "Integration Tests" "npm run test:integration"
fi

# E2E Tests
if [ "$1" == "e2e" ] || [ -z "$1" ]; then
    # Start the dev server in background if not running
    if ! curl -s http://localhost:3000 > /dev/null; then
        echo "Starting development server..."
        npm run dev &
        DEV_PID=$!
        echo "Waiting for server to start..."
        sleep 10
    fi
    
    run_test "E2E Tests (Playwright)" "npx playwright test"
    
    # Kill dev server if we started it
    if [ ! -z "$DEV_PID" ]; then
        kill $DEV_PID 2>/dev/null
    fi
fi

# Puppeteer smoke test
if [ "$1" == "puppeteer" ] || [ -z "$1" ]; then
    run_test "Puppeteer Smoke Test" "node puppeteer-test.js"
fi

echo -e "\n${GREEN}Test suite completed!${NC}"
echo "====================="

# Generate test report
if [ -d "playwright-report" ]; then
    echo -e "\n${YELLOW}Playwright HTML report available at:${NC}"
    echo "playwright-report/index.html"
fi

# Usage instructions
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo -e "\nUsage: ./run-tests.sh [test-type]"
    echo "test-type can be:"
    echo "  unit        - Run only unit tests"
    echo "  integration - Run only integration tests"
    echo "  e2e         - Run only E2E tests"
    echo "  puppeteer   - Run only Puppeteer tests"
    echo "  (empty)     - Run all tests"
fi