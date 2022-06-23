const { balance, constants, ether, expectEvent, send, expectRevert } = require('@openzeppelin/test-helpers');
const { ZERO_ADDRESS } = constants;

const { expect } = require('chai');

const PaymentSplitter = artifacts.require('PaymentSplitter');
const Token = artifacts.require('HACHIWallet');

contract('PaymentSplitter', function (accounts) {
  const [ owner, payee1, payee2, payee3, nonpayee1, payer1 ] = accounts;

  const amount = ether('1');

  it('rejects an empty set of payees', async function () {
    await expectRevert(PaymentSplitter.new([], []), 'PaymentSplitter: no payees');
  });

  it('rejects more payees than shares', async function () {
    await expectRevert(PaymentSplitter.new([payee1, payee2, payee3], [20, 30]),
      'PaymentSplitter: payees and shares length mismatch',
    );
  });

  it('rejects more shares than payees', async function () {
    await expectRevert(PaymentSplitter.new([payee1, payee2], [20, 30, 40]),
      'PaymentSplitter: payees and shares length mismatch',
    );
  });

  it('rejects null payees', async function () {
    await expectRevert(PaymentSplitter.new([payee1, ZERO_ADDRESS], [20, 30]),
      'PaymentSplitter: account is the zero address',
    );
  });

  it('rejects zero-valued shares', async function () {
    await expectRevert(PaymentSplitter.new([payee1, payee2], [20, 0]),
      'PaymentSplitter: shares are 0',
    );
  });

  it('rejects repeated payees', async function () {
    await expectRevert(PaymentSplitter.new([payee1, payee1], [20, 30]),
      'PaymentSplitter: account already has shares',
    );
  });
});