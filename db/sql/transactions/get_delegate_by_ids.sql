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


/*
  DESCRIPTION: Gets delegate transactions by from a list of id-s.

  PARAMETERS:
      - ids: array of transaction id-s
*/

SELECT "transactionId" AS transaction_id, username AS d_username
FROM delegates
WHERE "transactionId" IN (${ids:csv})
