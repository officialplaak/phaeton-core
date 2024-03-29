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

var async = require('async');
var phaeton = require('phaeton-validator').default;
var accountFixtures = require('../../../fixtures/accounts');
var localCommon = require('../common');

const constants = global.constants;

describe('system test (type 0) - address collision', () => {
	var library;
	localCommon.beforeBlock('system_0_0_address_collision', lib => {
		library = lib;
	});

	var collision = {
		address: '13555181540209512417L',
		passphrases: [
			'merry field slogan sibling convince gold coffee town fold glad mix page',
			'annual youth lift quote off olive uncle town chief poverty extend series',
		],
	};

	var publicKeys = [
		phaeton.cryptography.getPrivateAndPublicKeyFromPassphrase(
			collision.passphrases[0]
		).publicKey,
		phaeton.cryptography.getPrivateAndPublicKeyFromPassphrase(
			collision.passphrases[1]
		).publicKey,
	];

	var firstTransaction = phaeton.transaction.transfer({
		amount: 10 * constants.normalizer,
		passphrase: collision.passphrases[0],
		recipientId: accountFixtures.genesis.address,
	});

	var secondTransaction = phaeton.transaction.transfer({
		amount: 10 * constants.normalizer,
		passphrase: collision.passphrases[1],
		recipientId: accountFixtures.genesis.address,
	});

	var firstTransactionWithData = phaeton.transaction.transfer({
		amount: 10 * constants.normalizer,
		passphrase: collision.passphrases[0],
		recipientId: accountFixtures.genesis.address,
		data: 'addtional data from 1',
	});

	var secondTransactionWithData = phaeton.transaction.transfer({
		amount: 10 * constants.normalizer,
		passphrase: collision.passphrases[1],
		recipientId: accountFixtures.genesis.address,
		data: 'addtional data from 2',
	});

	before(done => {
		var creditTransaction = phaeton.transaction.transfer({
			amount: 1000 * constants.normalizer,
			passphrase: accountFixtures.genesis.passphrase,
			recipientId: collision.address,
			data: 'addtional data from 2',
		});

		localCommon.addTransactionsAndForge(library, [creditTransaction], () => {
			done();
		});
	});

	it('both passphrases should have the same address', done => {
		expect(phaeton.cryptography.getAddressFromPublicKey(publicKeys[0])).to.equal(
			phaeton.cryptography.getAddressFromPublicKey(publicKeys[1])
		);
		done();
	});

	describe('when two passphrases collide into the same address', () => {
		it('adding to pool transfer should be ok for passphrase one', done => {
			localCommon.addTransaction(library, firstTransaction, (err, res) => {
				expect(err).to.be.null;
				expect(res).to.equal(firstTransaction.id);
				done();
			});
		});

		it('adding to pool transfer fail for passphrase two', done => {
			localCommon.addTransaction(library, secondTransaction, (err, res) => {
				expect(res).to.be.undefined;
				expect(err).to.be.not.null;
				expect(err).to.equal(
					`Invalid sender public key: ${publicKeys[1]} expected: ${
						publicKeys[0]
					}`
				);
				done();
			});
		});

		describe('after forging one block', () => {
			before(done => {
				localCommon.forge(library, (err, res) => {
					expect(err).to.be.null;
					expect(res).to.be.undefined;
					done();
				});
			});

			it('first transaction to arrive should be included', done => {
				var filter = {
					id: firstTransaction.id,
				};

				localCommon.getTransactionFromModule(library, filter, (err, res) => {
					expect(err).to.be.null;
					expect(res)
						.to.have.property('transactions')
						.which.is.an('Array');
					expect(res.transactions.length).to.equal(1);
					expect(res.transactions[0].id).to.equal(firstTransaction.id);
					done();
				});
			});

			it('last transaction to arrive should not be included', done => {
				var filter = {
					id: secondTransaction.id,
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

			it('publicKey from the first passphrase should be cemented and not the second one', done => {
				async.waterfall(
					[
						function(seriesCb) {
							localCommon.addTransaction(
								library,
								firstTransactionWithData,
								(err, res) => {
									expect(err).to.be.null;
									expect(res).to.equal(firstTransactionWithData.id);
									seriesCb();
								}
							);
						},
						function(seriesCb) {
							localCommon.addTransaction(
								library,
								secondTransactionWithData,
								(err, res) => {
									expect(res).to.be.undefined;
									expect(err).to.be.not.null;
									expect(err).to.equal(
										`Invalid sender public key: ${publicKeys[1]} expected: ${
											publicKeys[0]
										}`
									);
									seriesCb();
								}
							);
						},
					],
					err => {
						done(err);
					}
				);
			});
		});
	});
});
