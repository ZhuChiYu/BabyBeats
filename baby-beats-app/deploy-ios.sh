#!/bin/bash

##############################################################################
# BabyBeats iOS Build and Deploy Script
# 
# This script automates the iOS build and deployment process using EAS
# 
# Usage:
#   ./deploy-ios.sh [profile]
#
# Profiles:
#   development - Development build (simulator)
#   preview     - Internal testing (TestFlight)
#   production  - Production build (App Store)
#
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROFILE=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

##############################################################################
# Check Prerequisites
##############################################################################

check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        error "Node.js is not installed"
    fi
    
    # Check npm
    if ! command_exists npm; then
        error "npm is not installed"
    fi
    
    # Check EAS CLI
    if ! command_exists eas; then
        warning "EAS CLI not installed, installing now..."
        npm install -g eas-cli
    fi
    
    # Check if logged in to Expo
    if ! eas whoami &>/dev/null; then
        warning "Not logged in to Expo"
        info "Please run: eas login"
        exit 1
    fi
    
    log "✓ Prerequisites check passed"
}

##############################################################################
# Validate Configuration
##############################################################################

validate_config() {
    log "Validating configuration..."
    
    cd "$SCRIPT_DIR"
    
    # Check app.json
    if [ ! -f "app.json" ]; then
        error "app.json not found"
    fi
    
    # Check eas.json
    if [ ! -f "eas.json" ]; then
        error "eas.json not found. Run: eas build:configure"
    fi
    
    # Validate version
    VERSION=$(node -p "require('./app.json').expo.version")
    BUILD_NUMBER=$(node -p "require('./app.json').expo.ios.buildNumber || '1'")
    
    if [ -z "$VERSION" ]; then
        error "Version not set in app.json"
    fi
    
    info "Current version: $VERSION ($BUILD_NUMBER)"
    
    log "✓ Configuration validated"
}

##############################################################################
# Update Version
##############################################################################

update_version() {
    if [ "$PROFILE" = "production" ]; then
        log "Current version: $VERSION (build $BUILD_NUMBER)"
        
        read -p "Update version? (y/n) " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "Enter new version (e.g., 1.0.1): " NEW_VERSION
            read -p "Enter new build number (e.g., 2): " NEW_BUILD
            
            # Update app.json
            node -e "
                const fs = require('fs');
                const config = require('./app.json');
                config.expo.version = '$NEW_VERSION';
                config.expo.ios.buildNumber = '$NEW_BUILD';
                fs.writeFileSync('app.json', JSON.stringify(config, null, 2));
            "
            
            VERSION=$NEW_VERSION
            BUILD_NUMBER=$NEW_BUILD
            
            log "✓ Version updated to $VERSION ($BUILD_NUMBER)"
        fi
    fi
}

##############################################################################
# Pre-build Checks
##############################################################################

pre_build_checks() {
    log "Running pre-build checks..."
    
    cd "$SCRIPT_DIR"
    
    # Install dependencies
    log "Installing dependencies..."
    npm install
    
    # Check for TypeScript errors
    if command_exists tsc; then
        log "Checking TypeScript..."
        npx tsc --noEmit || warning "TypeScript errors found"
    fi
    
    log "✓ Pre-build checks completed"
}

##############################################################################
# Build
##############################################################################

build_app() {
    log "Building iOS app (profile: $PROFILE)..."
    
    cd "$SCRIPT_DIR"
    
    # Clear EAS cache (optional)
    if [ "$CLEAR_CACHE" = "true" ]; then
        log "Clearing EAS cache..."
        eas build --platform ios --profile $PROFILE --clear-cache
    else
        eas build --platform ios --profile $PROFILE --non-interactive
    fi
    
    log "✓ Build completed"
}

##############################################################################
# Submit to App Store
##############################################################################

submit_to_app_store() {
    if [ "$PROFILE" = "production" ] && [ "$AUTO_SUBMIT" = "true" ]; then
        log "Submitting to App Store..."
        
        read -p "Submit to App Store Connect? (y/n) " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            eas submit --platform ios --latest
            log "✓ Submitted to App Store Connect"
        fi
    fi
}

##############################################################################
# Post-build Actions
##############################################################################

post_build_actions() {
    log "Post-build actions..."
    
    # Create git tag
    if [ "$PROFILE" = "production" ] && command_exists git; then
        read -p "Create git tag v$VERSION? (y/n) " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git tag -a "v$VERSION" -m "Release version $VERSION"
            git push origin "v$VERSION"
            log "✓ Git tag created"
        fi
    fi
    
    log "✓ Post-build actions completed"
}

##############################################################################
# Show Instructions
##############################################################################

show_instructions() {
    echo ""
    log "═══════════════════════════════════════════════════════════"
    log "🎉 Build process completed!"
    log "═══════════════════════════════════════════════════════════"
    echo ""
    
    if [ "$PROFILE" = "production" ]; then
        info "Next steps for App Store release:"
        echo "  1. Go to App Store Connect (https://appstoreconnect.apple.com)"
        echo "  2. Select your app: BabyBeats"
        echo "  3. Go to TestFlight tab"
        echo "  4. Wait for build to process (~10-30 minutes)"
        echo "  5. Add build to TestFlight for internal testing"
        echo "  6. After testing, submit for App Store review"
        echo ""
        
        info "TestFlight checklist:"
        echo "  ☐ Build appears in TestFlight"
        echo "  ☐ Internal testing completed"
        echo "  ☐ External testing configured (if needed)"
        echo "  ☐ All features tested"
        echo "  ☐ Crash reports reviewed"
        echo ""
        
        info "App Store submission checklist:"
        echo "  ☐ Screenshots prepared (3 sizes)"
        echo "  ☐ App description updated"
        echo "  ☐ Keywords optimized"
        echo "  ☐ Privacy policy URL added"
        echo "  ☐ Support URL added"
        echo "  ☐ Test account credentials provided"
        echo ""
    elif [ "$PROFILE" = "preview" ]; then
        info "Next steps for TestFlight preview:"
        echo "  1. Build will be uploaded to TestFlight automatically"
        echo "  2. Wait for build processing"
        echo "  3. Add to internal testing group"
        echo "  4. Install TestFlight app on your device"
        echo "  5. Test the build"
        echo ""
    else
        info "Development build completed"
        echo "  • Install Expo Go on your device"
        echo "  • Scan the QR code to test"
        echo ""
    fi
    
    info "Useful commands:"
    echo "  • Check build status: eas build:list"
    echo "  • View build logs: eas build:view [build-id]"
    echo "  • Submit to App Store: eas submit -p ios"
    echo "  • Update over-the-air: eas update --branch production"
    echo ""
}

##############################################################################
# Main
##############################################################################

main() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║          BabyBeats iOS Build & Deploy Script              ║"
    echo "║                    Profile: $PROFILE                     ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    # Confirm production build
    if [ "$PROFILE" = "production" ]; then
        warning "You are building for PRODUCTION (App Store)!"
        read -p "Continue? (yes/no) " -r
        echo
        if [[ ! $REPLY = "yes" ]]; then
            info "Build cancelled"
            exit 0
        fi
    fi
    
    check_prerequisites
    validate_config
    update_version
    pre_build_checks
    build_app
    submit_to_app_store
    post_build_actions
    show_instructions
}

# Parse options
while [[ $# -gt 0 ]]; do
    case $1 in
        --clear-cache)
            CLEAR_CACHE=true
            shift
            ;;
        --auto-submit)
            AUTO_SUBMIT=true
            shift
            ;;
        *)
            PROFILE=$1
            shift
            ;;
    esac
done

# Run main
main

