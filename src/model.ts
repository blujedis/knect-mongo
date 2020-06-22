import {
  ObjectId, CollectionInsertOneOptions,
  FindOneAndUpdateOption,
  OptionalId
} from 'mongodb';
import { IDoc, IModelSaveResult, DerivedDocument, IFindOneAndDeleteOption } from './types';
import { ValidationError, ObjectSchema } from 'yup';
import { me } from './utils';

export class Model<S extends IDoc> {

  private _Document: DerivedDocument;

  _id: ObjectId;
  _doc: S;

  constructor(doc: S, document: DerivedDocument) {

    const model = this;

    Object.defineProperties(this, {
      _Document: {
        enumerable: false,
        configurable: false,
        writable: false,
        value: document
      },
      _doc: {
        enumerable: false,
        writable: true,
        value: doc || {}
      }
    });

    const fields = (document.schema.props as any).fields || {};

    for (const k in fields) {
      Object.defineProperty(this, k, {
        get() {
          return model._doc[k];
        },
        set(v) {
          model._doc[k] = v;
        }
      });
    }

  }

  /**
   * Creates and persists instance to database.
   * 
   * @param options Mongodb create options.
   */
  private async create(options?: CollectionInsertOneOptions): Promise<IModelSaveResult<S>> {

    let doc = this._doc;

    // Remove any populated data so it isn't
    // updated.

    doc = this._Document.unpopulate(doc) as S;

    this._Document.validate(doc);

    if (this._id)
      return Promise.reject(new ValidationError([`Cannot create for collection "${this._Document.collection.namespace}" with existing 
            id, did you mean ".save()"?`], doc, 'id'));

    // TODO: Typing issue with Doc.
    const { err, data } = await me(this._Document.createOne(doc as any, options));

    if (err)
      return Promise.reject(err);

    this._doc = ((data.ops && data.ops[0]) || {}) as S;

    return {
      ok: data.result.ok,
      insertId: data.insertedId,
      doc: this._doc,
      response: data as any
    };

  }

  /**
   * Updates a single record by id.
   * 
   * @param options the update options.
   */
  private async update(options?: FindOneAndUpdateOption): Promise<IModelSaveResult<S>> {

    // @ts-ignore
    options = { upsert: false, returnOriginal: false, ...options };
    (options as FindOneAndUpdateOption).upsert = false;

    this._doc = this._Document.unpopulate(this._doc) as S;

    this._doc = this._Document.validate(this._doc) as S;

    const { _id, ...clone } = this._doc;

    const { err, data } = await me(this._Document.findUpdate(this._id, clone, options));

    if (err)
      return Promise.reject(err);

    this._doc = data.value as S;

    return {
      ok: data.ok,
      insertId: null,
      doc: this._doc,
      response: data as any
    };

  }

  /**
   * Saves changes persisting instance in database.
   * 
   * @param options MongoDB update options.
   */
  async save(options?: FindOneAndUpdateOption | CollectionInsertOneOptions) {

    // If no id try create.
    if (!this._id)
      return this.create(options);

    return this.update(options);

  }

  /**
   * Deletes document persisting in database.
   * 
   * @param options Mongodb delete options.
   */
  async delete(options?: IFindOneAndDeleteOption<S>) {
    return this._Document.findDelete(this._id, options);
  }

  /**
   * Propulates child values based on join configurations.
   * 
   * @param names the names of joins that should be populated.
   */
  async populate(...names: string[]) {
    const { err, data } = await me(this._Document.populate(this._doc, names));
    if (err)
      return Promise.reject(err);
    this._doc = data as S;
    return Promise.resolve(data);
  }

  /**
   * Validates instance against schema.
   * 
   * @param schema optional schema to verify by or uses defined.
   */
  validate(schema?: ObjectSchema<S>) {
    return this._Document.validate(this._doc, schema);
  }

  /**
   * Checks if instance is valid against schema.
   * 
   * @param schema optional schema to verify by or uses defined.
   */
  isValid(schema?: ObjectSchema<S>) {
    return this._Document.isValid(this._doc, schema);
  }

}
