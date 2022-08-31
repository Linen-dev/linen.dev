import { makeWorkerUtils, type WorkerUtils } from 'graphile-worker';

const WorkerSingleton = (function () {
  let instance: WorkerUtils;

  function createInstance() {
    return makeWorkerUtils({
      connectionString: process.env.DATABASE_URL,
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
