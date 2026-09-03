// Database disabled mode for reliable deployment
// All persistent storage operates in browser LocalStorage

export function getDbPool(): any {
  return null;
}

export async function checkDbConnection(): Promise<{
  connected: boolean;
  disabled: boolean;
  message: string;
  host: string;
  database: string;
  tables: string[];
}> {
  return {
    connected: false,
    disabled: true,
    message: 'База данных отключена (автономный режим Local Storage)',
    host: 'Local Storage',
    database: 'Browser Cache',
    tables: []
  };
}

export async function initDbSchema(): Promise<boolean> {
  return true;
}
