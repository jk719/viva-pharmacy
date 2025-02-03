class ProgressTracker {
    constructor(total, batchSize = 50) {
        this.total = total;
        this.batchSize = batchSize;
        this.processed = 0;
        this.updated = 0;
        this.skipped = 0;
        this.errors = 0;
        this.startTime = Date.now();
    }

    increment(type) {
        switch (type) {
            case 'processed':
                this.processed += this.batchSize;
                break;
            case 'updated':
                this.updated++;
                break;
            case 'skipped':
                this.skipped++;
                break;
            case 'error':
                this.errors++;
                break;
        }
    }

    getProgress() {
        const percent = Math.min(100, Math.round((this.processed / this.total) * 100));
        const elapsed = (Date.now() - this.startTime) / 1000;
        const rate = this.processed / elapsed;
        const remaining = Math.round((this.total - this.processed) / rate);

        return {
            percent,
            processed: this.processed,
            total: this.total,
            updated: this.updated,
            skipped: this.skipped,
            errors: this.errors,
            elapsed: Math.round(elapsed),
            remaining
        };
    }

    logProgress() {
        const progress = this.getProgress();
        console.log(
            `Progress: ${progress.percent}% (${progress.processed}/${progress.total}) ` +
            `| Updated: ${progress.updated} | Skipped: ${progress.skipped} | Errors: ${progress.errors} ` +
            `| Time: ${progress.elapsed}s elapsed, ~${progress.remaining}s remaining`
        );
    }

    getSummary() {
        const progress = this.getProgress();
        return {
            totalTime: progress.elapsed,
            updated: progress.updated,
            skipped: progress.skipped,
            errors: progress.errors,
            averageRate: Math.round(this.total / progress.elapsed)
        };
    }
}

export default ProgressTracker; 