import { Constructor, DerivedDocument } from './types';
import { Model } from './model';
export declare class ModelMap extends Map<string, DerivedDocument & Constructor<Model<any>>> {
    list(): string[];
}
