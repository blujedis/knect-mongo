import {
  ObjectId, CollectionInsertOneOptions,
  FindOneAndUpdateOption
} from 'mongodb';
import { IDoc, IModelSaveResult, DerivedDocument, IFindOneAndDeleteOption } from './types';
import { promise, hasDescriptor } from './utils';
import { ValidationError } from './error';

export class Model<T extends IDoc> {

  private _Document: DerivedDocument;

  _id: ObjectId;
  _doc: T;

  constructor(doc: T, document: DerivedDocument, isClone = false) {

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

    // If cloning existing props 
    // we can't include the _id.
    if (isClone)
      delete doc._id;

    this.bindProps(doc);

  }

  /**
   * Binds properties to instance.
   * 
   * @param props the properties to be bind.
   */
  private bindProps(props = {}) {

    const model = this;

    for (const k in props) {

      const descriptor = hasDescriptor(model, k);

      if (!descriptor.exists) {

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

  }

  /**
   * Find missing descriptors by finding unbound static props.
   */
  private findMissingDescriptors() {
    const ownProps =
      Object.getOwnPropertyNames(this)
        .filter(v => v !== '_Document' && v !== '_doc');
    const knownProps = Object.keys(this._doc);
    return ownProps.reduce((a, c) => {
      if (!knownProps.includes(c))
        a = [...a, c];
      return a;
    }, []);
  }

  /**
   * Bind static props not known to model.
   */
  private bindStaticProps() {
    this.findMissingDescriptors().forEach(k => {
      this._doc[k] = this[k];
    });
  }

  /**
   * Creates and persists instance to database.
   * 
   * @param options Mongodb create options.
   */
  private async create(options?: CollectionInsertOneOptions): Promise<IModelSaveResult<T>> {

    let doc = this._doc;

    // Remove any populated data so it isn't
    // updated.

    doc = this._Document.unpopulate(doc) as T;

    this.bindStaticProps();

    const validated = await promise(this._Document.validate({ ...doc }));

    if (validated.err)
      return Promise.reject(validated.err);

    if (this._id)
      return Promise.reject(new ValidationError(`Cannot create for collection "${this._Document.collection.namespace}" with existing id, did you mean ".save()"?`, doc, 'id'));

    // TODO: Typing issue with Doc.
    const { err, data } = await promise(this._Document.createOne(doc as any, options));

    if (err)
      return Promise.reject(err);

    this._doc = ((data.ops && data.ops[0]) || {}) as T;

    this.bindProps(this._doc);

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
  private async update(options?: FindOneAndUpdateOption, isExlcude = false): Promise<IModelSaveResult<T>> {

    // @ts-ignore
    options = { upsert: false, returnOriginal: false, ...options };
    (options as FindOneAndUpdateOption).upsert = false;

    this._doc = this._Document.unpopulate(this._doc) as T;

    this.bindStaticProps();

    const validated = await promise(this._Document.validate(this._doc));

    if (validated.err)
      return Promise.reject(validated.err);

    this._doc = validated.data as T;

    const { _id, ...clone } = this._doc;

    const updateMethod = isExlcude ? this._Document.findExclude : this._Document.findUpdate;

    const { err, data } = await promise(updateMethod(this._id, clone, options));

    if (err)
      return Promise.reject(err);

    this._doc = data.value as T;

    this.bindProps(this._doc);

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
  async delete(options?: IFindOneAndDeleteOption<T>) {
    if (!this._id)
      return Promise.reject('Cannot delete using _id of undefined.');
    return this._Document.findDelete(this._id, options);
  }

  /**
   * Soft deletes calling excludeOne in Document.
   * Requires using hooks to set deleted prop in doc.
   * 
   * @param options MongoDB update options.
   */
  async exclude(options?: FindOneAndUpdateOption) {
    if (!this._id)
      return Promise.reject('Cannot exclude using _id of undefined.');
    return this.update(options, true);
  }

  /**
   * Propulates child values based on join configurations.
   * 
   * @param names the names of joins that should be populated.
   */
  async populate(...names: string[]) {
    const { err, data } = await promise(this._Document.populate(this._doc, names));
    if (err)
      return Promise.reject(err);
    this._doc = data as T;
    return Promise.resolve(data);
  }

  /**
   * Validates the document.
   */
  validate() {
    return this._Document.validate(this._doc);
  }

  /**
   * Checks if instance is valid against schema.
   */
  isValid() {
    return this._Document.isValid(this._doc);
  }

}
