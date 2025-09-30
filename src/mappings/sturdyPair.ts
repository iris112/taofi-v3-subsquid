import { DataHandlerContext, BlockData, BlockHeader } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { EntityManager } from "../utils/entityManager";

import * as sturdypairAbi from "../abi/SturdyPair";
import {
  SturdyPair,
  User,
  Deposit,
  Withdraw,
  BorrowAsset,
  RepayAsset,
  RepayAssetWithCollateral,
  Collateral,
  Liquidate,
} from "../model";
import { BlockMap } from "../utils/blockMap";
import { EvmLog } from "@subsquid/evm-processor/src/interfaces/evm";

type EventData =
  | (DepositData & { type: "Deposit" })
  | (WithdrawData & { type: "Withdraw" })
  | (BorrowData & { type: "BorrowAsset" })
  | (RepayData & { type: "RepayAsset" })
  | (RepayWithCollateralData & { type: "RepayAssetWithCollateral" })
  | (CollateralData & { type: "Collateral" })
  | (LiquidateData & { type: "Liquidate" });

type ContextWithEntityManager = DataHandlerContext<Store> & {
  entities: EntityManager;
};

// ====================
// Main processing function
// ====================
export async function processSturdyPair(
  ctx: ContextWithEntityManager,
  blocks: BlockData[]
) {
  const eventsData = processItems(blocks);
  if (!eventsData || eventsData.size === 0) return;

  await prefetch(ctx, eventsData);

  let sturdyPair = await ctx.entities.get(SturdyPair, "1");
  if (!sturdyPair) {
    sturdyPair = createSturdyPair();
    ctx.entities.add(sturdyPair);
  }

  for (const [block, blockEvents] of eventsData) {
    for (const data of blockEvents) {
      switch (data.type) {
        case "Deposit":
          await processDeposit(ctx, sturdyPair, block, data);
          break;
        case "Withdraw":
          await processWithdraw(ctx, sturdyPair, block, data);
          break;
        case "BorrowAsset":
          await processBorrow(ctx, sturdyPair, block, data);
          break;
        case "RepayAsset":
          await processRepay(ctx, sturdyPair, block, data);
          break;
        case "RepayAssetWithCollateral":
          await processRepayWithCollateral(ctx, sturdyPair, block, data);
          break;
        case "Collateral":
          await processCollateral(ctx, sturdyPair, block, data);
          break;
        case "Liquidate":
          await processLiquidate(ctx, sturdyPair, block, data);
          break;
      }
    }
  }
}

// ====================
// Prefetch users
// ====================
async function prefetch(ctx: ContextWithEntityManager, eventsData: BlockMap<EventData>) {
  const userIds = new Set<string>();

  for (const [, blockEvents] of eventsData) {
    for (const data of blockEvents) {
      // Common fields
      if ("owner" in data && data.owner) userIds.add(data.owner.toLowerCase());
      if ("caller" in data && data.caller) userIds.add(data.caller.toLowerCase());
      if ("receiver" in data && data.receiver) userIds.add(data.receiver.toLowerCase());
      if ("payer" in data && data.payer) userIds.add(data.payer.toLowerCase());
      if ("borrower" in data && data.borrower) userIds.add(data.borrower.toLowerCase());
      if ("sender" in data && data.sender) userIds.add(data.sender.toLowerCase());
      
      // Event-specific fields
      if ("swapperAddress" in data && data.swapperAddress) userIds.add(data.swapperAddress.toLowerCase());
    }
  }

  // Defer all users for batch loading
  userIds.forEach((id) => ctx.entities.defer(User, id));
  await ctx.entities.load(User);
  await ctx.entities.load(SturdyPair);

  // Ensure all users exist
  for (const id of userIds) {
    if (!ctx.entities.get(User, id, false)) {
      const user = createUser(id);
      ctx.entities.add(user);
    }
  }
}

// ====================
// Event Processing Functions
// ====================
async function processDeposit(ctx: ContextWithEntityManager, sturdyPair: SturdyPair, block: any, data: DepositData) {
  const deposit = new Deposit({
    id: `${data.transaction.hash}-${data.logIndex}`,
    caller: data.caller,
    owner: data.owner,
    assets: data.assets,
    shares: data.shares,
    blockNumber: BigInt(block.height),
    timestamp: new Date(block.timestamp),
  });
  ctx.entities.add(deposit);

  sturdyPair.totalDeposits += BigInt(data.assets);
  sturdyPair.depositCount += 1n;
  sturdyPair.lastUpdateBlockNumber = BigInt(block.height);
  sturdyPair.lastUpdateTimestamp = new Date(block.timestamp);

  const user = await ctx.entities.getOrFail(User, data.owner);
  user.totalDeposits += BigInt(data.assets);
  user.depositCount += 1n;
  user.lastUpdateBlockNumber = BigInt(block.height);
  user.lastUpdateTimestamp = new Date(block.timestamp);
}

async function processWithdraw(ctx: ContextWithEntityManager, sturdyPair: SturdyPair, block: any, data: WithdrawData) {
  const withdraw = new Withdraw({
    id: `${data.transaction.hash}-${data.logIndex}`,
    caller: data.caller,
    owner: data.owner,
    receiver: data.receiver,
    assets: data.assets,
    shares: data.shares,
    blockNumber: BigInt(block.height),
    timestamp: new Date(block.timestamp),
  });
  ctx.entities.add(withdraw);

  sturdyPair.totalDeposits -= BigInt(data.assets);
  sturdyPair.withdrawCount += 1n;
  sturdyPair.lastUpdateBlockNumber = BigInt(block.height);
  sturdyPair.lastUpdateTimestamp = new Date(block.timestamp);

  const user = await ctx.entities.getOrFail(User, data.owner);
  user.totalDeposits -= BigInt(data.assets);
  user.withdrawCount += 1n;
  user.lastUpdateBlockNumber = BigInt(block.height);
  user.lastUpdateTimestamp = new Date(block.timestamp);
}

async function processBorrow(ctx: ContextWithEntityManager, sturdyPair: SturdyPair, block: any, data: BorrowData) {
  const borrow = new BorrowAsset({
    id: `${data.transaction.hash}-${data.logIndex}`,
    borrower: data.borrower,
    receiver: data.receiver,
    borrowAmount: data.borrowAmount,
    sharesAdded: data.sharesAdded,
    blockNumber: BigInt(block.height),
    timestamp: new Date(block.timestamp),
  });
  ctx.entities.add(borrow);

  sturdyPair.totalBorrows += BigInt(data.borrowAmount);
  sturdyPair.borrowCount += 1n;
  sturdyPair.lastUpdateBlockNumber = BigInt(block.height);
  sturdyPair.lastUpdateTimestamp = new Date(block.timestamp);

  const user = await ctx.entities.getOrFail(User, data.borrower);
  user.totalBorrows += BigInt(data.borrowAmount);
  user.borrowCount += 1n;
  user.lastUpdateBlockNumber = BigInt(block.height);
  user.lastUpdateTimestamp = new Date(block.timestamp);
}

async function processRepay(ctx: ContextWithEntityManager, sturdyPair: SturdyPair, block: BlockHeader, data: RepayData) {
  const repay = new RepayAsset({
    id: `${data.transaction.hash}-${data.logIndex}`,
    payer: data.payer,
    borrower: data.borrower,
    amountToRepay: data.amount,
    shares: data.shares,
    blockNumber: BigInt(block.height),
    timestamp: new Date(block.timestamp),
  });
  ctx.entities.add(repay);

  sturdyPair.totalBorrows -= BigInt(data.amount);
  sturdyPair.repayCount += 1n;
  sturdyPair.lastUpdateBlockNumber = BigInt(block.height);
  sturdyPair.lastUpdateTimestamp = new Date(block.timestamp);

  const user = await ctx.entities.getOrFail(User, data.borrower);
  user.totalBorrows -= BigInt(data.amount);
  user.repayCount += 1n;
  user.lastUpdateBlockNumber = BigInt(block.height);
  user.lastUpdateTimestamp = new Date(block.timestamp);
}

async function processRepayWithCollateral(ctx: ContextWithEntityManager, sturdyPair: SturdyPair, block: any, data: RepayWithCollateralData) {
  const repay = new RepayAssetWithCollateral({
    id: `${data.transaction.hash}-${data.logIndex}`,
    borrower: data.borrower,
    swapperAddress: data.swapperAddress,
    collateralToSwap: data.collateralToSwap,
    amountAssetOut: data.amountAssetOut,
    sharesRepaid: data.sharesRepaid,
    blockNumber: BigInt(block.height),
    timestamp: new Date(block.timestamp),
  });
  ctx.entities.add(repay);

  sturdyPair.totalBorrows -= BigInt(data.amountAssetOut);
  sturdyPair.repayCount += 1n;
  sturdyPair.lastUpdateBlockNumber = BigInt(block.height);
  sturdyPair.lastUpdateTimestamp = new Date(block.timestamp);

  const user = await ctx.entities.getOrFail(User, data.borrower);
  user.totalBorrows -= BigInt(data.amountAssetOut);
  user.repayCount += 1n;
  user.lastUpdateBlockNumber = BigInt(block.height);
  user.lastUpdateTimestamp = new Date(block.timestamp);
}

async function processCollateral(ctx: ContextWithEntityManager, sturdyPair: SturdyPair, block: any, data: CollateralData) {
  const collateral = new Collateral({
    id: `${data.transaction.hash}-${data.logIndex}`,
    sender: data.sender,
    borrower: data.borrower,
    amount: data.amount,
    action: data.action,
    blockNumber: BigInt(block.height),
    timestamp: new Date(block.timestamp),
  });
  ctx.entities.add(collateral);

  const delta = data.action === "ADD" ? BigInt(data.amount) : -BigInt(data.amount);
  sturdyPair.totalCollateral += delta;
  sturdyPair.collateralCount += 1n;
  sturdyPair.lastUpdateBlockNumber = BigInt(block.height);
  sturdyPair.lastUpdateTimestamp = new Date(block.timestamp);

  const user = await ctx.entities.getOrFail(User, data.borrower);
  user.totalCollateral += delta;
  user.collateralCount += 1n;
  user.lastUpdateBlockNumber = BigInt(block.height);
  user.lastUpdateTimestamp = new Date(block.timestamp);
}

async function processLiquidate(ctx: ContextWithEntityManager, sturdyPair: SturdyPair, block: any, data: LiquidateData) {
  const liquidate = new Liquidate({
    id: `${data.transaction.hash}-${data.logIndex}`,
    borrower: data.borrower,
    collateralForLiquidator: data.collateralForLiquidator,
    sharesToLiquidate: data.sharesToLiquidate,
    amountLiquidatorToRepay: data.amountLiquidatorToRepay,
    feesAmount: data.feesAmount,
    sharesToAdjust: data.sharesToAdjust,
    amountToAdjust: data.amountToAdjust,
    blockNumber: BigInt(block.height),
    timestamp: new Date(block.timestamp),
  });
  ctx.entities.add(liquidate);

  sturdyPair.totalLiquidations += BigInt(data.amountLiquidatorToRepay);
  sturdyPair.liquidationCount += 1n;
  sturdyPair.lastUpdateBlockNumber = BigInt(block.height);
  sturdyPair.lastUpdateTimestamp = new Date(block.timestamp);
}

// ====================
// Helpers
// ====================
function createSturdyPair(): SturdyPair {
  return new SturdyPair({
    id: "1",
    totalDeposits: 0n,
    totalBorrows: 0n,
    totalCollateral: 0n,
    totalLiquidations: 0n,
    depositCount: 0n,
    withdrawCount: 0n,
    borrowCount: 0n,
    repayCount: 0n,
    collateralCount: 0n,
    liquidationCount: 0n,
    lastUpdateBlockNumber: 0n,
    lastUpdateTimestamp: new Date(0),
  });
}

function createUser(id: string): User {
  return new User({
    id: id.toLowerCase(),
    totalDeposits: 0n,
    totalBorrows: 0n,
    totalCollateral: 0n,
    depositCount: 0n,
    withdrawCount: 0n,
    borrowCount: 0n,
    repayCount: 0n,
    collateralCount: 0n,
    lastUpdateBlockNumber: 0n,
    lastUpdateTimestamp: new Date(0),
  });
}

// ====================
// Event Processing
// ====================
function processItems(blocks: BlockData[]): BlockMap<EventData> {
  const eventsData = new BlockMap<EventData>();

  for (const block of blocks) {
    for (const log of block.logs) {
      const evmLog: EvmLog = {
        logIndex: log.logIndex,
        transactionIndex: log.transactionIndex,
        transactionHash: log.transaction?.hash || "",
        address: log.address,
        data: log.data,
        topics: log.topics,
      };

      switch (log.topics[0]) {
        case sturdypairAbi.events.Deposit.topic:
          eventsData.push(block.header, { type: "Deposit", ...processDepositEvent(evmLog, log.transaction) });
          break;
        case sturdypairAbi.events.Withdraw.topic:
          eventsData.push(block.header, { type: "Withdraw", ...processWithdrawEvent(evmLog, log.transaction) });
          break;
        case sturdypairAbi.events.BorrowAsset.topic:
          eventsData.push(block.header, { type: "BorrowAsset", ...processBorrowEvent(evmLog, log.transaction) });
          break;
        case sturdypairAbi.events.RepayAsset.topic:
          eventsData.push(block.header, { type: "RepayAsset", ...processRepayEvent(evmLog, log.transaction) });
          break;
        case sturdypairAbi.events.RepayAssetWithCollateral.topic:
          eventsData.push(block.header, { type: "RepayAssetWithCollateral", ...processRepayWithCollateralEvent(evmLog, log.transaction) });
          break;
        case sturdypairAbi.events.AddCollateral.topic:
          eventsData.push(block.header, { type: "Collateral", ...processAddCollateralEvent(evmLog, log.transaction) });
          break;
        case sturdypairAbi.events.RemoveCollateral.topic:
          eventsData.push(block.header, { type: "Collateral", ...processRemoveCollateralEvent(evmLog, log.transaction) });
          break;
        case sturdypairAbi.events.Liquidate.topic:
          eventsData.push(block.header, { type: "Liquidate", ...processLiquidateEvent(evmLog, log.transaction) });
          break;
      }
    }
  }

  return eventsData;
}

// ====================
// Event Decoding
// ====================
function processDepositEvent(log: EvmLog, transaction: any): DepositData {
  const event = sturdypairAbi.events.Deposit.decode(log);
  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    caller: event.caller.toLowerCase(),
    owner: event.owner.toLowerCase(),
    assets: BigInt(event.assets),
    shares: BigInt(event.shares),
    logIndex: log.logIndex,
  };
}

function processWithdrawEvent(log: EvmLog, transaction: any): WithdrawData {
  const event = sturdypairAbi.events.Withdraw.decode(log);
  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    caller: event.caller.toLowerCase(),
    owner: event.owner.toLowerCase(),
    receiver: event.receiver.toLowerCase(),
    assets: BigInt(event.assets),
    shares: BigInt(event.shares),
    logIndex: log.logIndex,
  };
}

function processBorrowEvent(log: EvmLog, transaction: any): BorrowData {
  const event = sturdypairAbi.events.BorrowAsset.decode(log);
  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    borrower: event._borrower.toLowerCase(),
    receiver: event._receiver.toLowerCase(),
    borrowAmount: BigInt(event._borrowAmount),
    sharesAdded: BigInt(event._sharesAdded),
    logIndex: log.logIndex,
  };
}

function processRepayEvent(log: EvmLog, transaction: any): RepayData {
  const event = sturdypairAbi.events.RepayAsset.decode(log);
  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    payer: event.payer.toLowerCase(),
    borrower: event.borrower.toLowerCase(),
    amount: BigInt(event.amountToRepay),
    shares: BigInt(event.shares),
    logIndex: log.logIndex,
  };
}

function processRepayWithCollateralEvent(log: EvmLog, transaction: any): RepayWithCollateralData {
  const event = sturdypairAbi.events.RepayAssetWithCollateral.decode(log);
  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    borrower: event._borrower.toLowerCase(),
    swapperAddress: event._swapperAddress.toLowerCase(),
    collateralToSwap: BigInt(event._collateralToSwap),
    amountAssetOut: BigInt(event._amountAssetOut),
    sharesRepaid: BigInt(event._sharesRepaid),
    logIndex: log.logIndex,
  };
}

function processAddCollateralEvent(log: EvmLog, transaction: any): CollateralData {
  const event = sturdypairAbi.events.AddCollateral.decode(log);
  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    sender: event.sender.toLowerCase(),
    borrower: event.borrower.toLowerCase(),
    amount: BigInt(event.collateralAmount),
    action: "ADD",
    logIndex: log.logIndex,
  };
}

function processRemoveCollateralEvent(log: EvmLog, transaction: any): CollateralData {
  const event = sturdypairAbi.events.RemoveCollateral.decode(log);
  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    sender: event._sender.toLowerCase(),
    borrower: event._borrower.toLowerCase(),
    amount: BigInt(event._collateralAmount),
    action: "REMOVE",
    logIndex: log.logIndex,
  };
}

function processLiquidateEvent(log: EvmLog, transaction: any): LiquidateData {
  const event = sturdypairAbi.events.Liquidate.decode(log);
  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    borrower: event._borrower.toLowerCase(),
    collateralForLiquidator: BigInt(event._collateralForLiquidator),
    sharesToLiquidate: BigInt(event._sharesToLiquidate),
    amountLiquidatorToRepay: BigInt(event._amountLiquidatorToRepay),
    feesAmount: BigInt(event._feesAmount),
    sharesToAdjust: BigInt(event._sharesToAdjust),
    amountToAdjust: BigInt(event._amountToAdjust),
    logIndex: log.logIndex,
  };
}

// ====================
// Event Data Interfaces
// ====================
interface DepositData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  caller: string;
  owner: string;
  assets: bigint;
  shares: bigint;
  logIndex?: number;
}

interface WithdrawData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  caller: string;
  owner: string;
  receiver: string;
  assets: bigint;
  shares: bigint;
  logIndex?: number;
}

interface BorrowData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  borrower: string;
  receiver: string;
  borrowAmount: bigint;
  sharesAdded: bigint;
  logIndex?: number;
}

interface RepayData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  payer: string;
  borrower: string;
  amount: bigint;
  shares: bigint;
  logIndex?: number;
}

interface RepayWithCollateralData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  borrower: string;
  swapperAddress: string;
  collateralToSwap: bigint;
  amountAssetOut: bigint;
  sharesRepaid: bigint;
  logIndex?: number;
}

interface CollateralData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  sender: string;
  borrower: string;
  amount: bigint;
  action: "ADD" | "REMOVE";
  logIndex?: number;
}

interface LiquidateData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  borrower: string;
  collateralForLiquidator: bigint;
  sharesToLiquidate: bigint;
  amountLiquidatorToRepay: bigint;
  feesAmount: bigint;
  sharesToAdjust: bigint;
  amountToAdjust: bigint;
  logIndex?: number;
}
