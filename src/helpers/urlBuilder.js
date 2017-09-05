export class URLBuilder {
    constructor(host, restResource) {
        this.resourceUrl = `${host}/api/${restResource}`;
    }
    build(path, params = {}) {
        return `${this.resourceUrl}/${path}`
    }
}