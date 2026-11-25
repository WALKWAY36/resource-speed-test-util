const REQUEST_COUNT = 10;
const TIMEOUT_MS = 30_000;
const ACCESS_PROTOCOLS = ["http:", "https:"]

const url = process.argv[2];


if (!url) {
    console.error('Error: URL is required')
    console.error('Usage: node index.js <url>');
    process.exit(1)
}

try {
    const parsedUrl = new URL(url);

    if (!ACCESS_PROTOCOLS.includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS are supported')
    }
} catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
}

async function download(url) {
    const startTime = performance.now();

    const response = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: {
            'Accept-Encoding': 'identity'
        }
    });

    if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`HTTP error: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('Response body is missing');
    }

    let bytes = 0;

    for await (const chunk of response.body) {
        bytes += chunk.byteLength;
    }

    const duration = performance.now() - startTime;

    return {
        bytes,
        duration
    };
}

let totalBytes = 0;
let totalDuration = 0;

console.log(`Target URL: ${url}`)
console.log('Starting download speed test...\n');

try {
    for (let i = 0; i < REQUEST_COUNT; i++) {
        const { bytes, duration } = await download(url);

        totalBytes += bytes;
        totalDuration += duration;

        console.log(
            `Request ${i + 1}/${REQUEST_COUNT}: ` +
            `${bytes} bytes | ${duration.toFixed(2)} ms`
        );
    }
    const averageDuration = totalDuration / REQUEST_COUNT;
    const totalSeconds = totalDuration / 1000;
    const totalMegabytes = totalBytes / 1_000_000;

    const speedMbps = (totalBytes * 8) / totalSeconds / 1_000_000;

    console.log('\n========== Results ==========');
    console.log(`Total requests: ${REQUEST_COUNT}`);
    console.log(`Total downloaded: ${totalMegabytes.toFixed(2)} MB`);
    console.log(`Total time: ${totalSeconds.toFixed(2)} s`);
    console.log(`Average request time: ${averageDuration.toFixed(2)} ms`);
    console.log(`Download speed: ${speedMbps.toFixed(2)} Mbps`);
    console.log('=============================');
} catch (error) {
    if (error.name === 'TimeoutError') {
        console.error('Error: Request timed out');
    } else {
        console.error(`Download failed: ${error.message}`);
    }
    process.exit(1);
}


