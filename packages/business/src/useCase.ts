export abstract class UseCase<I, O> {
  abstract exec (input: I): Promise<O>
}
