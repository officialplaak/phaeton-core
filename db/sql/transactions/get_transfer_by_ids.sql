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
  DESCRIPTION: Gets transfer transactions from a list of id-s.

  PARAMETERS:
      ids - array of transaction id-s
*/

SELECT
    "transactionId" AS transaction_id,
    convert_from(data, 'utf8') AS tf_data
FROM transfer
WHERE "transactionId" IN (${ids:csv})
