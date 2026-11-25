const REQUEST_COUNT = 10;

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

async function download(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    return buffer.byteLength;
}


console.log(`Target URL: ${url}`)
console.log('Starting download speed test...\n');

try {
    for (let i = 0; i < REQUEST_COUNT; i++) {
        const bytes = await download(url);

        console.log(`Request ${i + 1}/${REQUEST_COUNT}: ${bytes} bytes`);
    }
} catch (error) {
    console.error(`Download failed: ${error.message}`);
    process.exit(1);
}

