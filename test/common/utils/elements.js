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

var elements = {};

elements.redoSignature = function(transaction, passphrase) {
	delete transaction.signature;
	transaction.signature = phaeton.transaction.utils.signTransaction(
		transaction,
		passphrase
	);
	transaction.id = phaeton.transaction.utils.getTransactionId(transaction);
	return transaction;
};

// Exports
module.exports = elements;
