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
    const startTime = performance.now();

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    const duration = performance.now() - startTime;

    return {
        bytes: buffer.byteLength,
        duration
    };
}


console.log(`Target URL: ${url}`)
console.log('Starting download speed test...\n');

try {
    let totalBytes = 0;
    let totalDuration = 0;
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
    console.error(`Download failed: ${error.message}`);
    process.exit(1);
}

