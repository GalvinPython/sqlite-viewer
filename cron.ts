// This is the cron task to clear the temp folder at midnight every day
// This is so that files that failed to upload or had an unexpected error are not left in the temp folder

import { CronJob } from 'cron';
import fs from 'fs';
import path from 'path';

// Do not clear the entire folder in case there are files that are still being uploaded
const clearTempFolder = new CronJob('0 0 0 * * *', () => {
    const tmpFolder = path.join(__dirname, 'tmp');
    fs.readdir(tmpFolder, (err, files) => {
        if (err) {
            console.error(err);
        } else {
            files.forEach(file => {
                const filePath = path.join(tmpFolder, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error(err);
                    } else {
                        const now = Date.now();
                        const fileAge = (now - stats.mtimeMs) / 1000 / 60; // age in minutes
                        if (fileAge > 5) {
                            fs.unlink(filePath, err => {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        }
                    }
                });
            });
        }
    });
});
clearTempFolder.start();

console.log('Cron job to clear temp folder started');
