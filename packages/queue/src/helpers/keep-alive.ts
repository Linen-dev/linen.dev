import type { JobHelpers } from 'graphile-worker';

export class KeepAlive {
  intervalID: NodeJS.Timer | undefined;
  helpers: JobHelpers;
  interval = 1000 * 60 * 2; // 2 minutes

  constructor(helpers: JobHelpers) {
    this.helpers = helpers;
  }

  start() {
    this.intervalID = setInterval(async () => {
      await this.helpers.withPgClient((pgClient) =>
        pgClient.query(
          `UPDATE graphile_worker.jobs SET locked_at=$1 WHERE id=$2`,
          [new Date(), this.helpers.job.id]
        )
      );
      this.helpers.logger.info('keep alive');
    }, this.interval);
  }

  end() {
    clearInterval(this.intervalID);
  }
}
