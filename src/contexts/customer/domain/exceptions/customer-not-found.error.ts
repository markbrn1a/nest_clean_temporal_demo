export class CustomerNotFoundError extends Error {
  constructor(id: string) {
    super(`Customer with ID '${id}' not found`);
    this.name = 'CustomerNotFoundError';
  }
}
