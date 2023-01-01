export interface Clock {
  now(): Date;

  sleep(ms: number): Promise<void>;
}

export class LiveClock {
  now = () => new Date();
  sleep = sleep;
}

export const sleep = (ms: number) => {
  let cancel;
  const promise: Promise<void> & { cancel?: () => void } = new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    cancel = () => clearTimeout(timer);
  });
  promise.cancel = cancel;
  return promise;
};

export class TestClock {
  constructor(private date: Date) {}

  now = () => {
    this.date = new Date(this.date.getTime() + 1000 * 60);
    return this.date;
  };

  sleep = async (ms: number) => {
    const time = this.date.getTime();
    this.date = new Date(time + ms);
  };
}
