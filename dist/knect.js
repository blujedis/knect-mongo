"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const utils_1 = require("./utils");
const JOI = require("joi");
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
    let str = uri.split('?')[0];
    if (!~str.indexOf('/'))
        return def;
    return str.split('/').pop();
}
/**
 * Default error handler.
 *
 * @param err the error passed.
 */
function errorHandler(err) {
    throw err;
}
class KnectMongo {
    constructor() {
        this._onError = errorHandler;
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
     * @param schema the JOI Object Schema for validation.
     */
    model(name, schema) {
        var _a;
        const self = this;
        return _a = class {
                constructor() {
                    // Can't emit type defs and use private in derived class.
                    Object.defineProperty(this, '_id', {
                        enumerable: true,
                        writable: true,
                        configurable: true,
                        value: undefined
                    });
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
                static onError(err) {
                    self._onError(err);
                }
                static setHook(method, type, handler) {
                    this.hooks[method] = this.hooks[method] || {};
                    this.hooks[method][type] = handler;
                }
                static getHooks(method) {
                    return this.hooks[method] || {};
                }
                static getHook(method, type) {
                    this.hooks[method] = this.hooks[method] || {};
                    const hook = this.getHooks[method][type];
                    if (hook)
                        return hook;
                    this.onError(new Error(`Failed to lookup hook type "${type}" for method "${method}"`));
                }
                static pre(method, handler) {
                    this.setHook(method, 'pre', handler);
                }
                static post(method, handler) {
                    this.setHook(method, 'post', handler);
                }
                static validate(doc, schema) {
                    schema = (schema || JOI.object());
                    return schema.validate(doc);
                }
                static async find(filter) {
                    const hooks = this.getHooks('find');
                    if (hooks.pre)
                        await hooks.pre({ filter });
                    const result = await utils_1.awaiter(this.collection.find(filter).toArray());
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async findOne(filter, options) {
                    const hooks = this.getHooks('findOne');
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const result = await utils_1.awaiter(this.collection.findOne(filter, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async create(doc, options) {
                    let result;
                    const hooks = this.getHooks('create');
                    if (hooks.pre)
                        await hooks.pre({ doc, options });
                    const date = Date.now();
                    if (Array.isArray(doc)) {
                        doc.reduce((a, c) => {
                            c.created = date;
                            c.modified = date;
                            a.push(c);
                            return a;
                        }, []);
                        result = await utils_1.awaiter(this.collection.insertMany(doc, options));
                    }
                    else {
                        doc.created = date;
                        doc.modified = date;
                        result = await utils_1.awaiter(this.collection.insertOne(doc, options));
                    }
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async update(filter, update, options) {
                    const hooks = this.getHooks('update');
                    update = !update.$set ? update = { $set: update } : update;
                    const date = Date.now();
                    update.$set.modified = date;
                    if (hooks.pre)
                        await hooks.pre({ filter, update, options });
                    const result = await utils_1.awaiter(this.collection.updateMany(filter, update, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async updateOne(filter, update, options) {
                    const hooks = this.getHooks('updateOne');
                    update = !update.$set ? update = { $set: update } : update;
                    const date = Date.now();
                    update.$set.modified = date;
                    if (hooks.pre)
                        await hooks.pre({ filter, update, options });
                    const result = await utils_1.awaiter(this.collection.updateOne(filter, update, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async updateById(id, update, options) {
                    const hooks = this.getHooks('updateById');
                    const filter = { _id: id };
                    update = !update.$set ? update = { $set: update } : update;
                    const date = Date.now();
                    update.$set.modified = date;
                    if (hooks.pre)
                        await hooks.pre({ filter, update, options });
                    const result = await utils_1.awaiter(this.collection.updateOne(filter, update, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async delete(filter, options) {
                    const hooks = this.getHooks('delete');
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const date = Date.now();
                    const data = { $set: { modified: date, deleted: date } };
                    const result = await utils_1.awaiter(this.collection.updateMany(filter, data, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async deleteOne(filter, options) {
                    const hooks = this.getHooks('deleteOne');
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const date = Date.now();
                    const data = { $set: { modified: date, deleted: date } };
                    const result = await utils_1.awaiter(this.collection.updateOne(filter, data, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async deleteById(id, options) {
                    const hooks = this.getHooks('deleteOne');
                    const filter = { _id: id };
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const date = Date.now();
                    const data = { $set: { modified: date, deleted: date } };
                    const result = await utils_1.awaiter(this.collection.updateOne(filter, data, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async purge(filter, options) {
                    const hooks = this.getHooks('purge');
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const result = await utils_1.awaiter(this.collection.deleteMany(filter, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async purgeOne(filter, options) {
                    const hooks = this.getHooks('purgeOne');
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const result = await utils_1.awaiter(this.collection.deleteOne(filter, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                static async purgeById(id, options) {
                    const hooks = this.getHooks('purgeById');
                    const filter = { _id: id };
                    if (hooks.pre)
                        await hooks.pre({ filter, options });
                    const result = await utils_1.awaiter(this.collection.deleteOne(filter, options));
                    if (!result.err)
                        return result.data;
                    this.onError(result.err);
                }
                // DEFAULT CONVENIENCE METHODS //
                get doc() {
                    return Object.getOwnPropertyNames(this)
                        .reduce((a, c) => {
                        a[c] = this[c];
                        return a;
                    }, {});
                }
                get id() {
                    return this['_id'];
                }
                set id(id) {
                    this['_id'] = id;
                }
                /**
                 * Saves the exiting instance to the database.
                 *
                 * @param options MongoDB update options.
                 */
                async save(options) {
                    options = options || {};
                    options.upsert = false;
                    const validation = this.constructor.validate(this.doc);
                    let id = this['_id'];
                    // Save must have an id.
                    if (!this['_id'])
                        validation.error = new Error(`Cannot save to collection "${name}" with missing id, did you mean ".create()"?`);
                    id = new mongodb_1.ObjectID(id);
                    delete validation.value._id;
                    if (!validation.error) {
                        this.doc.modified = Date.now();
                        return await this.constructor.updateById(id, validation.value, options);
                    }
                    this.constructor.onError(validation.error);
                }
                async create(options) {
                    const validation = this.constructor.validate(this.doc);
                    if (this['_id'])
                        validation.error = new Error(`Cannot create for collection with existing id "${name}", did you mean ".save()"?`);
                    if (!validation.error) {
                        this.doc.modified = Date.now();
                        const result = await this.constructor.create(validation.value, options);
                        // If successfully created set the generated ID
                        if (!result.err && result.data.insertedId)
                            this.id = result.data.insertedId;
                        return result;
                    }
                    this.constructor.onError(validation.error);
                }
                async delete(options) {
                    return await this.constructor.deleteById(new mongodb_1.ObjectID(this['_id']), options);
                }
                async purge(options) {
                    return await this.constructor.purgeById(new mongodb_1.ObjectID(this['_id']), options);
                }
                validate(schema) {
                    return this.constructor.validate(this.doc, schema);
                }
            },
            _a.dbname = self.dbname,
            _a.collectionName = name,
            _a.schema = schema,
            _a.hooks = {},
            _a;
    }
    /**
     * Sets the custom error handler function globally.
     *
     * @param fn a custom error handler function.
     */
    onError(fn) {
        this._onError = fn;
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