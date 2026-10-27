const assert = require("node:assert/strict");
const { test } = require("node:test");
const { somar } = require("../src");

test("soma numeros positivos", () => {
  assert.equal(somar(2, 3, 5), 10);
});

test("soma numeros negativos e decimais", () => {
  assert.equal(somar(-2, 1.5), -0.5);
});

test("retorna zero sem argumentos", () => {
  assert.equal(somar(), 0);
});

test("rejeita texto, NaN e infinitos", () => {
  for (const invalido of ["2", NaN, Infinity, -Infinity, null, undefined]) {
    assert.throws(() => somar(1, invalido), TypeError);
  }
});
