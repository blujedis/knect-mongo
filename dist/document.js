"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const utils_1 = require("./utils");
const mustad_1 = require("mustad");
const yup_1 = require("yup");
const hookMap = {
    find: ['_find'],
    create: ['_create'],
    update: ['_update', 'findUpdate', 'findReplace'],
    delete: ['_delete', 'findDelete']
};
const includeKeys = Object.keys(hookMap).reduce((a, c) => {
    return [...a, ...hookMap[c]];
}, []);
function initDocument(config = {}, client, db, Model) {
    var _a;
    let mustad;
    const Wrapper = (_a = class Document {
            constructor(doc) {
                if (!Document.db || !Document.client)
                    throw new Error(`Failed to initialize model with "db" or "client" of undefined.`);
                return new Model(doc, Document);
            }
            static get collection() {
                return this.db.collection(this.collectionName);
            }
            static toObjectID(ids) {
                const isArray = Array.isArray(ids);
                if (!isArray)
                    ids = [ids];
                const result = ids.map(id => {
                    if (typeof id === 'string' || typeof id === 'number')
                        return new mongodb_1.ObjectId(id);
                    return id;
                });
                if (isArray)
                    return result;
                return result[0];
            }
            /**
             * Normalizes query.
             *
             * @param query the Mongodb filter query.
             */
            static toQuery(query) {
                let _query = query;
                if (typeof query !== 'object')
                    _query = { _id: query };
                if (_query._id)
                    _query._id = this.toObjectID(_query._id);
                return _query;
            }
            /**
             * Normalizes update query so that $set is always present.
             *
             * @param update the update query to be applied.
             */
            static toUpdate(update) {
                const hasSpecial = Object.keys(update).reduce((a, c) => {
                    if (a === true)
                        return a;
                    a = c.charAt(0) === '$';
                    return a;
                }, false);
                if (hasSpecial)
                    update.$set = update.$set || {};
                else
                    update = { $set: update };
                return update;
            }
            /**
             * Converts to simple object document.
             *
             * @param doc the document context to convert.
             */
            static toDoc(doc) {
                return Object.getOwnPropertyNames(doc)
                    .reduce((a, c) => {
                    a[c] = doc[c];
                    return a;
                }, {});
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
            static async populate(docs, join) {
                let joins = join;
                const isArray = Array.isArray(docs);
                if (typeof join === 'string')
                    join = [join];
                // Iterate array and get join configs.
                if (Array.isArray(join)) {
                    if (typeof join[0] === 'string') {
                        joins = join.reduce((a, c) => {
                            const j = this.schema.joins[c];
                            if (j)
                                a[c] = j;
                            return a;
                        }, {});
                    }
                }
                const _docs = (!isArray ? [docs] : docs);
                const { err, data } = await utils_1.me(Promise.all(_docs.map(async (doc) => {
                    for (const k in joins) {
                        if (!joins.hasOwnProperty(k))
                            continue;
                        const conf = joins[k];
                        const prop = doc[k];
                        const key = conf.key || '_id';
                        let values = !Array.isArray(prop) ? [prop] : prop;
                        if (key === '_id')
                            values = this.toObjectID(values);
                        const filter = { [key]: { '$in': values } };
                        const { err: pErr, data: pData } = await utils_1.me(this.db
                            .collection(conf.collection)
                            .find(filter, conf.options)
                            .toArray());
                        if (pErr)
                            return Promise.reject(pErr);
                        doc[k] = pData[0];
                        if (Array.isArray(prop))
                            doc[k] = pData;
                    }
                    return doc;
                })));
                if (err)
                    return Promise.reject(err);
                if (!isArray)
                    return Promise.resolve(data[0]);
                return Promise.resolve(data);
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
            //////////////////
            // CRUD METHODS //
            //////////////////
            /**
             * Internal method to handle all responses.
             *
             * @param promise a promise to be handled.
             * @param cb an optional callback to be called with error or data.
             */
            static async _handleResponse(promise, cb) {
                const prom = (!utils_1.isPromise(promise) ? Promise.resolve(promise) : promise);
                return prom.then(res => {
                    if (cb)
                        cb(null, res);
                    return res;
                })
                    .catch(err => {
                    if (cb)
                        cb(err, null);
                    return err;
                });
            }
            /**
             * Common handler finds a document or collection of documents by query.
             *
             * @param query the Mongodb filter query.
             * @param options Mongodb find options.
             * @param isMany when true find many.
             * @param cb optional callback instead of promise.
             */
            static async _find(query, options, isMany = false) {
                query = this.toQuery(query || {});
                options = options || {};
                let result;
                if (isMany)
                    result = await utils_1.me(this.collection.find(query, options).toArray());
                else
                    result = await utils_1.me(this.collection.findOne(query, options));
                if (result.err)
                    return Promise.reject(result.err);
                if (!options.populate) {
                    if (isMany)
                        return result.data;
                    return result.data;
                }
                if (isMany)
                    return this.populate(result.data, options.populate);
                return this.populate(result.data, options.populate);
            }
            /**
             * Common handler to create single or multiple documents in database.
             *
             * @param docs the documents to be persisted to database.
             * @param options Mongodb insert many options.
             */
            static _create(doc, options = {}) {
                if (Array.isArray(doc)) {
                    doc.reduce((a, c) => {
                        a.push(c);
                        return a;
                    }, []);
                    return this.collection.insertMany(doc, options);
                }
                else {
                    return this.collection.insertOne(doc, options);
                }
            }
            /**
             * Common update handler to update single or multiple documents by query.
             *
             * @param query the Mongodb filter for finding the desired documents to update.
             * @param update the update query to be applied.
             * @param options Mongodb update options.
             * @param isMany when true update many.
             */
            static _update(query, update, options, isMany = false) {
                if (isMany)
                    return this.collection.updateMany(query, update, options);
                return this.collection.updateOne(query, update, options);
            }
            /**
             * Common delete hander to delete multiple or single documents by query.
             *
             * @param query the Mongodb filter for finding the desired documents to update.
             * @param options Mongodb update options.
             * @param isMany when true uses collection.deleteMany().
             */
            static _delete(query, options, isMany = false) {
                if (isMany)
                    return this.collection.deleteMany(query, options);
                return this.collection.deleteOne(query, options);
            }
            /**
             * Finds a collection of documents by query.
             *
             * @param query the Mongodb filter query.
             * @param options Mongodb find options.
             */
            static find(query, options) {
                return this._find(query, options, true);
            }
            static findOne(query, options, cb) {
                if (typeof options === 'function') {
                    cb = options;
                    options = undefined;
                }
                const _query = this.toQuery(query);
                return this._handleResponse(this._find(_query, options, false), cb);
            }
            static async findModel(query, FindModel, options, cb) {
                if (typeof options === 'function') {
                    cb = options;
                    options = undefined;
                }
                const _query = this.toQuery(query);
                const { err, data } = await utils_1.me(this._find(_query, options, false));
                if (err)
                    return Promise.reject(err);
                return this._handleResponse(new FindModel(data), cb);
            }
            /**
             * Finds a document and then updates.
             *
             * @param query the filter for finding the document.
             * @param update the update to be applied.
             * @param options the update options.
             * @param cb optional callback to use instead of Promise.
             */
            static findUpdate(query, update, options, cb) {
                const _query = this.toQuery(query);
                const _update = this.toUpdate(update);
                return this._handleResponse(this.collection.findOneAndUpdate(_query, _update, options), cb);
            }
            /**
             * Finds a document and then deletes.
             *
             * @param query the filter for finding the document.
             * @param options the update options.
             * @param cb optional callback to use instead of Promise.
             */
            static findDelete(query, options, cb) {
                const _query = this.toQuery(query);
                return this._handleResponse(this.collection.findOneAndDelete(_query, options), cb);
            }
            /**
             * Finds a document and then replaces it.
             *
             * @param query the filter for finding the document.
             * @param doc the doc used to replace existing.
             * @param options the update options.
             * @param cb optional callback to use instead of Promise.
             */
            static findReplace(query, doc, options, cb) {
                const _query = this.toQuery(query);
                return this._handleResponse(this.collection.findOneAndReplace(_query, doc, options), cb);
            }
            static create(docs, options, cb) {
                if (typeof options === 'function') {
                    cb = options;
                    options = undefined;
                }
                const creator = this._create(docs, options);
                return this._handleResponse(creator, cb);
            }
            static createOne(doc, options, cb) {
                if (typeof options === 'function') {
                    cb = options;
                    options = undefined;
                }
                const creator = this._create(doc, options);
                return this._handleResponse(creator, cb);
            }
            static update(query, update, options, cb) {
                if (typeof options === 'function') {
                    cb = options;
                    options = undefined;
                }
                query = this.toQuery(query);
                update = this.toUpdate(update);
                return this._handleResponse(this._update(query, update, options, true), cb);
            }
            static updateOne(query, update, options, cb) {
                if (typeof options === 'function') {
                    cb = options;
                    options = undefined;
                }
                const _query = this.toQuery(query);
                update = this.toUpdate(update);
                return this._handleResponse(this._update(_query, update, options, false), cb);
            }
            static delete(filter, options, cb) {
                if (typeof options === 'function') {
                    cb = options;
                    options = undefined;
                }
                filter = this.toQuery(filter);
                return this._handleResponse(this._delete(filter, options, true), cb);
            }
            static deleteOne(query, options, cb) {
                if (typeof options === 'function') {
                    cb = options;
                    options = undefined;
                }
                const _query = this.toQuery(query);
                return this._handleResponse(this._delete(_query, options, false), cb);
            }
            static pre(type, handler) {
                const methods = hookMap[type];
                if (!methods)
                    throw new Error(`Cannot create hook for "${type}" using methods of undefined.`);
                // Bind each handler.
                mustad.pre(methods, handler);
                return this;
            }
            static post(type, handler) {
                const methods = hookMap[type];
                if (!methods)
                    throw new Error(`Cannot create hook for "${type}" using methods of undefined.`);
                // Bind each handler.
                mustad.post(methods, handler);
                return this;
            }
        },
        _a.client = client,
        _a.db = db,
        _a.collectionName = config.collectionName,
        _a.schema = config,
        _a);
    mustad = new mustad_1.Mustad(Wrapper, { include: includeKeys });
    return Wrapper;
}
exports.initDocument = initDocument;
//# sourceMappingURL=document.js.map