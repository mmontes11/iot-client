export class URLBuilder {
    constructor(host, restResource) {
        this.resourceUrl = `${host}/api/${restResource}`;
    }
    build(path) {
        return `${this.resourceUrl}/${path}`
    }
}