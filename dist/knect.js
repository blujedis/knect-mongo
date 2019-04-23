"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
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
    const str = uri.split('?')[0];
    if (!~str.indexOf('/'))
        return def;
    return str.split('/').pop();
}
class KnectMongo {
    constructor() {
        this.schemas = {};
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
        const self = this;
        if (this.schemas[name])
            throw new Error(`Cannot create schema ${name}, the schema already exists`);
        this.schemas[name] = schema;
        class Klass {
            // CONSTRUCTOR //
            constructor(props) {
                Object.getOwnPropertyNames(props).forEach(k => this.constructor[k] = props[k]);
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
                throw err;
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
            static validate(doc, props) {
                props = (this.schema.props || JOI.object());
                return props.validate(doc);
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
                            const values = !Array.isArray(prop) ? [prop] : prop;
                            const rel = await this.db
                                .collection(conf.collection)
                                .find({ [conf.key || '_id']: { '$in': values } }, conf.options)
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
            static async find(filter, options) {
                const hooks = this.getHooks('find');
                if (hooks.pre)
                    await hooks.pre({ filter, options });
                const data = await this.collection.find(filter, options).toArray();
                if (!options.populate)
                    return data;
                if (typeof options.populate === 'string')
                    options.populate = [options.populate];
                return this.populate(data, options.populate);
            }
            static async findOne(filter, options) {
                const hooks = this.getHooks('findOne');
                if (hooks.pre)
                    await hooks.pre({ filter, options });
                return this.collection.findOne(filter, options);
            }
            static async findById(id, options) {
                const hooks = this.getHooks('findById');
                const filter = { _id: id };
                if (hooks.pre)
                    await hooks.pre({ filter, options });
                return this.collection.findOne(filter, options);
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
            static async update(filter, update, options) {
                const hooks = this.getHooks('update');
                update = !update.$set ? update = { $set: update } : update;
                const date = Date.now();
                update.$set.modified = update.$set.modified || date;
                if (hooks.pre)
                    await hooks.pre({ filter, update, options });
                return this.collection.updateMany(filter, update, options);
            }
            static async updateOne(filter, update, options) {
                const hooks = this.getHooks('updateOne');
                update = !update.$set ? update = { $set: update } : update;
                const date = Date.now();
                update.$set.modified = update.$set.modified || date;
                if (hooks.pre)
                    await hooks.pre({ filter, update, options });
                return this.collection.updateOne(filter, update, options);
            }
            static async updateById(id, update, options) {
                const hooks = this.getHooks('updateById');
                const filter = { _id: id };
                update = !update.$set ? update = { $set: update } : update;
                const date = Date.now();
                update.$set.modified = update.$set.modified || date;
                if (hooks.pre)
                    await hooks.pre({ filter, update, options });
                return this.collection.updateOne(filter, update, options);
            }
            static async delete(filter, options) {
                const hooks = this.getHooks('delete');
                if (hooks.pre)
                    await hooks.pre({ filter, options });
                return this.collection.deleteMany(filter, options);
            }
            static async deleteOne(filter, options) {
                const hooks = this.getHooks('deleteOne');
                if (hooks.pre)
                    await hooks.pre({ filter, options });
                return this.collection.deleteOne(filter, options);
            }
            static async deleteById(id, options) {
                const hooks = this.getHooks('deleteById');
                const filter = { _id: id };
                if (hooks.pre)
                    await hooks.pre({ filter, options });
                return this.collection.deleteOne(filter, options);
            }
            // CLASS GETTERS & SETTERS //
            get _doc() {
                return Object.getOwnPropertyNames(this)
                    .reduce((a, c) => {
                    a[c] = this[c];
                    return a;
                }, {});
            }
            get id() {
                return this._id;
            }
            set id(id) {
                this._id = id;
            }
            // CLASS METHODS //
            /**
             * Saves the exiting instance to the database.
             *
             * @param options MongoDB update options.
             */
            async save(options) {
                options = options || {};
                options.upsert = false;
                this.modified = Date.now();
                const doc = this._doc;
                const validation = Klass.validate(doc);
                let id;
                let err;
                // Save must have an id.
                if (!this.id)
                    err = new Error(`Cannot save to collection "${name}" with
           missing id, did you mean ".create()"?`);
                id = Klass.toObjectID(this.id);
                return new Promise((resolve, reject) => {
                    if (err)
                        return reject(err);
                    resolve(Klass.updateById(id, validation.value, options));
                });
            }
            async create(options) {
                const date = Date.now();
                this.created = date;
                this.modified = date;
                let doc = this._doc;
                const validation = Klass.validate(doc);
                let err;
                if (this.id)
                    err = new Error(`Cannot create for collection with existing 
          id "${name}", did you mean ".save()"?`);
                return new Promise(async (resolve, reject) => {
                    if (err)
                        return reject(err);
                    const result = await Klass.create(validation.value, options);
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
            async delete(options) {
                return Klass.deleteById(Klass.toObjectID(this.id), options);
            }
            validate(props) {
                return Klass.validate(this._doc, props);
            }
        }
        Klass.dbname = self.dbname;
        Klass.collectionName = name;
        Klass.schema = schema;
        Klass.hooks = {};
        return Klass;
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