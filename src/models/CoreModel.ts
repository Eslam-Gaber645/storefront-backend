import { QueryResult, QueryResultRow } from 'pg';
import { getDb, DBPool } from '../configuration';

export default abstract class CoreModel<RowType extends QueryResultRow> {
  tableName: string;
  db: DBPool = getDb();

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  static sqlProjection<RowType>(
    projection: SqlProjection<RowType> | void
  ): string {
    return projection ? projection.join(',') : '*';
  }

  static sqlCondition<RowType>(
    condition: SqlCondition<RowType> | void,
    bindingOffset?: number
  ): GeneratedSqlCondition {
    bindingOffset ??= 0;

    return {
      sqlCondition: condition
        ? `WHERE ${Object.keys(condition)
            .map(
              (key, index) => `${key}=$${index + (bindingOffset as number) + 1}`
            )
            .join(' AND ')}`
        : '',
      conditionParams: condition ? Object.values(condition) : [],
    };
  }

  static sqlJoin(join: [SqlJoinTypes, string, string][] | void): string {
    return join
      ? join.flatMap(e => `${e[0]} JOIN ${e[1]} ON ${e[2]}`).join(' ')
      : '';
  }

  static sqlGroup(group: string[] | void): string {
    return group ? `GROUP BY ${group.join(', ')}` : '';
  }

  static sqlLimit(limit: number | void): string {
    return limit ? `LIMIT ${limit}` : '';
  }

  static sqlSelectQuery<RowType>(
    tableName: string,
    {
      condition,
      projection,
      join,
      group,
      limit,
    }: SqlSelectOptions<RowType> = {}
  ): GeneratedSqlQuery {
    const sqlProjection = this.sqlProjection<RowType>(projection),
      { sqlCondition, conditionParams } = this.sqlCondition<RowType>(condition),
      sqlJoin = this.sqlJoin(join),
      sqlGroup = this.sqlGroup(group),
      sqlLimit = this.sqlLimit(limit),
      sqlQuery = `SELECT ${sqlProjection} FROM ${tableName} ${sqlJoin} ${sqlCondition} ${sqlGroup} ${sqlLimit};`;

    return { sqlQuery, queryParams: conditionParams };
  }

  static sqlInsertQuery<RowType>(
    tableName: string,
    newRow: RowType
  ): GeneratedSqlQuery {
    const columnsName = Object.keys(newRow),
      bindColumns = columnsName.map((_col, index) => `$${index + 1}`),
      queryParams = Object.values(newRow),
      sqlQuery = `INSERT INTO ${tableName} (${columnsName}) VALUES (${bindColumns}) RETURNING *;`;

    return {
      sqlQuery,
      queryParams,
    };
  }

  static sqlUpdateQuery<RowType>(
    tableName: string,
    { changes, condition }: SqlUpdateOptions<RowType>
  ): GeneratedSqlQuery {
    const columnsBindings = Object.keys(changes)
        .map((key, index) => `${key}=$${index + 1}`)
        .join(', '),
      columnsParams = Object.values(changes),
      { sqlCondition, conditionParams } = this.sqlCondition<RowType>(
        condition,
        columnsParams.length
      ),
      sqlQuery = `UPDATE ${tableName} SET ${columnsBindings} ${sqlCondition} RETURNING *;`;

    return {
      sqlQuery,
      queryParams: columnsParams.concat(conditionParams),
    };
  }

  static sqlDeleteQuery<RowType>(
    tableName: string,
    condition: SqlCondition<RowType> | void
  ): GeneratedSqlQuery {
    const { sqlCondition, conditionParams } =
        this.sqlCondition<RowType>(condition),
      sqlQuery = `DELETE FROM ${tableName} ${sqlCondition} RETURNING *;`;

    return {
      sqlQuery,
      queryParams: conditionParams,
    };
  }

  async index(
    selectOptions: SqlSelectOptions<RowType> = {}
  ): Promise<RowType[]> {
    const tableName = this.tableName,
      { sqlQuery, queryParams } = CoreModel.sqlSelectQuery(
        tableName,
        selectOptions
      ),
      client = await this.db.connect(),
      result = await client.query(sqlQuery, queryParams);

    client.release();

    return result.rows || [];
  }

  async findOne(
    selectOptions: SqlSelectOptions<RowType> = {}
  ): Promise<RowType | null> {
    const rowResult = await this.index(
      Object.assign(selectOptions, { limit: 1 })
    );

    return rowResult[0] || null;
  }

  async checkExistence(
    condition: SqlSelectOptions<RowType>['condition']
  ): Promise<boolean> {
    return !!parseInt(
      (await this.findOne({ condition, projection: ['count(id)'] }))?.count
    );
  }

  async create(newRow: RowType): Promise<QueryResult> {
    const tableName = this.tableName,
      { sqlQuery, queryParams } = CoreModel.sqlInsertQuery<RowType>(
        tableName,
        newRow
      ),
      client = await this.db.connect(),
      result = await client.query(sqlQuery, queryParams);

    client.release();

    return result;
  }

  async update(updateOptions: SqlUpdateOptions<RowType>): Promise<QueryResult> {
    const tableName = this.tableName,
      { sqlQuery, queryParams } = CoreModel.sqlUpdateQuery<RowType>(
        tableName,
        updateOptions
      );

    const client = await this.db.connect(),
      result = await client.query(sqlQuery, queryParams);

    client.release();

    return result;
  }

  async delete(condition?: SqlCondition<RowType>): Promise<QueryResult> {
    const tableName = this.tableName,
      { sqlQuery, queryParams } = CoreModel.sqlDeleteQuery<RowType>(
        tableName,
        condition
      ),
      client = await this.db.connect(),
      result = await client.query(sqlQuery, queryParams);

    client.release();

    return result;
  }
}

export type SqlCondition<RowType> = Partial<RowType>;

export type SqlProjection<RowType> = (keyof Partial<RowType>)[];

export type SqlJoinTypes = 'LEFT' | 'INNER' | 'RIGHT' | 'OUTER';

export type SqlSelectOptions<RowType> = {
  condition?: SqlCondition<RowType>;
  projection?: SqlProjection<RowType>;
  join?: [SqlJoinTypes, string, string][];
  group?: string[];
  limit?: number;
};

export type SqlUpdateOptions<RowType> = {
  condition?: SqlCondition<RowType>;
  changes: Partial<RowType>;
};

export type GeneratedSqlCondition = {
  sqlCondition: string;
  conditionParams?: QueryResultRow['key'][];
};

export type GeneratedSqlQuery = {
  sqlQuery: string;
  queryParams?: QueryResultRow['key'][];
};
