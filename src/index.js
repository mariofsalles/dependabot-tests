const Decimal = require("decimal.js");

function somar(...numeros) {
  if (!numeros.every(Number.isFinite)) {
    throw new TypeError("Use apenas numeros finitos.");
  }

  return Decimal.sum(0, ...numeros).toNumber();
}

module.exports = { somar };
