class ProgressLogger {
    constructor(options = {}) {
        this.totalItems = options.totalItems || 0;
        this.batchSize = options.batchSize || 50;
        this.startTime = Date.now();
        this.stats = {
            processed: 0,
            updated: 0,
            skipped: 0,
            errors: 0,
            missing: 0
        };
        this.logFrequency = options.logFrequency || this.batchSize;
    }

    update(type, count = 1) {
        if (this.stats[type] !== undefined) {
            this.stats[type] += count;
        }

        if (type === 'processed' && this.stats.processed % this.logFrequency === 0) {
            this.logProgress();
        }
    }

    logProgress() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const percent = this.totalItems ? 
            Math.round((this.stats.processed / this.totalItems) * 100) : 0;
        const rate = this.stats.processed / elapsed;
        const remaining = this.totalItems ? 
            Math.round((this.totalItems - this.stats.processed) / rate) : 'unknown';

        console.log(
            `Progress: ${percent}% (${this.stats.processed}/${this.totalItems || '?'}) | ` +
            `Updated: ${this.stats.updated} | Skipped: ${this.stats.skipped} | ` +
            `Errors: ${this.stats.errors} | ` +
            `Time: ${Math.round(elapsed)}s elapsed, ~${remaining}s remaining`
        );
    }

    getSummary() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        return {
            ...this.stats,
            timeElapsed: Math.round(elapsed),
            averageRate: Math.round(this.stats.processed / elapsed)
        };
    }

    logSummary() {
        const summary = this.getSummary();
        console.log('\nOperation Summary:');
        console.log(`- Total Processed: ${summary.processed}`);
        console.log(`- Updated: ${summary.updated}`);
        console.log(`- Skipped: ${summary.skipped}`);
        console.log(`- Errors: ${summary.errors}`);
        console.log(`- Missing: ${summary.missing}`);
        console.log(`- Time Elapsed: ${summary.timeElapsed}s`);
        console.log(`- Average Rate: ${summary.averageRate} items/s`);
    }
}

export default ProgressLogger; 