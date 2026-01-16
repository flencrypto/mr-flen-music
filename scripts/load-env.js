#!/usr/bin/env node
/**
 * Simple utility to load environment variables from .env file
 * Usage: require('./load-env') at the top of any script that needs .env
 */
const path = require("path");

// Load .env from project root
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
