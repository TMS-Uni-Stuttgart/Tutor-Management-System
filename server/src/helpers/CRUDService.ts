/**
 * Interface which makes sure all services have the same outline.
 *
 * @param RES Type of the outgoing DTO objects.
 * @param DTO Type of the incoming DTO objects.
 * @param DOC Type of the document objects.
 *
 * Example:
 * ```
 * class StudentService implements ServiceInterface<Student, StudentDTO, StudentDocument>
 * ```
 */
export interface CRUDService<RES, DTO, DOC> {
    findAll(): Promise<DOC[]>;

    findById(id: string): Promise<DOC>;

    create(dto: DTO): Promise<RES>;

    update(id: string, dto: DTO): Promise<RES>;

    delete(id: string): Promise<DOC>;
}
