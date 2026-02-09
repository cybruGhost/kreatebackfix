import initSqlJs from 'sql.js';

export interface TableSchema {
  name: string;
  columns: {
    cid: number;
    name: string;
    type: string;
    notnull: boolean;
    dflt_value: string | null;
    pk: boolean;
  }[];
  rowCount: number;
  sampleData: Record<string, unknown>[];
}

export interface DatabaseAnalysis {
  tables: TableSchema[];
  errors: string[];
}

let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

async function getSqlJs() {
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });
  }
  return SQL;
}

export async function analyzeDatabase(buffer: ArrayBuffer): Promise<DatabaseAnalysis> {
  const SqlJs = await getSqlJs();
  const db = new SqlJs.Database(new Uint8Array(buffer));

  const result: DatabaseAnalysis = {
    tables: [],
    errors: [],
  };

  try {
    // Get all tables
    const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const tableNames = tablesResult[0]?.values.map(v => String(v[0])) || [];

    for (const tableName of tableNames) {
      try {
        // Get column info
        const columnsResult = db.exec(`PRAGMA table_info("${tableName}")`);
        const columns = columnsResult[0]?.values.map(row => ({
          cid: Number(row[0]),
          name: String(row[1]),
          type: String(row[2]),
          notnull: Boolean(row[3]),
          dflt_value: row[4] !== null ? String(row[4]) : null,
          pk: Boolean(row[5]),
        })) || [];

        // Get row count
        const countResult = db.exec(`SELECT COUNT(*) FROM "${tableName}"`);
        const rowCount = Number(countResult[0]?.values[0]?.[0] || 0);

        // Get sample data (first 3 rows)
        const sampleResult = db.exec(`SELECT * FROM "${tableName}" LIMIT 3`);
        const sampleData: Record<string, unknown>[] = [];
        
        if (sampleResult[0]) {
          const cols = sampleResult[0].columns;
          for (const row of sampleResult[0].values) {
            const obj: Record<string, unknown> = {};
            cols.forEach((col, i) => {
              obj[col] = row[i];
            });
            sampleData.push(obj);
          }
        }

        result.tables.push({
          name: tableName,
          columns,
          rowCount,
          sampleData,
        });
      } catch (e) {
        result.errors.push(`Error analyzing table ${tableName}: ${e instanceof Error ? e.message : 'Unknown'}`);
      }
    }

    db.close();
  } catch (error) {
    result.errors.push(`Database analysis error: ${error instanceof Error ? error.message : 'Unknown'}`);
  }

  return result;
}

// Fetch and analyze a database from URL
export async function fetchAndAnalyzeDatabase(url: string): Promise<DatabaseAnalysis> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return analyzeDatabase(buffer);
}
