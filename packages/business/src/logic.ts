export abstract class Logic<I, O> {
  abstract call (input: I): Promise<O>
}
