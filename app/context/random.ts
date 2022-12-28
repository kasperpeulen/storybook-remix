export interface Random {
  getNumber(): number;
}

export const liveRandom: Random = {
  getNumber: Math.random,
};

export class TestRandom implements Random {
  constructor(private seed: number = 1) {}

  // From https://stackoverflow.com/a/19303725
  // Not sure if it is good 😅, but seems to do the job for testing.
  getNumber = () => {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  };
}
