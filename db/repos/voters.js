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

const sql = require('../sql').voters;

/**
 * Voters database interaction class.
 *
 * @class
 * @memberof db.repos
 * @requires db/sql
 * @see Parent: {@link db.repos}
 * @param {Database} db - Instance of database object from pg-promise
 * @param {Object} pgp - pg-promise instance to utilize helpers
 * @returns {Object} An instance of a VotersRepository
 */
class VotersRepository {
	constructor(db, pgp) {
		this.db = db;
		this.pgp = pgp;

		// TODO: A proper repository shouldn't need to export any properties like this:
		this.sortFields = ['username', 'address', 'publicKey'];
	}

	/**
	 * Searches the voters for a delegate with a public Key.
	 *
	 * @param {Object} params
	 * @param {string} params.publicKey
	 * @param {int} params.limit
	 * @param {int} params.offset
	 * @returns {Promise}
	 * @todo Add description for the params and the return value
	 */
	list(params) {
		// TODO: Should use a result-specific method, not .query
		if(params.limit) {
			return this.db.query(sql.getVoters, params);
		} else {
			return this.db.query(sql.getAllVoters, params);
		}
	}

	/**
	 * Counts voters for a delegate with a public key.
	 *
	 * @param {string} publicKey
	 * @returns {Promise<number>}
	 * @todo Add description for the params and the return value
	 */
	count(publicKey) {
		return this.db.one(sql.getVotersCount, publicKey, a => +a.count);
	}
}

module.exports = VotersRepository;
