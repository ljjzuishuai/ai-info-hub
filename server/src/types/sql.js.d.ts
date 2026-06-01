declare module 'sql.js' {
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }
  interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): QueryExecResult[];
    prepare(sql: string): Statement;
    export(): Uint8Array;
    getRowsModified(): number;
    close(): void;
  }
  interface Statement {
    bind(params?: any[]): boolean;
    step(): boolean;
    get(): any[];
    getColumnNames(): string[];
    getAsObject(params?: any): Record<string, any>;
    free(): boolean;
    reset(): void;
  }
  interface QueryExecResult {
    columns: string[];
    values: any[][];
  }
  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
  export { SqlJsStatic, Database, Statement };
}
