'use strict';

import { getDb } from '../configuration';
import CoreModel, { SqlProjection, SqlSelectOptions } from './CoreModel';
import { OrderProduct } from './orderProducts.model';
import { Product } from './products.model';
import { User } from './users.model';

export type Order = {
  id?: number;
  status: 'active' | 'complete';
  user_id: number;
};

export type FullOrderLookup = Order & {
  order_products:
    | {
        id?: OrderProduct['id'];
        quantity?: OrderProduct['quantity'];
        product: Product;
      }[]
    | [];
  username: User['username'];
};

/**
 * singleton orders model.
 * @export
 * @class OrdersModel
 * @extends {CoreModel<Order>}
 */
export class OrdersModel extends CoreModel<Order> {
  private static instance: OrdersModel;
  /**
   * Creates or retrieve an instance of OrdersModel .
   * @memberof OrdersModel
   */
  constructor() {
    if (OrdersModel.instance) {
      OrdersModel.instance.db = getDb();
      return OrdersModel.instance;
    }
    super('orders');
    OrdersModel.instance = this;
  }

  static applyOrdersLookup(
    selectOptions?: SqlSelectOptions<Order>
  ): SqlSelectOptions<Order> {
    selectOptions ??= {};

    const projections = selectOptions.projection?.map?.(col =>
      !col.includes('.') ? `orders.${col}` : col
    );

    if (selectOptions.condition) {
      selectOptions.condition = Object.keys(selectOptions.condition).reduce(
        (cond: Record<string, unknown>, col) => {
          cond[!col.includes('.') ? `orders.${col}` : col] =
            selectOptions?.condition?.[col as keyof Order];
          return cond;
        },
        {}
      );
    }

    selectOptions.projection = [
      ...(projections || ['orders.*']),
      'users.username',
      "case when count(products) = 0 then '[]' else json_agg(json_build_object('id',order_products.id, \
      'quantity',order_products.quantity,'product',products.*)) end as order_products",
    ] as SqlProjection<Order>;

    selectOptions.group = [
      'orders.id',
      'users.username',
      ...(selectOptions.group || []),
    ];

    selectOptions.join = [
      ['LEFT', 'order_products', 'orders.id = order_products.order_id'],
      ['LEFT', 'products', 'products.id = order_products.product_id'],
      ['LEFT', 'users', 'users.id = orders.user_id'],
      ...(selectOptions.join || []),
    ];

    return selectOptions;
  }

  async indexByLookup(
    selectOptions?: SqlSelectOptions<Order>
  ): Promise<FullOrderLookup[]> {
    return super.index(
      OrdersModel.applyOrdersLookup(selectOptions)
    ) as unknown as FullOrderLookup[];
  }

  async findOneByLookup(
    selectOptions?: SqlSelectOptions<Order>
  ): Promise<FullOrderLookup | null> {
    return super.findOne(
      OrdersModel.applyOrdersLookup(selectOptions)
    ) as unknown as FullOrderLookup;
  }
}

export default new OrdersModel();
