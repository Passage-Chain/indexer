import { Coin, DecCoin } from "cosmjs-types/cosmos/base/v1beta1/coin";

export function getAmountFromCoinArray(coins: DecCoin[] | Coin[], denom: string): string {
  const coin = coins.find((coin) => coin.denom === denom);
  return coin?.amount ?? "0";
}

export function getAmountFromCoin(coin: Coin, denom?: string): string {
  if (denom && coin.denom !== denom) {
    return "0";
  }

  return coin.amount;
}
