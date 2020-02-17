/**
 * Interface which makes sure all services have the same outline.
 *
 * @param T Type of the outgoing DTO objects.
 * @param D Type of the incoming DTO objects.
 * @param M Type of the document objects.
 *
 * Example:
 * ```
 * class StudentService implements ServiceInterface<Student, StudentDTO, StudentDocument>
 * ```
 */
export interface ServiceInterface<T, D, M> {
  findAll(): Promise<T[]>;

  findById(id: string): Promise<M>;

  create(dto: D): Promise<T>;
}
