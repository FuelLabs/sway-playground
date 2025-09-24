#!/bin/bash

# Integration test script to validate all examples build successfully
# This script ensures that all Sway examples in examples.json can be compiled
# before deploying the Docker image.

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
EXAMPLES_FILE="$PROJECT_ROOT/examples.json"
SWAYPAD_DIR="$PROJECT_ROOT/projects/swaypad"
MAIN_SW_PATH="$SWAYPAD_DIR/src/main.sw"

echo "🧪 Starting integration tests for Sway examples..."
echo "Project root: $PROJECT_ROOT"
echo "Examples file: $EXAMPLES_FILE"
echo "Swaypad directory: $SWAYPAD_DIR"

# Check if required files exist
if [ ! -f "$EXAMPLES_FILE" ]; then
    echo -e "${RED}❌ Error: examples.json not found at $EXAMPLES_FILE${NC}"
    exit 1
fi

if [ ! -d "$SWAYPAD_DIR" ]; then
    echo -e "${RED}❌ Error: swaypad project directory not found at $SWAYPAD_DIR${NC}"
    exit 1
fi

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ Error: jq is required but not installed. Please install jq.${NC}"
    exit 1
fi

# Check if forc is available
if ! command -v forc &> /dev/null; then
    echo -e "${RED}❌ Error: forc is not available. Make sure Fuel toolchain is installed.${NC}"
    exit 1
fi

# Backup original main.sw if it exists
if [ -f "$MAIN_SW_PATH" ]; then
    cp "$MAIN_SW_PATH" "$MAIN_SW_PATH.backup"
    echo "📦 Backed up original main.sw"
fi

# Function to restore original main.sw
restore_main_sw() {
    if [ -f "$MAIN_SW_PATH.backup" ]; then
        mv "$MAIN_SW_PATH.backup" "$MAIN_SW_PATH"
        echo "🔄 Restored original main.sw"
    fi
}

# Set up trap to restore main.sw on exit
trap restore_main_sw EXIT

# Parse examples from JSON and test each one
total_examples=0
passed_examples=0
failed_examples=()

echo -e "${YELLOW}📖 Reading examples from JSON...${NC}"

# Get list of Sway examples
sway_examples=$(jq -r '.sway[] | @base64' "$EXAMPLES_FILE")

for example_b64 in $sway_examples; do
    example=$(echo "$example_b64" | base64 --decode)
    name=$(echo "$example" | jq -r '.name')
    filename=$(echo "$example" | jq -r '.filename')
    code=$(echo "$example" | jq -r '.code')

    total_examples=$((total_examples + 1))

    echo -e "\n${YELLOW}🔨 Testing example: $name ($filename)${NC}"

    # Write the example code to main.sw
    echo "$code" > "$MAIN_SW_PATH"

    # Try to build the project
    if (cd "$SWAYPAD_DIR" && forc build --silent); then
        echo -e "${GREEN}✅ $name: BUILD SUCCESSFUL${NC}"
        passed_examples=$((passed_examples + 1))
    else
        echo -e "${RED}❌ $name: BUILD FAILED${NC}"
        failed_examples+=("$name")
    fi
done

echo -e "\n${YELLOW}📊 Test Results Summary:${NC}"
echo "Total examples tested: $total_examples"
echo -e "Passed: ${GREEN}$passed_examples${NC}"
echo -e "Failed: ${RED}$((total_examples - passed_examples))${NC}"

if [ ${#failed_examples[@]} -gt 0 ]; then
    echo -e "\n${RED}❌ Failed examples:${NC}"
    for failed in "${failed_examples[@]}"; do
        echo "  - $failed"
    done
    echo -e "\n${RED}❌ Integration tests FAILED. Docker image deployment should be blocked.${NC}"
    exit 1
else
    echo -e "\n${GREEN}✅ All examples built successfully! Ready for deployment.${NC}"
    exit 0
fi