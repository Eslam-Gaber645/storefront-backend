'use strict';

import { getDb } from '../configuration';
import CoreModel from './CoreModel';

export type Product = {
  id?: number;
  product_name: string;
  price: number;
};

/**
 * singleton products model.
 * @export
 * @class ProductsModel
 * @extends {ProductsModel<Product>}
 */
export class ProductsModel extends CoreModel<Product> {
  private static instance: ProductsModel;
  /**
   * Creates or retrieve an instance of ProductsModel.
   * @memberof ProductsModel
   */
  constructor() {
    if (ProductsModel.instance) {
      ProductsModel.instance.db = getDb();
      return ProductsModel.instance;
    }
    super('products');
    ProductsModel.instance = this;
  }
}

export default new ProductsModel();
