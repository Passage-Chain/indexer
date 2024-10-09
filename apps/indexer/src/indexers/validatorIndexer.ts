import { MsgCreateValidator, MsgEditValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import * as benchmark from "../shared/utils/benchmark";
import { Indexer } from "./indexer";
import { fromBase64, fromBech32, toBech32, toHex } from "@cosmjs/encoding";
import { IGenesis, IGenesisValidator, IGentxCreateValidator } from "@src/chain/genesisTypes";
import { pubkeyToRawAddress } from "@src/shared/utils/addresses";
import { DbTransaction, Message, TransactionEventWithAttributes, ValidatorInsert, db, eq, validator as validatorTable } from "database";
import { activeChain } from "@src/shared/constants";

export class ValidatorIndexer extends Indexer {
  msgHandlers: {
    [key: string]: (
      msgSubmitProposal: any,
      height: number,
      blockGroupTransaction: DbTransaction,
      msg: Message,
      txEvents: TransactionEventWithAttributes[]
    ) => Promise<void>;
  };

  constructor() {
    super();
    this.name = "ValidatorIndexer";
    this.msgHandlers = {
      "/cosmos.staking.v1beta1.MsgCreateValidator": this.handleCreateValidator,
      "/cosmos.staking.v1beta1.MsgEditValidator": this.handleEditValidator
    };
  }

  @benchmark.measureMethodAsync
  async seed(genesis: IGenesis) {
    const validators = genesis.app_state.staking.validators;

    await db.transaction(async (dbTransaction) => {
      for (const validator of validators) {
        console.log("Creating validator :" + validator.operator_address);

        await this.createValidatorFromGenesis(validator, dbTransaction);
      }

      // TODO: Handle any gentx txs types
      const msgs = genesis.app_state.genutil.gen_txs
        .flatMap((tx) => tx.body.messages)
        .filter((x) => x["@type"] === "/cosmos.staking.v1beta1.MsgCreateValidator") as IGentxCreateValidator[];

      for (const msg of msgs) {
        console.log("Creating validator :" + msg.validator_address);

        await this.createValidatorFromGentx(msg, dbTransaction);
      }
    });
  }
  private async createValidatorFromGentx(validator: IGentxCreateValidator, dbTransaction: DbTransaction) {
    await dbTransaction.insert(validatorTable).values({
      operatorAddress: validator.validator_address,
      accountAddress: toBech32(activeChain.bech32Prefix, fromBech32(validator.delegator_address).data),
      hexAddress: toHex(pubkeyToRawAddress(validator.pubkey["@type"], fromBase64(validator.pubkey.key))).toUpperCase(),
      moniker: validator.description.moniker,
      identity: validator.description.identity,
      website: validator.description.website,
      description: validator.description.details,
      securityContact: validator.description.security_contact,
      rate: validator.commission.rate,
      maxRate: validator.commission.max_rate,
      maxChangeRate: validator.commission.max_change_rate,
      minSelfDelegation: parseInt(validator.min_self_delegation)
    });
  }

  private async createValidatorFromGenesis(validator: IGenesisValidator, dbTransaction: DbTransaction) {
    await dbTransaction.insert(validatorTable).values({
      operatorAddress: validator.operator_address,
      accountAddress: toBech32(activeChain.bech32Prefix, fromBech32(validator.operator_address).data),
      hexAddress: toHex(pubkeyToRawAddress(validator.consensus_pubkey["@type"], fromBase64(validator.consensus_pubkey.key))).toUpperCase(),
      moniker: validator.description.moniker,
      identity: validator.description.identity,
      website: validator.description.website,
      description: validator.description.details,
      securityContact: validator.description.security_contact,
      rate: validator.commission.commission_rates.rate,
      maxRate: validator.commission.commission_rates.max_rate,
      maxChangeRate: validator.commission.commission_rates.max_change_rate,
      minSelfDelegation: parseInt(validator.min_self_delegation)
    });
  }

  private async handleCreateValidator(decodedMessage: MsgCreateValidator, height: number, dbTransaction: DbTransaction, msg: Message) {
    if (!decodedMessage.pubkey) throw new Error("Pubkey not found in MsgCreateValidator (height: " + height + ")");

    const validatorInfo: ValidatorInsert = {
      operatorAddress: decodedMessage.validatorAddress,
      accountAddress: decodedMessage.delegatorAddress,
      hexAddress: toHex(pubkeyToRawAddress(decodedMessage.pubkey.typeUrl, decodedMessage.pubkey.value.slice(2))).toUpperCase(),
      createdMsgId: msg?.id,
      moniker: decodedMessage.description.moniker,
      identity: decodedMessage.description.identity,
      website: decodedMessage.description.website,
      description: decodedMessage.description.details,
      securityContact: decodedMessage.description.securityContact,
      rate: decodedMessage.commission.rate,
      maxRate: decodedMessage.commission.maxRate,
      maxChangeRate: decodedMessage.commission.maxChangeRate,
      minSelfDelegation: parseInt(decodedMessage.minSelfDelegation)
    };

    const existingValidator = await dbTransaction.query.validator.findFirst({ where: eq(validatorTable.operatorAddress, decodedMessage.validatorAddress) });

    if (!existingValidator) {
      console.log(`Creating validator ${decodedMessage.validatorAddress}`);
      await dbTransaction.insert(validatorTable).values(validatorInfo);
    } else {
      console.log(`Updating validator ${decodedMessage.validatorAddress}`);
      await dbTransaction.update(validatorTable).set(validatorInfo).where(eq(validatorTable.operatorAddress, decodedMessage.validatorAddress));
    }
  }

  private async handleEditValidator(decodedMessage: MsgEditValidator, height: number, dbTransaction: DbTransaction, msg: Message) {
    const validator = await dbTransaction.query.validator.findFirst({
      where: eq(validatorTable.operatorAddress, decodedMessage.validatorAddress)
    });

    if (!validator) throw new Error(`Validator not found: ${decodedMessage.validatorAddress}`);

    if (decodedMessage.description.moniker !== "[do-not-modify]") {
      validator.moniker = decodedMessage.description.moniker;
    }
    if (decodedMessage.description.identity !== "[do-not-modify]") {
      validator.identity = decodedMessage.description.identity;
    }
    if (decodedMessage.description.website !== "[do-not-modify]") {
      validator.website = decodedMessage.description.website;
    }
    if (decodedMessage.description.details !== "[do-not-modify]") {
      validator.description = decodedMessage.description.details;
    }
    if (decodedMessage.description.securityContact !== "[do-not-modify]") {
      validator.securityContact = decodedMessage.description.securityContact;
    }
    if (decodedMessage.commissionRate) {
      validator.rate = decodedMessage.commissionRate;
    }
    if (decodedMessage.minSelfDelegation) {
      validator.minSelfDelegation = parseInt(decodedMessage.minSelfDelegation);
    }

    await dbTransaction.update(validatorTable).set(validator).where(eq(validatorTable.id, validator.id));
  }
}
