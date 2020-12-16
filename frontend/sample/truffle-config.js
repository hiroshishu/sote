module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "data-seed-prebsc-1-s1.binance.org",
      port: 8545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    }
  }
};
