export class URLBuilder {
    constructor(url, resource) {
        this.resourceUrl = `${url}/${resource}`;
    }
    build(path) {
        return `${this.resourceUrl}/${path}`
    }
}