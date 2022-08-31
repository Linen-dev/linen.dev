import { makeWorkerUtils, type WorkerUtils } from 'graphile-worker';
import { buildConnectionString } from 'utilities/database';

const WorkerSingleton = (function () {
  let instance: WorkerUtils;

  function createInstance() {
    return makeWorkerUtils({
      connectionString: buildConnectionString({
        dbUrl: process.env.DATABASE_URL,
        cert: process.env.RDS_CERTIFICATE,
      }),
    });
  }

  return {
    getInstance: async function () {
      if (!instance) {
        instance = await createInstance();
      }
      return instance;
    },
  };
})();

export default WorkerSingleton;
