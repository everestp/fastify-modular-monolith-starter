#!/usr/bin/env node

const action = process.argv[2] ?? 'up';

console.log(`Starter migration runner: action=${action}.`);
console.log('This project uses in-memory repositories in the starter implementation.');
console.log('No PostgreSQL migration execution is required for local tests.');
