/*
 * Copyright © 2018 Phaeton Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Phaeton Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

var phaeton = require('phaeton-validator').default;
var accountFixtures = require('../../../fixtures/accounts');
var randomUtil = require('../../../common/utils/random');
var localCommon = require('../common');

const constants = global.constants;

describe('system test (type 0) - double transfers', () => {
	var library;
	localCommon.beforeBlock('system_0_0_transfer', lib => {
		library = lib;
	});

	var i = 0;
	var t = 0;
	/* eslint-disable no-loop-func */
	while (i < 1) {
		describe('executing 30 times', () => {
			var account = randomUtil.account();
			var transaction = phaeton.transaction.transfer({
				amount: 1100 * constants.normalizer,
				passphrase: accountFixtures.genesis.passphrase,
				recipientId: account.address,
			});
			var transaction1;
			var transaction2;

			before(done => {
				console.info(`Iteration count: ${++t}`);
				localCommon.addTransactionsAndForge(library, [transaction], () => {
					done();
				});
			});

			it('adding to pool transfer should be ok', done => {
				transaction1 = phaeton.transaction.transfer({
					amount: 1000 * constants.normalizer,
					passphrase: account.passphrase,
					recipientId: accountFixtures.genesis.address,
					timeOffset: -10000,
				});
				localCommon.addTransaction(library, transaction1, (err, res) => {
					expect(res).to.equal(transaction1.id);
					done();
				});
			});

			it('adding to pool same transfer with different timestamp should be ok', done => {
				transaction2 = phaeton.transaction.transfer({
					amount: 1000 * constants.normalizer,
					passphrase: account.passphrase,
					recipientId: accountFixtures.genesis.address,
				});
				localCommon.addTransaction(library, transaction2, (err, res) => {
					expect(res).to.equal(transaction2.id);
					done();
				});
			});

			describe('after forging one block', () => {
				before(done => {
					localCommon.forge(library, () => {
						done();
					});
				});

				it('first transaction to arrive should not be included', done => {
					var filter = {
						id: transaction1.id,
					};
					localCommon.getTransactionFromModule(library, filter, (err, res) => {
						expect(err).to.be.null;
						expect(res)
							.to.have.property('transactions')
							.which.is.an('Array');
						expect(res.transactions.length).to.equal(0);
						done();
					});
				});

				it('last transaction to arrive should be included', done => {
					var filter = {
						id: transaction2.id,
					};
					localCommon.getTransactionFromModule(library, filter, (err, res) => {
						expect(err).to.be.null;
						expect(res)
							.to.have.property('transactions')
							.which.is.an('Array');
						expect(res.transactions.length).to.equal(1);
						expect(res.transactions[0].id).to.equal(transaction2.id);
						done();
					});
				});

				it('adding to pool transfer for same account should fail', done => {
					localCommon.addTransaction(library, transaction1, err => {
						expect(err).to.match(/^Account does not have enough LSK: /);
						done();
					});
				});
			});
		});
		i++;
	}
});
