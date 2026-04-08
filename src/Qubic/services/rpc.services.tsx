import type {
    ArchiverStatus,
    Balance,
    EpochTicks,
    IQuerySC,
    IQuerySCResponse,
    LatestStats,
    RichList,
    TickEvents,
    TickInfo,
    TransactionInfo,
    TxHistory,
    TxStatus,
    AssetsOwnership,
    AggregatedAssetBalance,
    TransferRequirement,
  } from "@/Qubic/types/rpc.types";
  import { uint8ArrayToBase64 } from "@/Qubic/utils/utils";
  import axios from "axios";
  
  const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.qubic.org";
  const EVENT_URL = process.env.NEXT_PUBLIC_EVENT_URL || "https://dev01.qubic.org";
  
  const rpc = axios.create({
    baseURL: RPC_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout
  });
  
  const qevent = axios.create({
    baseURL: EVENT_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  export const fetchTickInfo = async (): Promise<TickInfo> => {
    try {
      const tickResult = await rpc.get("/v1/tick-info");
      const tick = await tickResult.data;
      if (!tick || !tick.tickInfo) {
        console.warn("getTickInfo: Invalid tick");
        return {} as TickInfo;
      }
      return tick.tickInfo;
    } catch (error) {
      console.error("fetchTickInfo: Network error", error);
      throw error;
    }
  };
  
  export const fetchBalance = async (publicId: string): Promise<Balance> => {
    const balanceResult = await rpc.get(`/v1/balances/${publicId}`);
    const balance = await balanceResult.data;
    if (!balance || balance.balance == null) {
      console.warn("getBalance: Invalid balance");
      return {} as Balance;
    }
    return balance.balance;
  };
  
  interface OwnedAssets {
    data: {
      ownerIdentity: string;
      type: number;
      padding: number;
      managingContractIndex: number;
      issuanceIndex: number;
      numberOfUnits: string;
      issuedAsset: {
        issuerIdentity: string;
        type: number;
        name: string;
        numberOfDecimalPlaces: number;
        unitOfMeasurement: number[];
      };
    };
    info: {
      tick: number;
      universeIndex: number;
    };
  }
  
  export const fetchAssetsBalance = async (
    publicId: string,
    assetName: string,
    contractIdex = 1,
    issuer?: string
  ): Promise<number> => {
    const assetsBalanceResult = await rpc.get(`/v1/assets/${publicId}/owned`);
    const assetsBalance = await assetsBalanceResult.data;
    if (!assetsBalance || !assetsBalance.ownedAssets) {
      console.warn("fetchAssetsBalance: Invalid assets balance");
      return 0;
    }
    const assetBalance = assetsBalance.ownedAssets.find(
      (asset: OwnedAssets) =>
        asset.data.issuedAsset.name === assetName &&
        asset.data.managingContractIndex === contractIdex &&
        (issuer === undefined || asset.data.issuedAsset.issuerIdentity === issuer),
    );
    if (!assetBalance) {
      return 0;
    }
    return Number(assetBalance.data.numberOfUnits);
  };
  
  
  // all assets ownership contract address, assets name, and amount
  export const fetchAssetsOwnership = async (publicId: string): Promise<AssetsOwnership[]> => {
    const assetsBalanceResult = await rpc.get(`/v1/assets/${publicId}/owned`);
    const assetsBalance = await assetsBalanceResult.data;
    if (!assetsBalance || !assetsBalance.ownedAssets) {
      console.warn("fetchAssetsBalance: Invalid assets balance");
      return [];
    }
    return assetsBalance.ownedAssets.map((asset: OwnedAssets) => ({
      ownerIdentity: asset.data.ownerIdentity,
      managingContractIndex: asset.data.managingContractIndex,
      amount: Number(asset.data.numberOfUnits),
      assetName: asset.data.issuedAsset.name,
      issuer: asset.data.issuedAsset.issuerIdentity,
    }));
  };
  
  const QX_CONTRACT_INDEX = 1; // Default token issuer contract
  const QSWAP_CONTRACT_INDEX = 13; // QSwap contract
  
  /**
   * Fetches aggregated asset balances combining QX (1) and QSwap (13) managing contracts
   * For QSwap UI purposes, we need to show total balance available (QX + QSwap)
   */
  export const fetchAggregatedAssetsBalance = async (publicId: string): Promise<AggregatedAssetBalance[]> => {
    const allAssets = await fetchAssetsOwnership(publicId);
    
    // Group by issuer+assetName (different issuers can have same asset name - they are distinct tokens)
    const assetMap = new Map<string, AggregatedAssetBalance>();
    
    for (const asset of allAssets) {
      const key = `${asset.issuer}:${asset.assetName}`;
      
      if (!assetMap.has(key)) {
        assetMap.set(key, {
          assetName: asset.assetName,
          issuer: asset.issuer,
          totalBalance: 0,
          qxBalance: 0,
          qswapBalance: 0,
          otherBalances: [],
        });
      }
      
      const aggregated = assetMap.get(key)!;
      aggregated.totalBalance += asset.amount;
      
      if (asset.managingContractIndex === QX_CONTRACT_INDEX) {
        aggregated.qxBalance += asset.amount;
      } else if (asset.managingContractIndex === QSWAP_CONTRACT_INDEX) {
        aggregated.qswapBalance += asset.amount;
      } else {
        aggregated.otherBalances.push({
          managingContractIndex: asset.managingContractIndex,
          amount: asset.amount,
        });
      }
    }
    
    return Array.from(assetMap.values());
  };
  
  /**
   * Calculate how much needs to be transferred from QX to QSwap management
   * Returns the amount that needs to be transferred (0 if no transfer needed)
   */
  export const calculateRequiredTransfer = (
    assetName: string,
    aggregatedBalances: AggregatedAssetBalance[],
    requiredAmount: number,
    issuer?: string
  ): TransferRequirement => {
    const asset = aggregatedBalances.find(
      a => a.assetName === assetName && (issuer === undefined || a.issuer === issuer)
    );
    
    if (!asset) {
      return { needsTransfer: false, transferAmount: 0, qxBalance: 0, qswapBalance: 0 };
    }
    
    // Check if we have enough under QSwap management
    if (asset.qswapBalance >= requiredAmount) {
      return { 
        needsTransfer: false, 
        transferAmount: 0, 
        qxBalance: asset.qxBalance, 
        qswapBalance: asset.qswapBalance 
      };
    }
    
    // Calculate how much more we need
    const shortfall = requiredAmount - asset.qswapBalance;
    
    // Check if we have enough in QX to cover the shortfall
    if (asset.qxBalance >= shortfall) {
      return { 
        needsTransfer: true, 
        transferAmount: shortfall, 
        qxBalance: asset.qxBalance, 
        qswapBalance: asset.qswapBalance 
      };
    }
    
    // Not enough total balance
    return { 
      needsTransfer: true, 
      transferAmount: asset.qxBalance, // Transfer all we have from QX
      qxBalance: asset.qxBalance, 
      qswapBalance: asset.qswapBalance 
    };
  };
  
  export const broadcastTx = async (tx: Uint8Array) => {
    const url = `${RPC_URL}/v1/broadcast-transaction`;
    const txEncoded = uint8ArrayToBase64(tx);
    const body = { encodedTransaction: txEncoded };
    const result = await rpc.post(url, body);
    console.log("result", result.data);
    return result.data;
  };
  
  export const fetchQuerySC = async (query: IQuerySC): Promise<IQuerySCResponse> => {
    const queryResult = await rpc.post(`${RPC_URL}/v1/querySmartContract`, query);
    return queryResult.data;
  };
  
  export const fetchTxStatus = async (txId: string): Promise<TxStatus> => {
    const txStatusResult = await rpc.get(`${RPC_URL}/v1/tx-status/${txId}`);
    let txStatus = {} as { transactionStatus: TxStatus };
    if (txStatusResult.status == 200) {
      txStatus = await txStatusResult.data;
    }
    return txStatus.transactionStatus;
  };
  
  export const fetchLatestStats = async (): Promise<LatestStats> => {
    const latestStatsResult = await rpc.get(`${RPC_URL}/v1/latest-stats`);
    if (latestStatsResult.status !== 200) {
      console.warn("fetchLatestStats: Failed to fetch latest stats");
      return {} as LatestStats;
    }
    const latestStats = await latestStatsResult.data;
    if (!latestStats || !latestStats.data) {
      console.warn("fetchLatestStats: Invalid response data");
      return {} as LatestStats;
    }
    return latestStats.data;
  };
  
  export const fetchArchiverStatus = async (): Promise<ArchiverStatus> => {
    try {
      const archiverStatusResult = await rpc.get(`${RPC_URL}/v1/status`);
      if (archiverStatusResult.status !== 200) {
        console.warn("fetchArchiverStatus: Failed to fetch archiver status");
        return {} as ArchiverStatus;
      }
      return archiverStatusResult.data;
    } catch (error) {
      console.error("fetchArchiverStatus: Network error", error);
      throw error;
    }
  };
  
  export const fetchRichList = async (page: number, pageSize: number): Promise<RichList> => {
    const richListResult = await rpc.get(
      `${RPC_URL}/v1/rich-list?page=${page}&pageSize=${pageSize}`,
    );
    const richList = await richListResult.data;
    return richList;
  };
  
  export const fetchTxHistory = async (publicId: string, startTick: number, endTick: number): Promise<TxHistory> => {
    const txHistoryResult = await rpc.get(
      `${RPC_URL}/v2/identities/${publicId}/transfers?startTick=${startTick}&endTick=${endTick}`,
    );
    const txHistory = await txHistoryResult.data;
    return txHistory.data;
  };
  
  export const fetchEpochTicks = async (epoch: number, page: number, pageSize: number): Promise<EpochTicks> => {
    const epochTicksResult = await rpc.get(
      `${RPC_URL}/v2/epochs/${epoch}/ticks?page=${page}&pageSize=${pageSize}`,
    );
    const epochTicks = await epochTicksResult.data;
    return epochTicks.data;
  };
  
  export const fetchApprovedTx = async (tick: number): Promise<TransactionInfo[]> => {
    const approvedTxResult = await rpc.get(`${RPC_URL}/v1/ticks/${tick}/approved-transactions`);
    const approvedTx = await approvedTxResult.data;
    return approvedTx.approvedTransactions;
  };
  
  export const fetchTransactionInfo = async (txHash: string): Promise<TransactionInfo> => {
    const transactionInfoResult = await rpc.get(`${RPC_URL}/v2/transactions/${txHash}`);
    const transactionInfo = await transactionInfoResult.data;
    return transactionInfo.transaction;
  };
  
  export const fetchTickEvents = async (tick: number): Promise<TickEvents> => {
    const tickEventsResult = await qevent.post(`/v1/events/getTickEvents`, { tick });
    return tickEventsResult.data;
  };