'use strict';

import { getDb } from '../configuration';
import CoreModel from './CoreModel';

export type OrderProduct = {
  id?: number;
  quantity?: number;
  order_id: number;
  product_id: number;
};

/**
 * singleton orders products model.
 * @export
 * @class OrdersModel
 * @extends {CoreModel<Order>}
 */
export class OrderProductsModel extends CoreModel<OrderProduct> {
  private static instance: OrderProductsModel;
  /**
   * Creates or retrieve an instance of OrderProductsModel .
   * @memberof OrderProductsModel
   */
  constructor() {
    if (OrderProductsModel.instance) {
      OrderProductsModel.instance.db = getDb();
      return OrderProductsModel.instance;
    }

    super('order_products');
    OrderProductsModel.instance = this;
  }
}

export default new OrderProductsModel();
