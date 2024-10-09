import { MsgSend, MsgMultiSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { MsgFundCommunityPool } from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { MsgDeposit } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgBeginRedelegate, MsgDelegate, MsgUndelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { Indexer } from "./indexer";
import { toBech32 } from "@cosmjs/encoding";
import { DecodedTxRaw, decodePubkey } from "@cosmjs/proto-signing";
import { rawSecp256k1PubkeyToRawAddress } from "@src/shared/utils/addresses";
import { getAmountFromCoin, getAmountFromCoinArray } from "@src/shared/utils/coin";
import { DbTransaction, Message, Transaction, TransactionEventWithAttributes, addressReference } from "database";
import { activeChain } from "@src/shared/constants";

export class MessageAddressesIndexer extends Indexer {
  constructor() {
    super();
    this.name = "MessageAddressesIndexer";
    this.processFailedTxs = true;
    this.msgHandlers = {
      "/cosmos.bank.v1beta1.MsgSend": this.handleMsgSend,
      "/cosmos.distribution.v1beta1.MsgFundCommunityPool": this.handleMsgFundCommunityPool,
      "/cosmos.gov.v1beta1.MsgDeposit": this.handleMsgDeposit,
      "/cosmos.staking.v1beta1.MsgBeginRedelegate": this.handleMsgBeginRedelegate,
      "/cosmos.staking.v1beta1.MsgDelegate": this.handleMsgDelegate,
      "/cosmos.staking.v1beta1.MsgUndelegate": this.handleMsgUndelegate,
      "/cosmos.bank.v1beta1.MsgMultiSend": this.handleMsgMultiSend
    };
  }

  private async handleMsgSend(decodedMessage: MsgSend, height: number, dbTransaction: DbTransaction, msg: Message) {
    await dbTransaction.insert(addressReference).values([
      {
        messageId: msg.id,
        transactionId: msg.txId,
        address: decodedMessage.fromAddress,
        type: "Sender"
      },
      {
        messageId: msg.id,
        transactionId: msg.txId,
        address: decodedMessage.toAddress,
        type: "Receiver"
      }
    ]);

    msg.amount = getAmountFromCoinArray(decodedMessage.amount, activeChain.udenom);
  }

  private async handleMsgMultiSend(decodedMessage: MsgMultiSend, height: number, dbTransaction: DbTransaction, msg: Message) {
    const senders = decodedMessage.inputs.map((input) => ({
      messageId: msg.id,
      transactionId: msg.txId,
      address: input.address,
      type: "Sender"
    }));
    const receivers = decodedMessage.outputs.map((output) => ({
      messageId: msg.id,
      transactionId: msg.txId,
      address: output.address,
      type: "Receiver"
    }));

    await dbTransaction.insert(addressReference).values([...senders, ...receivers]);
  }

  private async handleMsgFundCommunityPool(decodedMessage: MsgFundCommunityPool, height: number, dbTransaction: DbTransaction, msg: Message) {
    msg.amount = getAmountFromCoinArray(decodedMessage.amount, activeChain.udenom);
  }

  private async handleMsgDeposit(decodedMessage: MsgDeposit, height: number, dbTransaction: DbTransaction, msg: Message) {
    msg.amount = getAmountFromCoinArray(decodedMessage.amount, activeChain.udenom);
  }

  private async handleMsgBeginRedelegate(decodedMessage: MsgBeginRedelegate, height: number, dbTransaction: DbTransaction, msg: Message) {
    msg.amount = getAmountFromCoin(decodedMessage.amount, activeChain.udenom);
  }

  private async handleMsgDelegate(decodedMessage: MsgDelegate, height: number, dbTransaction: DbTransaction, msg: Message) {
    msg.amount = getAmountFromCoin(decodedMessage.amount, activeChain.udenom);
  }

  private async handleMsgUndelegate(decodedMessage: MsgUndelegate, height: number, dbTransaction: DbTransaction, msg: Message) {
    msg.amount = getAmountFromCoin(decodedMessage.amount, activeChain.udenom);
  }

  public async afterEveryTransaction(
    rawTx: DecodedTxRaw,
    currentTransaction: Transaction,
    dbTransaction: DbTransaction,
    txEvents: TransactionEventWithAttributes[]
  ): Promise<void> {
    const { multisigThreshold, addresses } = this.getTransactionSignerAddresses(rawTx, currentTransaction.hash);

    currentTransaction.multisigThreshold = multisigThreshold;

    await dbTransaction.insert(addressReference).values(
      addresses.map((address) => ({
        messageId: null,
        transactionId: currentTransaction.id,
        address: address,
        type: "Signer"
      }))
    );
  }

  private getTransactionSignerAddresses(tx: DecodedTxRaw, hash: string) {
    const signerInfos = tx.authInfo.signerInfos;

    if (signerInfos.length !== 1) {
      console.warn("More than one signer in tx: " + hash);
    }

    let multisigThreshold: number | null = null;
    let addresses: string[] = [];

    for (const signerInfo of signerInfos) {
      if (!signerInfo.publicKey) continue;

      try {
        const pubkey = decodePubkey(signerInfo.publicKey);
        if (pubkey.type === "tendermint/PubKeySecp256k1") {
          const pubKeyBuffer = Buffer.from(pubkey.value, "base64");

          addresses.push(toBech32(activeChain.bech32Prefix, rawSecp256k1PubkeyToRawAddress(pubKeyBuffer)));
        } else if (pubkey.type === "tendermint/PubKeyMultisigThreshold") {
          multisigThreshold = pubkey.value.threshold;
          addresses = addresses.concat(
            pubkey.value.pubkeys.map((p) => {
              const pubKeyBuffer = Buffer.from(p.value, "base64");
              return toBech32(activeChain.bech32Prefix, rawSecp256k1PubkeyToRawAddress(pubKeyBuffer));
            })
          );
        } else {
          throw "Unrecognized pubkey type: " + JSON.stringify(pubkey);
        }
      } catch (e) {
        // TEMPORARY FIX FOR TX 63CBF2B5C23E30B774F5072F625E3400603C95B993F0428E375F8078EAC95B17
        if (signerInfo.publicKey.typeUrl === "/cosmos.crypto.multisig.LegacyAminoPubKey") {
          console.log("FAILED TO DECODE MULTISIG PUBKEY: ", hash);
          return { multisigThreshold: null, addresses: [] };
        }

        throw e;
      }
    }

    return { multisigThreshold, addresses };
  }
}
