#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import path from 'path';
import os from 'os';

// Path to MCP config
const mcpConfigPath = path.join(os.homedir(), '.gemini/antigravity/mcp_config.json');

// Read config
let config;
try {
    const configData = fs.readFileSync(mcpConfigPath, 'utf8');
    config = JSON.parse(configData);
} catch (error) {
    console.error('Error reading MCP config:', error.message);
    process.exit(1);
}

// Extract API key for OpenRouter
const openRouterConfig = config.mcpServers && config.mcpServers.openrouter;
const apiKey = openRouterConfig && openRouterConfig.env && openRouterConfig.env.OPENAI_API_KEY;

if (!apiKey) {
    console.error('Error: Could not find OPENAI_API_KEY in openrouter config at', mcpConfigPath);
    process.exit(1);
}

// Get prompt from args
const prompt = process.argv.slice(2).join(' ');

if (!prompt) {
    console.log('Usage: node ask-glm.js "Your question here"');
    process.exit(0);
}

// Prepare request
const postData = JSON.stringify({
    model: 'z-ai/glm-5',
    messages: [{ role: 'user', content: prompt }]
});

const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

// Make request
const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0].message.content;
                console.log(content);
            } catch (e) {
                console.error('Error parsing response:', e.message);
                console.log('Raw response:', data);
            }
        } else {
            console.error(`Request failed with status: ${res.statusCode}`);
            console.error('Response:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.write(postData);
req.end();
