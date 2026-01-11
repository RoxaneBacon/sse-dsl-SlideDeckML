#!/usr/bin/env node

/**
 * Standalone script to start the Quiz/Poll server
 * Usage: node start-server.js [port]
 * Default port: 4433
 */

const path = require('path');
const { fork } = require('child_process');

// Get port from command line or use default
const port = process.argv[2] || 4433;

console.log(`Starting Quiz/Poll server on port ${port}...`);

// Path to the server file
const serverPath = path.join(__dirname, 'server.js');

// Fork the server process
const serverProcess = fork(serverPath, [], {
    env: { ...process.env, PORT: port.toString() },
    stdio: 'inherit'
});

// Handle server errors
serverProcess.on('error', (error) => {
    console.error('Failed to start quiz server:', error);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    if (code !== 0) {
        console.log(`Quiz server exited with code ${code}`);
        process.exit(code || 0);
    }
});

// Handle termination signals
process.on('SIGINT', () => {
    console.log('\nShutting down Quiz/Poll server...');
    serverProcess.kill();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down Quiz/Poll server...');
    serverProcess.kill();
    process.exit(0);
});
