class UrlMatcher {
    constructor(urls) {
        if (!urls || typeof urls !== 'object') {
            throw new Error('Invalid URLs data structure');
        }
        this.urls = urls;
    }

    findExactMatch(productName) {
        return this.urls[productName];
    }

    findFuzzyMatch(productName) {
        const normalizedName = this.normalizeString(productName);
        
        return Object.entries(this.urls).find(([key]) => 
            this.normalizeString(key).includes(normalizedName) ||
            normalizedName.includes(this.normalizeString(key))
        )?.[1];
    }

    normalizeString(str) {
        return str.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .trim();
    }

    findBestMatch(productName) {
        return this.findExactMatch(productName) || 
               this.findFuzzyMatch(productName);
    }
}

export default UrlMatcher; 