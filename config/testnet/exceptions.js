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

module.exports = {
	blockRewards: [
		'11807740622680299921', // 2161
		'5714016151987080352', // 2162
	],
	senderPublicKey: [
		'5252526207733553499', // 464289
	],
	signatures: [
		'3274071402587084244', // 595491
		'10403141873189588012', // 624550
		'16896494584440078079', // 631670
	],
	multisignatures: [
		'8191213966308378713', // 952880
		'8031165757158212499', // 979109
		'6741135886562440478', // 982288
	],
	votes: [
		'16272500600161825502', // 336424
		'17197328760149985951', // 341635
		'18231026627962552928', // 917323
	],
	inertTransactions: [
		'16394286522174687330', // 1318685 - Vote transaction
		'12298100805070303137', // 3057955 - Delegate transaction
	],
	precedent: {
		disableDappTransfer: 5594491, // Disable Dapp Transfer at this block height
	},
};
