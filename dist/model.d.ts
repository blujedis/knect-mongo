import { ObjectId, UpdateOneOptions, CollectionInsertOneOptions, FindOneAndDeleteOption } from 'mongodb';
import { IDoc, IModelSaveResult } from './types';
import { initDocument } from './document';
import { ObjectSchema } from 'yup';
export declare class Model<S extends IDoc> {
    private _doc;
    private _Document;
    _id: ObjectId;
    constructor(doc: S, document: ReturnType<typeof initDocument>);
    /**
     * Creates and persists instance to database.
     *
     * @param options Mongodb create options.
     */
    private create;
    /**
     * Updates a single record by id.
     *
     * @param options the update options.
     */
    private update;
    /**
     * Saves changes persisting instance in database.
     *
     * @param options MongoDB update options.
     */
    save(options?: UpdateOneOptions | CollectionInsertOneOptions): Promise<IModelSaveResult<S>>;
    /**
     * Deletes document persisting in database.
     *
     * @param options Mongodb delete options.
     */
    delete(options?: FindOneAndDeleteOption): Promise<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>;
    /**
     * Validates instance against schema.
     *
     * @param schema optional schema to verify by or uses defined.
     */
    validate(schema?: ObjectSchema<S>): IDoc;
    /**
     * Checks if instance is valid against schema.
     *
     * @param schema optional schema to verify by or uses defined.
     */
    isValid(schema?: ObjectSchema<S>): boolean;
}
