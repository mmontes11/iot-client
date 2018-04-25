import { Service } from "./service";

export class EventService extends Service {
  constructor(client) {
    super(client, "event");
  }
  async create(event) {
    return this.post(undefined, undefined, event);
  }
}
