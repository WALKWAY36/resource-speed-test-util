const url = process.argv[2];

if (!url) {
    console.error('Error: URL is required')
    process.exit(1)
}

try {
    const accessProtocols = ["http:", "https:"]

    const parsedUrl = new URL(url);

    if (!accessProtocols.includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS are supported')
    }
} catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
}

console.log(`Target URL: ${url}`)