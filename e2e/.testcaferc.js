let os = require("os");

module.exports = {
    skipJsErrors: true,
    pageLoadTimeout: 30000,
    browsers: "chrome",
    screenshots: {
        "path": "./artifacts/",
        "takeOnFails": true,
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.png"
    },
    videoPath: "./artifacts/videos",
    videoOptions: {
        "singleFile": false,
        "failedOnly": true,
        "pathPattern": "${DATE}_${TIME}/test-${TEST_INDEX}/${USERAGENT}/${FILE_INDEX}.mp4"
    }
}