import { IDoc, Constructor, DerivedDocument } from './types';
import { Model } from './model';
import { initDocument } from './document';

type BaseSchema = IDoc & {};

export class ModelMap extends Map<string, DerivedDocument & Constructor<Model<any>>> {

  list() {
    return [...this.keys()];
  }

}
