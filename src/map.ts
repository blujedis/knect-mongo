import { IDoc, Constructor, DerivedDocument} from './types';
import { Model } from './model';
import { initDocument } from './document';

type BaseSchema = IDoc & {};

export class ModelMap extends Map<string, DerivedDocument & Constructor<Model<BaseSchema> & BaseSchema>> {

  getAs<S extends IDoc>(key: string) {
    const model = this.get(key);
    if (!model)
      return null;
    const DocumentModel = initDocument<S, Model<S>>();
    type Document = typeof DocumentModel;
    return model as Document & Constructor<Model<S> & S>;
  }

  list() {
    return [...this.keys()];
  }

}
