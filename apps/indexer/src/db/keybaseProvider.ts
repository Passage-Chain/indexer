import axios from "axios";
import { and, db, eq, isNotNull, ne, validator as validatorTable } from "database";

export async function fetchValidatorKeybaseInfos() {
  const validators = await db.query.validator.findMany({
    where: and(isNotNull(validatorTable.identity), ne(validatorTable.identity, ""))
  });

  const requests = validators.map(async (validator) => {
    try {
      if (!validator.identity || !/^[A-F0-9]{16}$/.test(validator.identity)) {
        console.warn("Invalid identity " + validator.identity + " for validator " + validator.operatorAddress);
        return Promise.resolve();
      }

      console.log("Fetching keybase info for " + validator.operatorAddress);
      const { data } = await axios.get(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${validator.identity}`);

      if (data.status.name === "OK" && data.them.length > 0) {
        validator;
        await db
          .update(validatorTable)
          .set({
            keybaseUsername: data.them[0].basics?.username,
            keybaseAvatarUrl: data.them[0].pictures?.primary?.url
          })
          .where(eq(validatorTable.id, validator.id))
          .execute();
      }
    } catch (err) {
      console.error("Error while fetching keybase info for " + validator.operatorAddress);
      throw err;
    }
  });

  await Promise.allSettled(requests);
}
