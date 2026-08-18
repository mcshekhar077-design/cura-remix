import { getSupabaseClient } from './client';
import type { QueryResult, PaginatedQuery } from '../../types/supabase';

// ============== Advanced Query Builder ==============
export class QueryBuilder<T = unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private query: any;
  private table: string;
  private selectFields: string = '*';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private filters: Record<string, { operator: string; value: any }> = {};
  private orderByList: { column: string; ascending: boolean }[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private includeCount: boolean = false;

  constructor(table: string) {
    this.table = table;
    const client = getSupabaseClient();
    this.query = client.from(table);
  }

  select(fields: string | string[]): this {
    this.selectFields = Array.isArray(fields) ? fields.join(',') : fields;
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  where(column: string, operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in', value: any): this {
    this.filters[column] = { operator, value };
    return this;
  }

  orderBy(column: string, ascending: boolean = true): this {
    this.orderByList.push({ column, ascending });
    return this;
  }

  limit(limit: number): this {
    this.limitValue = limit;
    return this;
  }

  offset(offset: number): this {
    this.offsetValue = offset;
    return this;
  }

  withCount(): this {
    this.includeCount = true;
    return this;
  }

  async execute(): Promise<QueryResult<T[]>> {
    try {
      let query = this.query.select(this.selectFields, this.includeCount ? { count: 'exact' } : undefined);

      // Apply filters
      Object.entries(this.filters).forEach(([column, filter]) => {
        const { operator, value } = filter;
        switch (operator) {
          case 'eq': query = query.eq(column, value); break;
          case 'neq': query = query.neq(column, value); break;
          case 'gt': query = query.gt(column, value); break;
          case 'gte': query = query.gte(column, value); break;
          case 'lt': query = query.lt(column, value); break;
          case 'lte': query = query.lte(column, value); break;
          case 'like': query = query.like(column, value); break;
          case 'ilike': query = query.ilike(column, value); break;
          case 'in': query = query.in(column, value); break;
        }
      });

      // Apply ordering
      this.orderByList.forEach(({ column, ascending }) => {
        query = query.order(column, { ascending });
      });

      // Apply pagination
      if (this.limitValue) {
        query = query.limit(this.limitValue);
      }
      if (this.offsetValue !== undefined) {
        query = query.range(this.offsetValue, this.offsetValue + (this.limitValue || 10) - 1);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return {
        data: (data || []) as T[],
        error: null,
        count: count ?? undefined,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Query execution failed'),
      };
    }
  }
}

// ============== Pagination Helper ==============
export const paginate = async <T>(
  table: string,
  page: number = 1,
  pageSize: number = 10,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filters?: Record<string, any>,
  orderBy?: { column: string; ascending?: boolean }
): Promise<PaginatedQuery<T>> => {
  const offset = (page - 1) * pageSize;

  const builder = new QueryBuilder<T>(table)
    .limit(pageSize)
    .offset(offset)
    .withCount();

  if (orderBy) {
    builder.orderBy(orderBy.column, orderBy.ascending ?? true);
  }

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'string' && value.includes('%')) {
        builder.where(key, 'like', value);
      } else {
        builder.where(key, 'eq', value);
      }
    });
  }

  const result = await builder.execute();

  if (result.error) {
    return {
      data: [],
      count: 0,
      page,
      pageSize,
      totalPages: 0,
      error: result.error,
    };
  }

  const totalCount = result.count || 0;
  return {
    data: result.data || [],
    count: totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
    error: null,
  };
};

// ============== Bulk Operations ==============
export const bulkInsert = async <T>(
  table: string,
  records: Partial<T>[],
  options?: { upsert?: boolean; onConflict?: string }
): Promise<QueryResult<T[]>> => {
  try {
    const client = getSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query: any = client.from(table).insert(records as any);

    if (options?.upsert) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query = client.from(table).upsert(records as any, {
        onConflict: options.onConflict || 'id',
      });
    }

    const { data, error } = await query.select();
    if (error) throw error;
    return { data: (data || []) as T[], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Bulk insert failed'),
    };
  }
};

export const bulkDelete = async (
  table: string,
  column: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[]
): Promise<{ error: Error | null; deletedCount?: number }> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(table)
      .delete()
      .in(column, values)
      .select();

    if (error) throw error;
    return { error: null, deletedCount: data?.length || 0 };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Bulk delete failed'),
    };
  }
};

// ============== Soft Delete ==============
export const softDelete = async (
  table: string,
  id: string | number,
  deletedBy?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<QueryResult<any>> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy || null,
        is_deleted: true,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Soft delete failed'),
    };
  }
};

// ============== Restore Soft Deleted ==============
export const restoreSoftDeleted = async (
  table: string,
  id: string | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<QueryResult<any>> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(table)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({
        deleted_at: null,
        deleted_by: null,
        is_deleted: false,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Restore failed'),
    };
  }
};
