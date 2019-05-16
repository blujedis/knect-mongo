"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const yup_1 = require("yup");
exports.MONGO_CLIENT_DEFAULTS = {
    useNewUrlParser: true
};
/**
 * Parses database name from Mongodb connection string.
 *
 * @param uri the Mongodb uri connection string.
 * @param def the default database name when not found in uri.
 */
function parseDbName(uri, def = '') {
    const str = uri.split('?')[0];
    if (!~str.indexOf('/'))
        return def;
    return str.split('/').pop();
}
class KnectMongo {
    constructor() {
        this.schemas = {};
        // modelAs<S extends object>(name: string, collectionName: string, schema: ISchema<Partial<S>>) {
        //   // Default collection name to schema name.
        //   schema.collectionName = schema.collectionName || name;
        //   const Model = this.createModel<S>(name, schema);
        //   return Model as typeof Model & IConstructor<S>;
        // }
    }
    /**
     * Connects to Mongodb instance.
     *
     * @param uri the Mongodb connection uri.
     * @param options Mongodb client connection options.
     */
    async connect(uri, options) {
        if (this.db)
            return this.db;
        options = { ...exports.MONGO_CLIENT_DEFAULTS, ...options };
        this.dbname = parseDbName(uri);
        this.client = await mongodb_1.MongoClient.connect(uri, options);
        this.db = this.client.db(this.dbname);
        return this.db;
    }
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param name the name of the collection
     * @param config the schema configuration containing document validation.
     */
    createModel(name, config) {
        var _a;
        const self = this;
        this.schemas[name] = config;
        let _id;
        const getDoc = (context) => {
            return Object.getOwnPropertyNames(context)
                .reduce((a, c) => {
                a[c] = context[c];
                return a;
            }, {});
        };
        const Model = (_a = class Klass {
                // CONSTRUCTOR //
                // May need to change this fine for now.
                constructor(props) {
                    if (props)
                        Object.getOwnPropertyNames(props).forEach(k => this[k] = props[k]);
                }
                static get client() {
                    return self.client;
                }
                static get db() {
                    return self.db;
                }
                static get collection() {
                    return self.db.collection(name);
                }
                /**
                 * Sets the Model's validation schema.
                 *
                 * @param schema the validation schema.
                 */
                static setSchema(schema) {
                    self.schemas[name] = config;
                    Klass.schema = config;
                }
                /**
                 * Normalizes filter ensuring ObjectID type.
                 *
                 * @param filter the Mongodb filter query.
                 */
                static normalizeFilter(filter) {
                    if (filter._id)
                        filter._id = this.toObjectID(filter._id);
                    return filter;
                }
                static toObjectID(ids) {
                    const isArray = Array.isArray(ids);
                    if (!isArray)
                        ids = [ids];
                    const result = ids.map(id => {
                        if (typeof id === 'string' || typeof id === 'number')
                            return new mongodb_1.ObjectID(id);
                        return id;
                    });
                    if (isArray)
                        return result;
                    return result[0];
                }
                /**
                 * Sets a hook to be called for defined method.
                 *
                 * @param method the method to set hook for.
                 * @param type the hook type.
                 * @param handler the handler for the hook.
                 */
                static setHook(method, type, handler) {
                    this.hooks[method] = this.hooks[method] || {};
                    this.hooks[method][type] = handler;
                }
                /**
                 * Gets all hooks for a given method.
                 *
                 * @param method the method to get hooks for.
                 */
                static getHooks(method) {
                    return this.hooks[method] || {};
                }
                /**
                 * Get a hook for a given method and type.
                 *
                 * @param method the hook method.
                 * @param type the type of hook method to get.
                 */
                static getHook(method, type) {
                    this.hooks[method] = this.hooks[method] || {};
                    /* tslint:disable */
                    return this.getHooks[method][type] || (() => { });
                }
                /**
                 * Sets a pre hook for a given method.
                 *
                 * @param method the method to set the pre hook for.
                 * @param handler the handler to be called.
                 */
                static pre(method, handler) {
                    this.setHook(method, 'pre', handler);
                }
                /**
                 * Sets a post hook for a given method.
                 *
                 * @param method the method to set the post hook for.
                 * @param handler the handler to be called.
                 */
                static post(method, handler) {
                    this.setHook(method, 'post', handler);
                }
                /**
                 * Checks is document is valid against schema.
                 *
                 * @param doc the document to be validated.
                 * @param schema the schema to validate against.
                 * @param options the validation options to be applied.
                 */
                static isValid(doc, schema, options) {
                    schema = (this.schema.props || yup_1.object());
                    return schema.isValidSync(doc, options);
                }
                /**
                 * Validates a document against schema.
                 *
                 * @param doc the document to be validated.
                 * @param schema the schema to validate against.
                 * @param options the validation options to be applied.
                 */
                static validate(doc, schema, options) {
                    schema = (this.schema.props || yup_1.object());
                    return schema.validateSync(doc, options);
                }
                static async populate(doc, key, join) {
                    let joins = key;
                    const isArray = Array.isArray(doc);
                    if (arguments.length === 3)
                        joins = { [key]: join };
                    if (Array.isArray(key)) {
                        joins = key.reduce((a, c) => {
                            const j = this.schema.joins[c];
                            if (j)
                                a[c] = j;
                            return a;
                        }, {});
                    }
                    const docs = (!isArray ? [doc] : doc);
                    const result = await Promise.all(docs.map(async (d) => {
                        for (const k in joins) {
                            if (joins.hasOwnProperty(k)) {
                                const conf = joins[k];
                                const prop = d[k];
                                const filterKey = conf.key || '_id';
                                let values = !Array.isArray(prop) ? [prop] : prop;
                                if (filterKey === '_id')
                                    values = this.toObjectID(values);
                                const filter = { [filterKey]: { '$in': values } };
                                const rel = await this.db
                                    .collection(conf.collection)
                                    .find(filter, conf.options)
                                    .toArray();
                                d[k] = rel[0];
                                if (Array.isArray(prop))
                                    d[k] = rel;
                            }
                        }
                        return d;
                    }));
                    if (!isArray)
                        return result[0];
                    return result;
                }
                static async cascade(doc, key, join) {
                    let joins = key;
                    const isArray = Array.isArray(doc);
                    if (arguments.length === 3)
                        joins = { [key]: join };
                    if (Array.isArray(key)) {
                        joins = key.reduce((a, c) => {
                            const j = this.schema.joins[c];
                            if (j)
                                a[c] = j;
                            return a;
                        }, {});
                    }
                    const docs = (!isArray ? [doc] : doc);
                    const session = this.client.startSession();
                    session.startTransaction();
                    try {
                        const result = await Promise.all(docs.map(async (d) => {
                            let optKey;
                            const ops = [];
                            for (const k in joins) {
                                if (joins.hasOwnProperty(k)) {
                                    optKey = k;
                                    const conf = joins[k];
                                    const prop = d[k];
                                    const filterKey = conf.key || '_id';
                                    let values = !Array.isArray(prop) ? [prop] : prop;
                                    if (filterKey === '_id')
                                        values = this.toObjectID(values);
                                    const filter = { [filterKey]: { '$in': values } };
                                    const op = await this.db
                                        .collection(conf.collection)
                                        .deleteMany(filter, conf.options);
                                    ops.push(op);
                                }
                            }
                            return { doc: d, ops: { [optKey]: ops } };
                        }));
                        await session.commitTransaction();
                        session.endSession();
                        if (!isArray)
                            return result[0];
                        return result;
                    }
                    catch (err) {
                        await session.abortTransaction();
                        session.endSession();
                        throw err;
                    }
                }
                /**
                 * Finds a collection of documents by query.
                 *
                 * @param filter the Mongodb filter query.
                 * @param options Mongodb find options.
                 */
                static async find(filter, options) {
                    const hooks = this.getHooks('find');
                    filter = filter || {};
                    options = options || {};
                    filter = this.normalizeFilter(filter);
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const data = await this.collection.find(filter, options).toArray();
                    if (!options.populate)
                        return data;
                    if (typeof options.populate === 'string')
                        options.populate = [options.populate];
                    return this.populate(data, options.populate);
                }
                /**
                 * Finds one document by query.
                 *
                 * @param filter the Mongodb filter query.
                 * @param options Mongodb find options.
                 */
                static async findOne(filter, options) {
                    const hooks = this.getHooks('findOne');
                    options = options || {};
                    filter = this.normalizeFilter(filter);
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const data = await this.collection.findOne(filter, options);
                    if (!options.populate)
                        return data;
                    if (typeof options.populate === 'string')
                        options.populate = [options.populate];
                    return this.populate(data, options.populate);
                }
                /**
                 * Finds one document by id.
                 *
                 * @param filter the Mongodb filter query.
                 * @param options Mongodb find options.
                 */
                static async findById(id, options) {
                    const hooks = this.getHooks('findById');
                    options = options || {};
                    const filter = { _id: this.toObjectID(id) };
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const data = await this.collection.findOne(filter, options);
                    if (!options.populate)
                        return data;
                    if (typeof options.populate === 'string')
                        options.populate = [options.populate];
                    return this.populate(data, options.populate);
                }
                static async create(doc, options) {
                    const hooks = this.getHooks('create');
                    if (hooks.pre)
                        await hooks.pre({ doc, options });
                    const date = Date.now();
                    if (Array.isArray(doc)) {
                        doc.reduce((a, c) => {
                            c.created = c.created || date;
                            c.modified = c.modified || date;
                            a.push(c);
                            return a;
                        }, []);
                        return this.collection.insertMany(doc, options);
                    }
                    else {
                        doc.created = doc.created || date;
                        doc.modified = date;
                        return this.collection.insertOne(doc, options);
                    }
                }
                /**
                 * Updates multiple documents by query.
                 *
                 * @param filter the Mongodb filter for finding the desired documents to update.
                 * @param update the update query to be applied.
                 * @param options Mongodb update options.
                 */
                static async update(filter, update, options) {
                    const hooks = this.getHooks('update');
                    filter = this.normalizeFilter(filter);
                    update = !update.$set ? update = { $set: update } : update;
                    const date = Date.now();
                    update.$set.modified = update.$set.modified || date;
                    if (hooks.pre)
                        await hooks.pre({ filter, update, options });
                    return this.collection.updateMany(filter, update, options);
                }
                /**
                 * Updates one document by query.
                 *
                 * @param filter the Mongodb filter for finding the desired documents to update.
                 * @param update the update query to be applied.
                 * @param options Mongodb update options.
                 */
                static async updateOne(filter, update, options) {
                    const hooks = this.getHooks('updateOne');
                    filter = this.normalizeFilter(filter);
                    update = !update.$set ? update = { $set: update } : update;
                    const date = Date.now();
                    update.$set.modified = update.$set.modified || date;
                    if (hooks.pre)
                        await hooks.pre({ filter, update, options });
                    return this.collection.updateOne(filter, update, options);
                }
                /**
                 * Updates one document by id.
                 *
                 * @param filter the Mongodb filter for finding the desired documents to update.
                 * @param update the update query to be applied.
                 * @param options Mongodb update options.
                 */
                static async updateById(id, update, options) {
                    const hooks = this.getHooks('updateById');
                    const filter = { _id: this.toObjectID(id) };
                    update = !update.$set ? update = { $set: update } : update;
                    const date = Date.now();
                    update.$set.modified = update.$set.modified || date;
                    if (hooks.pre)
                        await hooks.pre({ filter, update, options });
                    return this.collection.updateOne(filter, update, options);
                }
                /**
                 * Deletes multiple documents by query.
                 *
                 * @param filter the Mongodb filter for finding the desired documents to update.
                 * @param options Mongodb update options.
                 */
                static async delete(filter, options) {
                    const hooks = this.getHooks('delete');
                    filter = this.normalizeFilter(filter);
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    return this.collection.deleteMany(filter, options);
                }
                /**
                 * Deletes one document by query.
                 *
                 * @param filter the Mongodb filter for finding the desired documents to update.
                 * @param options Mongodb update options.
                 */
                static async deleteOne(filter, options) {
                    const hooks = this.getHooks('deleteOne');
                    filter = this.normalizeFilter(filter);
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    return this.collection.deleteOne(filter, options);
                }
                /**
                 * Deletes one document by id.
                 *
                 * @param filter the Mongodb filter for finding the desired documents to update.
                 * @param options Mongodb update options.
                 */
                static async deleteById(id, options) {
                    const hooks = this.getHooks('deleteById');
                    const filter = { _id: this.toObjectID(id) };
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    return this.collection.deleteOne(filter, options);
                }
                // CLASS GETTERS & SETTERS //
                get id() {
                    return _id;
                }
                set id(id) {
                    _id = id;
                }
                // CLASS METHODS //
                /**
                 * Saves changes persisting instance in database.
                 *
                 * @param options MongoDB update options.
                 */
                async save(options) {
                    options = options || {};
                    options.upsert = false;
                    this.modified = Date.now();
                    const doc = getDoc(this);
                    Klass.validate(doc);
                    return new Promise((resolve, reject) => {
                        if (!this.id)
                            return reject(new yup_1.ValidationError([`Cannot save to collection "${name}" with
          missing id, did you mean ".create()"?`], doc, 'id'));
                        resolve(Klass.updateById(Klass.toObjectID(this.id), doc, options));
                    });
                }
                /**
                 * Creates and persists instance to database.
                 *
                 * @param options Mongodb create options.
                 */
                async create(options) {
                    const date = Date.now();
                    this.created = date;
                    this.modified = date;
                    let doc = getDoc(this);
                    Klass.validate(doc);
                    return new Promise(async (resolve, reject) => {
                        if (this.id)
                            return reject(new yup_1.ValidationError([`Cannot create for collection with existing 
            id "${name}", did you mean ".save()"?`], doc, 'id'));
                        const result = await Klass.create(doc, options);
                        doc = (result.ops && result.ops[0]) || {};
                        Object.keys(doc).forEach(k => {
                            if (k === '_id') {
                                this.id = doc[k];
                            }
                            else if (typeof this[k] === 'undefined') {
                                this[k] = doc[k];
                            }
                        });
                        resolve(result);
                    });
                }
                /**
                 * Deletes document persisting in database.
                 *
                 * @param options Mongodb delete options.
                 */
                async delete(options) {
                    return Klass.deleteById(Klass.toObjectID(this.id), options);
                }
                /**
                 * Validates instance against schema.
                 *
                 * @param schema optional schema to verify by or uses defined.
                 */
                validate(schema) {
                    return Klass.validate(getDoc(this), schema);
                }
                /**
                 * Checks if instance is valid against schema.
                 *
                 * @param schema optional schema to verify by or uses defined.
                 */
                isValid(schema) {
                    return Klass.isValid(getDoc(this), schema);
                }
            },
            _a.dbname = self.dbname,
            _a.collectionName = config.collectionName,
            _a.schema = config,
            _a.hooks = {},
            _a);
        return Model;
    }
    /**
     * Accepts a schema and creates model with static and instance convenience methods.
     *
     * @param name the name of the schema.
     * @param schema the schema configuration containing document validation.
     * @param collectionName specify the collection name otherwise schema name is used.
     */
    model(name, schema, collectionName) {
        const _schema = this.schemas[name];
        // Return the existing schema/model by name.
        if (!schema) {
            if (!_schema)
                throw new Error(`Failed to lookup schema ${name}`);
            const Model = this.createModel(name, _schema);
            return Model;
        }
        // Schema already exists.
        if (_schema)
            throw new Error(`Duplicate schema ${name} detected, schema names must be unique`);
        // Default collection name to schema name.
        schema = schema || {};
        schema.collectionName = collectionName || schema.collectionName || name;
        const Model = this.createModel(name, schema);
        return Model;
    }
}
exports.KnectMongo = KnectMongo;
let _instance;
/**
 * Gets singleton instance of KnectMongo
 */
function getInstance() {
    if (!_instance)
        _instance = new KnectMongo();
    return _instance;
}
exports.default = getInstance();
//# sourceMappingURL=knect.js.map