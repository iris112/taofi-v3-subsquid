import { BigDecimal } from "@subsquid/big-decimal";

import {
  BlockHandlerContext,
  LogItem,
  TransactionItem,
  BlockHeader,
} from "../utils/interfaces/interfaces";

import { Multicall } from "../abi/multicall";
import { Position, PositionSnapshot, Token, Tx, Tick, DecreaseLiquidity, Bundle } from "../model";
import { BlockMap } from "../utils/blockMap";
import {
  ADDRESS_ZERO,
  FACTORY_ADDRESS,
  MULTICALL_ADDRESS,
  POSITIONS_ADDRESS,
  MULTICALL_PAGE_SIZE,
} from "../utils/constants";
import { createTick } from "../utils/tick";
import { EntityManager } from "../utils/entityManager";
import { last } from "../utils/tools";
import * as factoryAbi from "./../abi/factory";
import * as positionsAbi from "./../abi/NonfungiblePositionManager";
import { BlockData, DataHandlerContext } from "@subsquid/evm-processor";
import { EvmLog } from "@subsquid/evm-processor/src/interfaces/evm";
import { Store } from "@subsquid/typeorm-store";

type EventData =
  | (TransferData & { type: "Transfer" })
  | (IncreaseData & { type: "Increase" })
  | (DecreaseData & { type: "Decrease" })
  | (CollectData & { type: "Collect" });

type ContextWithEntityManager = DataHandlerContext<Store> & {
  entities: EntityManager;
};

export async function processPositions(
  ctx: ContextWithEntityManager,
  blocks: BlockData[]
): Promise<void> {
  const eventsData = processItems(blocks);
  if (!eventsData || eventsData.size == 0) return;

  await prefetch(ctx, eventsData, last(blocks).header);
  for (const [block, blockEventsData] of eventsData) {
    for (const data of blockEventsData) {
      switch (data.type) {
        case "Increase":
          await processIncreaseData(ctx, block, data);
          break;
        case "Decrease":
          await processDecreaseData(ctx, block, data);
          break;
        case "Collect":
          await processCollectData(ctx, block, data);
          break;
        case "Transfer":
          await processTransferData(ctx, block, data);
          break;
      }
    }
  }
}

async function prefetch(
  ctx: ContextWithEntityManager,
  eventsData: BlockMap<EventData>,
  block: BlockHeader
) {
  const positionIds = new Set<string>();
  for (const [, blockEventsData] of eventsData) {
    for (const data of blockEventsData) {
      ctx.entities.defer(Position, data.tokenId);
      positionIds.add(data.tokenId);
    }
  }

  await ctx.entities.load(Position);

  const newPositionIds: string[] = [];
  for (const id of positionIds) {
    if (!ctx.entities.get(Position, id, false)) newPositionIds.push(id);
  }

  const newPositions = await initPositions({ ...ctx, block, entities: ctx.entities } as any, newPositionIds);
  for (const position of newPositions) {
    ctx.entities.add(position);
  }

  for (const position of ctx.entities.values(Position)) {
    ctx.entities.defer(Token, position.token0Id, position.token1Id);
    // Defer loading tick entities if they exist
    if (position.tickLower) {
      ctx.entities.defer(Tick, position.tickLower.id);
    }
    if (position.tickUpper) {
      ctx.entities.defer(Tick, position.tickUpper.id);
    }
  }

  await ctx.entities.load(Token);
  await ctx.entities.load(Tick);
}

function processItems(blocks: BlockData[]) {
  let eventsData = new BlockMap<EventData>();

  for (let block of blocks) {
    for (let log of block.logs) {
      let evmLog = {
        logIndex: log.logIndex,
        transactionIndex: log.transactionIndex,
        transactionHash: log.transaction?.hash || "",
        address: log.address,
        data: log.data,
        topics: log.topics,
      };
      switch (log.topics[0]) {
        case positionsAbi.events.IncreaseLiquidity.topic: {
          const data = processInreaseLiquidity(evmLog, log.transaction);
          eventsData.push(block.header, {
            type: "Increase",
            ...data,
          });
          break;
        }
        case positionsAbi.events.DecreaseLiquidity.topic: {
          const data = processDecreaseLiquidity(evmLog, log.transaction);
          eventsData.push(block.header, {
            type: "Decrease",
            ...data,
          });
          break;
        }
        case positionsAbi.events.Collect.topic: {
          const data = processCollect(evmLog, log.transaction);
          eventsData.push(block.header, {
            type: "Collect",
            ...data,
          });
          break;
        }
        case positionsAbi.events.Transfer.topic: {
          const data = processTransafer(evmLog, log.transaction);
          eventsData.push(block.header, {
            type: "Transfer",
            ...data,
          });
          break;
        }
      }
    }
  }

  return eventsData;
}

async function processIncreaseData(
  ctx: ContextWithEntityManager,
  block: BlockHeader,
  data: IncreaseData
) {
  let position = ctx.entities.get(Position, data.tokenId, false);
  if (position == null) return;

  let token0 = await ctx.entities.get(Token, position.token0Id);
  let token1 = await ctx.entities.get(Token, position.token1Id);

  if (!token0 || !token1) return;

  let amount0 = BigDecimal(data.amount0, token0.decimals).toNumber();
  let amount1 = BigDecimal(data.amount1, token1.decimals).toNumber();

  position.liquidity = position.liquidity + data.liquidity;
  position.depositedToken0 = position.depositedToken0 + amount0;
  position.depositedToken1 = position.depositedToken1 + amount1;
  position.lastUpdateBlockNumber = block.height;
  position.lastUpdateTimestamp = new Date(block.timestamp);

  let transaction = ctx.entities.get(Tx, data.transaction.hash, false);
  if (!transaction) {
    transaction = new Tx({
      id: data.transaction.hash,
      blockNumber: block.height,
      timestamp: new Date(block.timestamp),
      gasUsed: data.transaction.gas,
      gasPrice: data.transaction.gasPrice,
    });
    ctx.entities.add(transaction);
  }

  updatePositionSnapshot(ctx, block, position.id, data.transaction);
}

async function processDecreaseData(
  ctx: ContextWithEntityManager,
  block: BlockHeader,
  data: DecreaseData
) {
  // temp fix
  if (block.height == 14317993) return;

  let position = ctx.entities.get(Position, data.tokenId, false);
  if (position == null) return;

  let token0 = await ctx.entities.get(Token, position.token0Id);
  let token1 = await ctx.entities.get(Token, position.token1Id);

  if (!token0 || !token1) return;

  let amount0 = BigDecimal(data.amount0, token0.decimals).toNumber();
  let amount1 = BigDecimal(data.amount1, token1.decimals).toNumber();

  position.liquidity = position.liquidity - data.liquidity;
  position.withdrawnToken0 = position.withdrawnToken0 + amount0;
  position.withdrawnToken1 = position.withdrawnToken1 + amount1;
  position.lastUpdateBlockNumber = block.height;
  position.lastUpdateTimestamp = new Date(block.timestamp);

  let transaction = ctx.entities.get(Tx, data.transaction.hash, false);
  if (!transaction) {
    transaction = new Tx({
      id: data.transaction.hash,
      blockNumber: block.height,
      timestamp: new Date(block.timestamp),
      gasUsed: data.transaction.gas,
      gasPrice: data.transaction.gasPrice,
    });
    ctx.entities.add(transaction);
  }

  // Create DecreaseLiquidity entity
  const decreaseLiquidityId = `${data.transaction.hash}#${data.logIndex || 0}`;
  const decreaseLiquidity = new DecreaseLiquidity({
    id: decreaseLiquidityId,
    transactionId: transaction.id,
    timestamp: new Date(block.timestamp),
    tokenId: data.tokenId,
    positionId: position.id,
    liquidity: data.liquidity,
    amount0: amount0,
    amount1: amount1,
    logIndex: data.logIndex,
  });

  // Calculate USD value if possible
  const bundle = ctx.entities.get(Bundle, "1", false);
  if (bundle) {
    const token0USD = token0.derivedETH ? token0.derivedETH * bundle.ethPriceUSD : 0;
    const token1USD = token1.derivedETH ? token1.derivedETH * bundle.ethPriceUSD : 0;
    decreaseLiquidity.amountUSD = amount0 * token0USD + amount1 * token1USD;
  }

  ctx.entities.add(decreaseLiquidity);

  updatePositionSnapshot(ctx, block, position.id, data.transaction);
}

async function processCollectData(
  ctx: ContextWithEntityManager,
  block: BlockHeader,
  data: CollectData
) {
  let position = ctx.entities.get(Position, data.tokenId, false);
  // position was not able to be fetched
  if (position == null) return;
  let token0 = ctx.entities.get(Token, position.token0Id, false);
  if (token0 == null) return;
  let amount0 = BigDecimal(data.amount0, token0.decimals).toNumber();
  let token1 = ctx.entities.get(Token, position.token1Id, false);
  if (token1 == null) return;
  let amount1 = BigDecimal(data.amount1, token1.decimals).toNumber();

  position.collectedFeesToken0 = position.collectedFeesToken0 + amount0;
  position.collectedFeesToken1 = position.collectedFeesToken1 + amount1;
  position.lastUpdateBlockNumber = block.height;
  position.lastUpdateTimestamp = new Date(block.timestamp);

  let transaction = ctx.entities.get(Tx, data.transaction.hash, false);
  if (!transaction) {
    transaction = new Tx({
      id: data.transaction.hash,
      blockNumber: block.height,
      timestamp: new Date(block.timestamp),
      gasUsed: data.transaction.gas,
      gasPrice: data.transaction.gasPrice,
    });
    ctx.entities.add(transaction);
  }

  updatePositionSnapshot(ctx, block, position.id, data.transaction);
}

async function processTransferData(
  ctx: ContextWithEntityManager,
  block: BlockHeader,
  data: TransferData
) {
  let position = ctx.entities.get(Position, data.tokenId, false);

  // position was not able to be fetched
  if (position == null) return;

  position.owner = data.to;
  position.lastUpdateBlockNumber = block.height;
  position.lastUpdateTimestamp = new Date(block.timestamp);

  let transaction = ctx.entities.get(Tx, data.transaction.hash, false);
  if (!transaction) {
    transaction = new Tx({
      id: data.transaction.hash,
      blockNumber: block.height,
      timestamp: new Date(block.timestamp),
      gasUsed: data.transaction.gas,
      gasPrice: data.transaction.gasPrice,
    });
    ctx.entities.add(transaction);
  }
  
  updatePositionSnapshot(ctx, block, position.id, data.transaction);
}

async function updatePositionSnapshot(
  ctx: ContextWithEntityManager,
  block: BlockHeader,
  positionId: string,
  transcation: any
) {
  const position = ctx.entities.getOrFail(Position, positionId, false);

  const positionBlockId = snapshotId(positionId, block.height);

  let positionSnapshot = ctx.entities.get(
    PositionSnapshot,
    positionBlockId,
    false
  );
  if (!positionSnapshot) {
    positionSnapshot = new PositionSnapshot({ id: positionBlockId });
    ctx.entities.add(positionSnapshot);
  }
  positionSnapshot.owner = position.owner;
  positionSnapshot.poolId = position.poolId;
  positionSnapshot.positionId = positionId;
  positionSnapshot.transactionId = transcation.hash;
  positionSnapshot.blockNumber = block.height;
  positionSnapshot.timestamp = new Date(block.timestamp);
  positionSnapshot.liquidity = position.liquidity;
  positionSnapshot.depositedToken0 = position.depositedToken0;
  positionSnapshot.depositedToken1 = position.depositedToken1;
  positionSnapshot.withdrawnToken0 = position.withdrawnToken0;
  positionSnapshot.withdrawnToken1 = position.withdrawnToken1;
  positionSnapshot.collectedFeesToken0 = position.collectedFeesToken0;
  positionSnapshot.collectedFeesToken1 = position.collectedFeesToken1;
  positionSnapshot.feeGrowthInside0LastX128 = position.feeGrowthInside0LastX128;
  positionSnapshot.feeGrowthInside1LastX128 = position.feeGrowthInside0LastX128;
  return;
}

function createPosition(positionId: string) {
  const position = new Position({ id: positionId });

  position.owner = ADDRESS_ZERO;
  position.liquidity = 0n;
  position.depositedToken0 = 0;
  position.depositedToken1 = 0;
  position.withdrawnToken0 = 0;
  position.withdrawnToken1 = 0;
  position.collectedFeesToken0 = 0;
  position.collectedFeesToken1 = 0;
  position.feeGrowthInside0LastX128 = 0n;
  position.feeGrowthInside1LastX128 = 0n;
  position.lastUpdateBlockNumber = 0;
  position.lastUpdateTimestamp = new Date(0);

  return position;
}

async function initPositions(ctx: BlockHandlerContext<Store> & { entities?: EntityManager }, ids: string[]) {
  const multicall = new Multicall(ctx, MULTICALL_ADDRESS);

  const positionResults = await multicall.tryAggregate(
    positionsAbi.functions.positions,
    POSITIONS_ADDRESS,
    ids.map((id) => {
      return { tokenId: BigInt(id) };
    }),
    MULTICALL_PAGE_SIZE
  );

  const positionsData: {
    positionId: string;
    token0Id: string;
    token1Id: string;
    fee: number;
    tickLower: number;
    tickUpper: number;
    feeGrowthInside0LastX128: bigint;
    feeGrowthInside1LastX128: bigint;
  }[] = [];
  for (let i = 0; i < ids.length; i++) {
    const result = positionResults[i];
    if (result.success) {
      positionsData.push({
        positionId: ids[i].toLowerCase(),
        token0Id: result.value.token0.toLowerCase(),
        token1Id: result.value.token1.toLowerCase(),
        fee: result.value.fee,
        tickLower: result.value.tickLower,
        tickUpper: result.value.tickUpper,
        feeGrowthInside0LastX128: result.value.feeGrowthInside0LastX128,
        feeGrowthInside1LastX128: result.value.feeGrowthInside1LastX128,
      });
    }
  }

  const poolIds = await multicall.aggregate(
    factoryAbi.functions.getPool,
    FACTORY_ADDRESS,
    positionsData.map((p) => {
      return {
        tokenA: p.token0Id,
        tokenB: p.token1Id,
        fee: p.fee
      };
    }),
    MULTICALL_PAGE_SIZE
  );

  const positions: Position[] = [];
  const ticksToCreate: Tick[] = [];
  
  for (let i = 0; i < positionsData.length; i++) {
    const position = createPosition(positionsData[i].positionId);
    position.token0Id = positionsData[i].token0Id;
    position.token1Id = positionsData[i].token1Id;
    position.feeGrowthInside0LastX128 = positionsData[i].feeGrowthInside0LastX128;
    position.feeGrowthInside1LastX128 = positionsData[i].feeGrowthInside1LastX128;
    position.poolId = poolIds[i].toLowerCase();

    // temp fix
    if (position.poolId === "0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248")
      continue;

    // Create tick IDs following the pattern from the codebase
    const tickLowerId = tickId(position.poolId, positionsData[i].tickLower);
    const tickUpperId = tickId(position.poolId, positionsData[i].tickUpper);
    
    // Check if ticks exist in entity manager or create new ones
    let tickLower: Tick;
    let tickUpper: Tick;
    
    if (ctx.entities) {
      let existingTickLower = ctx.entities.get(Tick, tickLowerId, false);
      if (!existingTickLower) {
        tickLower = createTick(tickLowerId, positionsData[i].tickLower, position.poolId);
        tickLower.createdAtBlockNumber = ctx.block.height;
        tickLower.createdAtTimestamp = new Date(ctx.block.timestamp);
        ctx.entities.add(tickLower);
      } else {
        tickLower = existingTickLower;
      }
      
      let existingTickUpper = ctx.entities.get(Tick, tickUpperId, false);
      if (!existingTickUpper) {
        tickUpper = createTick(tickUpperId, positionsData[i].tickUpper, position.poolId);
        tickUpper.createdAtBlockNumber = ctx.block.height;
        tickUpper.createdAtTimestamp = new Date(ctx.block.timestamp);
        ctx.entities.add(tickUpper);
      } else {
        tickUpper = existingTickUpper;
      }
    } else {
      // If no entity manager, create ticks to be handled later
      tickLower = createTick(tickLowerId, positionsData[i].tickLower, position.poolId);
      tickLower.createdAtBlockNumber = ctx.block.height;
      tickLower.createdAtTimestamp = new Date(ctx.block.timestamp);
      ticksToCreate.push(tickLower);
      
      tickUpper = createTick(tickUpperId, positionsData[i].tickUpper, position.poolId);
      tickUpper.createdAtBlockNumber = ctx.block.height;
      tickUpper.createdAtTimestamp = new Date(ctx.block.timestamp);
      ticksToCreate.push(tickUpper);
    }
    
    // Assign tick references to position
    position.tickLower = tickLower;
    position.tickUpper = tickUpper;

    // Create an initial snapshot for the new position
    const initialSnapshot = new PositionSnapshot({ 
      id: `${position.id}#${ctx.block.height}` 
    });
    initialSnapshot.owner = position.owner;
    initialSnapshot.poolId = position.poolId;
    initialSnapshot.positionId = position.id;
    initialSnapshot.blockNumber = ctx.block.height;
    initialSnapshot.timestamp = new Date(ctx.block.timestamp);
    initialSnapshot.liquidity = position.liquidity;
    initialSnapshot.depositedToken0 = position.depositedToken0;
    initialSnapshot.depositedToken1 = position.depositedToken1;
    initialSnapshot.withdrawnToken0 = position.withdrawnToken0;
    initialSnapshot.withdrawnToken1 = position.withdrawnToken1;
    initialSnapshot.collectedFeesToken0 = position.collectedFeesToken0;
    initialSnapshot.collectedFeesToken1 = position.collectedFeesToken1;
    initialSnapshot.feeGrowthInside0LastX128 = position.feeGrowthInside0LastX128;
    initialSnapshot.feeGrowthInside1LastX128 = position.feeGrowthInside1LastX128;
    
    // Create a placeholder transaction for the initial snapshot
    const placeholderTx = new Tx({
      id: `${ctx.block.height}-${position.id}-init`,
      blockNumber: ctx.block.height,
      timestamp: new Date(ctx.block.timestamp),
      gasUsed: 0n,
      gasPrice: 0n,
    });
    
    if (ctx.entities) {
      ctx.entities.add(placeholderTx);
      ctx.entities.add(initialSnapshot);
    }
    initialSnapshot.transactionId = placeholderTx.id;

    positions.push(position);
  }

  return positions;
}

function snapshotId(positionId: string, block: number) {
  return `${positionId}#${block}`;
}

function tickId(poolId: string, tick: number) {
  return `${poolId}#${tick}`;
}

interface IncreaseData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  tokenId: string;
  amount0: bigint;
  amount1: bigint;
  liquidity: bigint;
}

function processInreaseLiquidity(log: EvmLog, transaction: any): IncreaseData {
  const event = positionsAbi.events.IncreaseLiquidity.decode(log);

  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    tokenId: event.tokenId.toString(),
    amount0: event.amount0,
    amount1: event.amount1,
    liquidity: event.liquidity,
  };
}

interface DecreaseData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  tokenId: string;
  amount0: bigint;
  amount1: bigint;
  liquidity: bigint;
  logIndex?: number;
}

function processDecreaseLiquidity(log: EvmLog, transaction: any): DecreaseData {
  const event = positionsAbi.events.DecreaseLiquidity.decode(log);

  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    tokenId: event.tokenId.toString(),
    amount0: event.amount0,
    amount1: event.amount1,
    liquidity: event.liquidity,
    logIndex: log.logIndex,
  };
}

interface CollectData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  tokenId: string;
  amount0: bigint;
  amount1: bigint;
}

function processCollect(log: EvmLog, transaction: any): CollectData {
  const event = positionsAbi.events.Collect.decode(log);

  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    tokenId: event.tokenId.toString(),
    amount0: event.amount0,
    amount1: event.amount1,
  };
}

interface TransferData {
  transaction: { hash: string; gasPrice: bigint; from: string; gas: bigint };
  tokenId: string;
  to: string;
}

function processTransafer(log: EvmLog, transaction: any): TransferData {
  const event = positionsAbi.events.Transfer.decode(log);

  return {
    transaction: {
      hash: transaction.hash,
      gasPrice: transaction.gasPrice,
      from: transaction.from,
      gas: BigInt(transaction.gasUsed || 0),
    },
    tokenId: event.tokenId.toString(),
    to: event.to.toLowerCase(),
  };
}

