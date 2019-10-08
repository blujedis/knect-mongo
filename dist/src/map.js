"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_1 = require("./document");
class ModelMap extends Map {
    getAs(key) {
        const model = this.get(key);
        if (!model)
            return null;
        const DocumentModel = document_1.initDocument();
        return model;
    }
    list() {
        return [...this.keys()];
    }
}
exports.ModelMap = ModelMap;
//# sourceMappingURL=map.js.map