declare module "pg" {
  export interface PoolConfig {
    connectionString?: string;
    [key: string]: unknown;
  }

  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number | null;
    [key: string]: unknown;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query<T = any>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}
