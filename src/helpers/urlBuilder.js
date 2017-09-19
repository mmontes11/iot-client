export class URLBuilder {
    constructor(host, resource) {
        this.resourceUrl = `${host}/api/${resource}`;
    }
    build(path) {
        return `${this.resourceUrl}/${path}`
    }
}