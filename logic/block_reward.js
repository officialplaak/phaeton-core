/*
 * Copyright © 2018 Plaak Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Plaak Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */

'use strict';

const Bignum = require('../helpers/bignum.js');

const constants = global.constants;

const __private = {};
/**
 * Main BlockReward logic.
 * Initializes variables:
 * - milestones
 * - distance
 * - rewardOffset
 *
 * @class
 * @memberof logic
 * @see Parent: {@link logic}
 */
class BlockReward {
	constructor() {
		// Array of milestones
		this.milestones = constants.rewards.milestones;

		// Distance between each milestone
		this.distance = Math.floor(constants.rewards.distance);

		// Start rewards at block (n)
		this.rewardOffset = Math.floor(constants.rewards.offset);
	}

	/**
	 * Description of the function.
	 *
	 * @param {number} height
	 * @returns {number}
	 * @todo Add description for the function, params and the return value
	 */
	calcMilestone(height) {
		height = __private.parseHeight(height);

		const location = Math.trunc((height - this.rewardOffset) / this.distance);
		const lastMile = this.milestones[this.milestones.length - 1];

		if (location > this.milestones.length - 1) {
			return this.milestones.lastIndexOf(lastMile);
		}
		return location;
	}

	/**
	 * Description of the function.
	 *
	 * @param {number} height
	 * @returns {Bignumber}
	 * @todo Add description for the function, params and the return value
	 */
	calcReward(height) {
		height = __private.parseHeight(height);

		if (height < this.rewardOffset) {
			return new Bignum(0);
		}
		return new Bignum(this.milestones[this.calcMilestone(height)]);
	}

	/**
	 * Description of the function.
	 *
	 * @param {number} height
	 * @returns {Bignumber}
	 * @todo Add description for the function, params and the return value
	 */
	calcSupply(height) {
		height = __private.parseHeight(height);
		const supply = new Bignum(constants.totalAmount);

		if (height < this.rewardOffset) {
			// Rewards not started yet
			return supply;
		}

		const milestone = this.calcMilestone(height);
		const rewards = [];

		let amount = 0;
		let multiplier = 0;

		// Remove offset from height
		height -= this.rewardOffset - 1;

		for (let i = 0; i < this.milestones.length; i++) {
			if (milestone >= i) {
				multiplier = this.milestones[i];

				if (height < this.distance) {
					// Measure this.distance thus far
					amount = height % this.distance;
				} else {
					amount = this.distance; // Assign completed milestone
					height -= this.distance; // Deduct from total height

					// After last milestone
					if (height > 0 && i === this.milestones.length - 1) {
						amount += height;
					}
				}

				rewards.push([amount, multiplier]);
			} else {
				break; // Milestone out of bounds
			}
		}

		for (let i = 0; i < rewards.length; i++) {
			const reward = rewards[i];
			supply.plus(new Bignum(reward[0]).mul(reward[1]));
		}

		return supply;
	}
}

/**
 * Returns absolute value from number.
 *
 * @private
 * @param {number} height
 * @returns {number}
 * @throws If block height invalid
 * @todo Add description for the params and the return value
 */
__private.parseHeight = function(height) {
	if (isNaN(height)) {
		throw 'Invalid block height';
	} else {
		return Math.abs(height);
	}
};

module.exports = BlockReward;
