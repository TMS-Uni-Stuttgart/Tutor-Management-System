import { NotFoundException } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';

export abstract class CRUDModel<DTO, RET, CREATE_DTO = DTO> {
  /**
   * Creates a __new__ object from the given DTO.
   *
   * @returns Created object.
   */
  abstract fromDTO(dto: CREATE_DTO): CRUDModel<DTO, RET>;

  /**
   * Updates this document with the given information.
   *
   * @param dto Information to update this document with.
   */
  abstract updateFromDTO(this: CRUDDocument<DTO, RET>, dto: DTO): void;

  /**
   * Returns the DTO representation of this document.
   *
   * @returns DTO representation of this document.
   */
  abstract toDTO(this: CRUDDocument<DTO, RET>): RET;
}

type CRUDDocument<DTO, RET> = DocumentType<CRUDModel<DTO, RET>>;
export type CRUDModelType<DTO, RET, MOD extends CRUDModel<DTO, RET>> = ModelType<MOD> & MOD;

// TODO: Rename to CrudService & rename interface.
export abstract class CRUD<DTO, RET, MOD extends CRUDModel<DTO, RET>>
  implements CRUDService<RET, DTO, DocumentType<MOD>> {
  constructor(private readonly model: CRUDModelType<DTO, RET, MOD>) {}

  /**
   * @returns All document for the model saved in the database.
   */
  async findAll(): Promise<DocumentType<MOD>[]> {
    const docs = await this.model.find().exec();

    return docs;
  }

  /**
   * Searches for a document with the given ID and returns it.
   *
   * @param id ID to search for.
   *
   * @returns Document with the given ID.
   *
   * @throws `NotFoundException` - If no document with the given ID could be found.
   */
  async findById(id: string): Promise<DocumentType<MOD>> {
    const doc: DocumentType<MOD> | null = await this.model.findById(id).exec();

    if (!doc) {
      throw new NotFoundException(
        `Document with the ID '${id}' could not be found. Model: ${this.model.name}`
      );
    }

    return doc;
  }

  /**
   * Creates a new document from the given information and saves it to the database. The created document is returned.
   *
   * @param dto Information to create the document with.
   *
   * @returns Created document.
   */
  async create(dto: DTO): Promise<RET> {
    const doc = this.model.fromDTO(dto);
    const created = await this.model.create(doc as any);

    return created.toDTO();
  }

  /**
   * Updates the document with the given ID and the given information.
   *
   * The document will be saved and the updated version will be returned in the end.
   *
   * @param id ID of the document to update.
   * @param dto Information to update the document with.
   *
   * @returns The updated document.
   *
   * @throws `NotFoundException` - If there is no document of the model available with the given ID.
   */
  async update(id: string, dto: DTO): Promise<RET> {
    const doc = await this.findById(id);
    doc.updateFromDTO(dto);

    const updated = (await doc.save()) as DocumentType<MOD>;

    return updated.toDTO();
  }

  /**
   * Deletes the document of the model with the given ID, if available, and returns the deleted document.
   *
   * @param id ID of the document to delete
   *
   * @returns Deleted document.
   *
   * @throws `NotFoundException` - If no document of the model with the given ID could be found.
   */
  async delete(id: string): Promise<DocumentType<MOD>> {
    const doc = await this.findById(id);

    return doc.remove() as Promise<DocumentType<MOD>>;
  }
}

/**
 * Interface which makes sure all services have the same outline.
 *
 * @param DTO Type of the incoming DTO objects.
 * @param RET Type of the outgoing DTO objects.
 * @param DOC Type of the document objects.
 *
 * Example:
 * ```
 * class StudentService implements ServiceInterface<Student, StudentDTO, StudentDocument>
 * ```
 */
export interface CRUDService<RET, DTO, DOC> {
  findAll(): Promise<DOC[]>;

  findById(id: string): Promise<DOC>;

  create(dto: DTO): Promise<RET>;

  update(id: string, dto: DTO): Promise<RET>;

  delete(id: string): Promise<DOC>;
}
