const brokersLifeCycle = require('./brokers/brokersLifeCycle');

describe('Brokers', () => {
  it('start brokers', async () => {
      return brokersLifeCycle.startBrokers();
  });

  it('stop brokers', async () => {
      return brokersLifeCycle.stopBrokers();
  });
});

describe('Brokers in remote process', () => {
    it('start brokers', async () => {
        return brokersLifeCycle.startBrokers(true);
    });
  
    it('stop brokers', async () => {
        return brokersLifeCycle.stopBrokers(true);
    });
  });
  
  