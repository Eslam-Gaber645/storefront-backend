import { QueryResult } from 'pg';
import { Product, productsModel } from '../../models';

describe('-Test products model:-', () => {
  const testProduct: Product = {
    product_name: 'testProduct2',
    price: 50,
  };
  let insertedTestProduct: Product;

  describe('--Method: productsModel.create(product):-', () => {
    it('--Should be create product in DB.', async () => {
      const promise = productsModel.create(testProduct);
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].id).toBeTruthy();
      insertedTestProduct = result.rows[0];
    });

    it('--Should be rejected with an error if the data passed is invalid for the product schema', async () => {
      const promise = productsModel.create({
        product_name: 'Invalid product schema',
      } as Product);
      await expectAsync(promise).toBeRejectedWithError(Error);
    });
  });

  describe('--Method: productsModel.findOne(selectOptions):-', () => {
    it('--Should be get product from DB.', async () => {
      const promise = productsModel.findOne({
        condition: { id: insertedTestProduct.id },
      });
      await expectAsync(promise).toBeResolved();
      const product = await promise;
      expect(product).toEqual(insertedTestProduct);
    });

    it('--Should be resolved to null if the requested product is not in the database.', async () => {
      const promise = productsModel.findOne({
        condition: { product_name: 'Invalid' },
      });
      await expectAsync(promise).toBeResolved();
      const product = await promise;
      expect(product).toEqual(null);
    });
  });

  describe('--Method: productsModel.index(selectOptions):-', () => {
    it('--Should be get products list from DB.', async () => {
      const promise = productsModel.index();
      await expectAsync(promise).toBeResolved();
      const products = await promise;
      expect(products).toEqual([insertedTestProduct]);
    });
  });

  describe('--Method: productsModel.update({changes,conditions}):-', () => {
    const newProductName = 'updatedName';
    it('--Should be update product in DB.', async () => {
      const promise = productsModel.update({
        changes: { product_name: newProductName },
        condition: { id: insertedTestProduct.id },
      });
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
      expect(result.rows[0].product_name).toEqual(newProductName);
    });
  });

  describe('--Method: productsModel.checkExistence(searchCondition):-', () => {
    it('--Should be resolved to true if product exists in DB.', async () => {
      const promise = productsModel.checkExistence({
        id: insertedTestProduct.id,
      });
      await expectAsync(promise).toBeResolved();
      const result: boolean = await promise;
      expect(result).toBeTrue();
    });
    it("--Should be resolved to false if product isn't exists in DB.", async () => {
      const promise = productsModel.checkExistence({
        product_name: 'Invalid',
      });
      await expectAsync(promise).toBeResolved();
      const result: boolean = await promise;
      expect(result).toBeFalse();
    });
  });

  describe('--Method: productsModel.delete(conditions):-', () => {
    it('--Should be delete product from DB.', async () => {
      const promise = productsModel.delete({ id: insertedTestProduct.id });
      await expectAsync(promise).toBeResolved();
      const result: QueryResult = await promise;
      expect(result.rowCount).toBe(1);
    });
  });
});
