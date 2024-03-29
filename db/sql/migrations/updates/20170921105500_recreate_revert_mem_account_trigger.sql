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
  DESCRIPTION: Recreate revert_mem_account trigger;
               Allowing 'u_username' and 'username' fields to be set to NULL when undoing transactions

  PARAMETERS: None
*/

CREATE OR REPLACE FUNCTION revert_mem_account() RETURNS TRIGGER LANGUAGE PLPGSQL AS $$

BEGIN

  -- As per columns marked as immutable within application layer (logic/account.js).

  -- Revert any change of address
  IF NEW."address" <> OLD."address" THEN
    RAISE WARNING 'Reverting change of address from % to %', OLD."address", NEW."address";
    NEW."address" = OLD."address";
  END IF;

  -- Revert any change of u_username except of setting to null (see pop last block procedures)
  IF NEW."u_username" <> OLD."u_username" AND NEW."u_username" IS NOT NULL AND OLD."u_username" IS NOT NULL THEN
    RAISE WARNING 'Reverting change of u_username from % to %', OLD."u_username", NEW."u_username";
    NEW."u_username" = OLD."u_username";
  END IF;

  -- Revert any change of username except of setting to null (see pop last block procedures)
  IF NEW."username" <> OLD."username" AND NEW."username" IS NOT NULL AND OLD."username" IS NOT NULL THEN
    RAISE WARNING 'Reverting change of username from % to %', OLD."username", NEW."username";
    NEW."username" = OLD."username";
  END IF;

  -- Revert any change of virginity
  -- If account is no longer a virgin
  IF NEW."virgin" <> OLD."virgin" AND OLD."virgin" = 0 THEN
    RAISE WARNING 'Reverting change of virgin from % to %', OLD."virgin", NEW."virgin";
    NEW."virgin" = OLD."virgin";
  END IF;

  -- Revert any change of publicKey
  -- If account is no longer a virgin
  -- And publicKey is already set
  IF NEW."publicKey" <> OLD."publicKey" AND OLD."virgin" = 0 AND OLD."publicKey" IS NOT NULL THEN
    RAISE WARNING 'Reverting change of publicKey from % to %', ENCODE(OLD."publicKey", 'hex'), ENCODE(NEW."publicKey", 'hex');
    NEW."publicKey" = OLD."publicKey";
  END IF;

  -- Revert any change of secondPublicKey
  -- If secondPublicKey is already set
  IF NEW."secondPublicKey" <> OLD."secondPublicKey" AND OLD."secondPublicKey" IS NOT NULL THEN
    RAISE WARNING 'Reverting change of secondPublicKey from % to %', ENCODE(OLD."secondPublicKey", 'hex'),  ENCODE(NEW."secondPublicKey", 'hex');
    NEW."secondPublicKey" = OLD."secondPublicKey";
  END IF;

  RETURN NEW;

END $$;
