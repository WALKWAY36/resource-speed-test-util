const REQUEST_COUNT = 10;
const TIMEOUT_MS = 30_000;
const ACCESS_PROTOCOLS = ["http:", "https:"]

const url = process.argv[2];

function parseUrl(input) {
    if (!input) {
        throw new Error('URL is required. Usage: node index.js <url>');
    }
    const parsedUrl = new URL(url);

    if (!ACCESS_PROTOCOLS.includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS are supported')
    }
    return url
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

    return {
        bytes,
        duration: performance.now() - startTime
    };
}

async function runSpeedTest(url, requestCount) {
    let totalBytes = 0;
    let totalDuration = 0;

    for (let i = 0; i < requestCount; i++) {
        const { bytes, duration } = await download(url);

        totalBytes += bytes;
        totalDuration += duration;

        console.log(
            `Request ${i + 1}/${requestCount}: ` +
            `${bytes} bytes | ${duration.toFixed(2)} ms`
        );
    }

    return {
        requestCount,
        totalBytes,
        totalDuration
    };
}

function calculateResults(stats) {
    const { requestCount, totalBytes, totalDuration } = stats;

    const totalSeconds = totalDuration / 1000;

    return {
        requestCount,
        totalBytes,
        totalMegabytes: totalBytes / 1_000_000,
        totalSeconds,
        averageDuration: totalDuration / requestCount,
        speedMbps: (totalBytes * 8) / totalSeconds / 1_000_000
    };
}

function printResults(results) {
    console.log('\n========== Results ==========');
    console.log(`Total requests: ${results.requestCount}`);
    console.log(`Total downloaded: ${results.totalMegabytes.toFixed(2)} MB`);
    console.log(`Total time: ${results.totalSeconds.toFixed(2)} s`);
    console.log(`Average request time: ${results.averageDuration.toFixed(2)} ms`);
    console.log(`Download speed: ${results.speedMbps.toFixed(2)} Mbps`);
    console.log('=============================');
}

async function main() {
    const url = parseUrl(process.argv[2]);

    console.log(`Target URL: ${url}`);
    console.log('Starting download speed test...\n');

    const stats = await runSpeedTest(url, REQUEST_COUNT);
    const results = calculateResults(stats);

    printResults(results);
}

main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
});