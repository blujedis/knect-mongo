import { ObjectId, CollectionInsertOneOptions, FindOneAndUpdateOption } from 'mongodb';
import { IDoc, IModelSaveResult, DerivedDocument, IFindOneAndDeleteOption } from './types';
export declare class Model<S extends IDoc> {
    private _Document;
    _id: ObjectId;
    _doc: S;
    constructor(doc: S, document: DerivedDocument, isClone?: boolean);
    /**
     * Binds properties to instance.
     *
     * @param props the properties to be bind.
     */
    private bindProps;
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
    save(options?: FindOneAndUpdateOption | CollectionInsertOneOptions): Promise<IModelSaveResult<S>>;
    /**
     * Deletes document persisting in database.
     *
     * @param options Mongodb delete options.
     */
    delete(options?: IFindOneAndDeleteOption<S>): Promise<import("mongodb").FindAndModifyWriteOpResultObject<IDoc>>;
    /**
     * Propulates child values based on join configurations.
     *
     * @param names the names of joins that should be populated.
     */
    populate(...names: string[]): Promise<IDoc>;
    /**
     * Validates the document.
     */
    validate(): Promise<IDoc>;
    /**
     * Checks if instance is valid against schema.
     */
    isValid(): void;
}
