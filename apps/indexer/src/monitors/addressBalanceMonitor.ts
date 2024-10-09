import { activeChain } from "@src/shared/constants";
import axios from "axios";
import { MonitoredValue, db, eq, monitoredValue as monitoredValueTable } from "database";

export class AddressBalanceMonitor {
  async run() {
    const monitoredValues = await db.query.monitoredValue.findMany({
      where: eq(monitoredValueTable.tracker, "AddressBalanceMonitor")
    });

    await Promise.allSettled(monitoredValues.map((x) => this.updateValue(x)));

    console.log("Refreshed balances for " + monitoredValues.length + " addresses.");
  }

  async updateValue(monitoredValue: MonitoredValue) {
    const balance = await this.getBalance(monitoredValue.target);

    if (balance === null) {
      throw new Error("Unable to get balance for " + monitoredValue.target);
    }

    await db
      .update(monitoredValueTable)
      .set({
        value: balance.toString(),
        lastUpdateDate: new Date()
      })
      .where(eq(monitoredValueTable.id, monitoredValue.id));
  }

  async getBalance(address: string): Promise<number | null> {
    const response = await axios.get(`https://rest.cosmos.directory/${activeChain.cosmosDirectoryId}/cosmos/bank/v1beta1/balances/${address}`, {
      timeout: 15_000
    });

    const balance = response.data.balances.find((x) => x.denom === activeChain.denom || x.denom === activeChain.udenom);

    if (!balance) {
      return null;
    }

    return balance.denom === activeChain.udenom ? parseInt(balance.amount) : parseInt(balance.amount) * 1_000_000;
  }
}
