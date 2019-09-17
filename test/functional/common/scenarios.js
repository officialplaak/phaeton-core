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
var accountFixtures = require('../../fixtures/accounts');
var randomUtil = require('../../common/utils/random');

function Multisig(options) {
	if (!options) {
		options = {};
	}

	this.account = randomUtil.account();
	this.members = [];
	this.keysgroup = [];

	if (!options.members) {
		options.members = 3;
	}
	var i;
	var auxAccount;
	for (i = 0; i < options.members - 1; i++) {
		auxAccount = randomUtil.account();
		this.members.push(auxAccount);
		this.keysgroup.push(`${auxAccount.publicKey}`);
	}

	this.minimum = options.min || options.members - 1;
	this.lifetime = options.lifetime || 1;
	this.amount = options.amount || 100000000000;

	this.multiSigTransaction = phaeton.transaction.registerMultisignature({
		passphrase: this.account.passphrase,
		keysgroup: this.keysgroup,
		lifetime: this.lifetime,
		minimum: this.minimum,
	});
	this.creditTransaction = phaeton.transaction.transfer({
		amount: this.amount,
		passphrase: accountFixtures.genesis.passphrase,
		recipientId: this.account.address,
	});
	this.secondSignatureTransaction = phaeton.transaction.registerSecondPassphrase({
		passphrase: this.account.passphrase,
		secondPassphrase: this.account.secondPassphrase,
	});
}

module.exports = {
	Multisig,
};
