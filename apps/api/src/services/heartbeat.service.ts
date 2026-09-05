export interface PushNotifier {
  send(userId: string, title: string, body: string): Promise<void>;
}

export class NoopPushNotifier implements PushNotifier {
  async send(_userId: string, _title: string, _body: string): Promise<void> {
    return;
  }
}
