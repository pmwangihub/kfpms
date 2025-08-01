





import Dexie from 'dexie';

/**
 * Dexie database for offline storage in KFPMS.
 * @class
 */
class KFPMS_Db extends Dexie {
  /**
   * @type {import('dexie').Table} Beneficiaries table
   */
  beneficiaries;
  /**
   * @type {import('dexie').Table} Funds table
   */
  funds;
  /**
   * @type {import('dexie').Table} Transactions table
   */
  transactions;
  /**
   * @type {import('dexie').Table} Sync queue table
   */
  syncQueue;

  constructor() {
    super('KFPMS_DB');
    this.version(1).stores({
      beneficiaries: '++id,name,age,location,created_at,updated_at',
      funds: '++id,amount,source,allocated_at,description',
      transactions: '++id,fund_id,amount,recipient,date,status',
      syncQueue: '++id,action,model_name,timestamp',
    });
  }
}

export const db = new KFPMS_Db();

window.db = db;