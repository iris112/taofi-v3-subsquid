import {
  BlockHeader,
} from "../utils/interfaces/interfaces";

import { Multicall } from "../abi/multicall";
import { Position, Tick, Pool, Token, PositionFeeSnapshot } from "../model";
import {
  MULTICALL_ADDRESS,
  POSITIONS_ADDRESS,
  MULTICALL_PAGE_SIZE,
} from "../utils/constants";
import { EntityManager } from "../utils/entityManager";
import * as poolAbi from "../abi/pool";
import * as positionsAbi from "../abi/NonfungiblePositionManager";
import { BlockData, DataHandlerContext } from "@subsquid/evm-processor";
import { Store } from "@subsquid/typeorm-store";
import { FindOperator } from "typeorm";
import { BigDecimal } from "@subsquid/big-decimal";

type ContextWithEntityManager = DataHandlerContext<Store> & {
  entities: EntityManager;
};

export async function processFeeSnapshots(
  ctx: ContextWithEntityManager,
  blocks: BlockData[]
): Promise<void> {

  const poolTicks = processItems(blocks);

  if ((await prefetch(ctx)).length == 0) return;

  for (const block of blocks) {
    const positions: Position[] = ctx.entities.values(Position).filter((p) => {
      return p.liquidity > 0 && p.createdAtBlockNumber <= block.header.height
    })
    if (positions.length == 0) continue;

    const token0 = ctx.entities.get(Token, positions[0].token0Id, false);
    const token1 = ctx.entities.get(Token, positions[0].token1Id, false);
    if (!token0 || !token1) continue;

    const pool = ctx.entities.get(Pool, positions[0].poolId, false);
    if (!pool) continue;

    const poolTick = poolTicks.filter((pt) => pt.blockNumber <= block.header.height).slice(-1)[0]?.tick || pool.tick || 0;

    const positionCalls = positions.map((position) => { return { tokenId: BigInt(position.id) }; });
    const poolCalls:[string, {}][] = positions.map((position) => { return [position.poolId, {}]; });
    const tickLowerCalls:[string, { tick: bigint }][] = positions.map((position) => { return [position.poolId, { tick: position.tickIdxLower }]; });
    const tickUpperCalls:[string, { tick: bigint }][] = positions.map((position) => { return [position.poolId, { tick: position.tickIdxUpper }]; });

    const multicall = new Multicall({...ctx, block: block.header}, MULTICALL_ADDRESS);
    
    // for (const item of positions) {
    //   const contract = new positionsAbi.Contract({...ctx, block: block.header}, POSITIONS_ADDRESS);
    //   console.log("Fetching position ", item.id, item.lastUpdateBlockNumber, item.tickLower.createdAtBlockNumber, item.tickUpper.createdAtBlockNumber);
    //   const ret = await contract.positions(BigInt(item.id));
    // }

    const [positionResults, poolFee0Results, poolFee1Results, tickLowerResults, tickUpperResults] = await Promise.all([
      multicall.aggregate(
        positionsAbi.functions.positions,
        POSITIONS_ADDRESS,
        positionCalls,
        MULTICALL_PAGE_SIZE
      ),
      multicall.aggregate(
        poolAbi.functions.feeGrowthGlobal0X128,
        poolCalls,
        MULTICALL_PAGE_SIZE
      ),
      multicall.aggregate(
        poolAbi.functions.feeGrowthGlobal1X128,
        poolCalls,
        MULTICALL_PAGE_SIZE
      ),
      multicall.aggregate(
        poolAbi.functions.ticks,
        tickLowerCalls,
        MULTICALL_PAGE_SIZE
      ),
      multicall.aggregate(
        poolAbi.functions.ticks,
        tickUpperCalls,
        MULTICALL_PAGE_SIZE
      )
    ]);
  
    for (const position of positions) {
      const id = positions.indexOf(position);
      position.feeGrowthInside0LastX128 = positionResults[id].feeGrowthInside0LastX128;
      position.feeGrowthInside1LastX128 = positionResults[id].feeGrowthInside1LastX128;
      if (positionResults[id].feeGrowthInside0LastX128 > poolFee0Results[id] ||
        positionResults[id].feeGrowthInside1LastX128 > poolFee1Results[id]) {
        continue;
      }

      const feeGrowthInside0 = getFeeGrowthInside(
        poolTick,
        Number(position.tickIdxLower),
        Number(position.tickIdxUpper),
        poolFee0Results[id],
        tickLowerResults[id].feeGrowthOutside0X128,
        tickUpperResults[id].feeGrowthOutside0X128
      );
    
      const feeGrowthInside1 = getFeeGrowthInside(
        poolTick,
        Number(position.tickIdxLower),
        Number(position.tickIdxUpper),
        poolFee1Results[id],
        tickLowerResults[id].feeGrowthOutside1X128,
        tickUpperResults[id].feeGrowthOutside1X128
      );

      const feeDelta0 = feeGrowthInside0 - positionResults[id].feeGrowthInside0LastX128;
      const feeDelta1 = feeGrowthInside1 - positionResults[id].feeGrowthInside1LastX128;

      const divisor = BigInt(2) ** BigInt(128);

      const token0Fee = position.liquidity * feeDelta0 / divisor;
      const token1Fee = position.liquidity * feeDelta1 / divisor;

      const feeSnapshotId = snapshotId(position.id, block.header.height);
      const positionFeeSnapshot = createPositionFeeSnapshot(feeSnapshotId, position, block.header);
      positionFeeSnapshot.totalFeeToken0 = BigDecimal(token0Fee, token0.decimals).toNumber() + position.collectedFeesToken0;
      positionFeeSnapshot.totalFeeToken1 = BigDecimal(token1Fee, token1.decimals).toNumber() + position.collectedFeesToken1;
      ctx.entities.add(positionFeeSnapshot);
    }
  }
}

async function prefetch(
  ctx: ContextWithEntityManager
) {
  const positionIds = (await ctx.store.find(Position, {
    where: {
      liquidity: new FindOperator('moreThan', BigInt(0))
    }
  })).map((p) => p.id);
  
  if (positionIds.length != 0) {
    ctx.entities.defer(Position, ...positionIds);
    await ctx.entities.load(Position);

    for (const position of ctx.entities.values(Position)) {
      ctx.entities.defer(Tick, position.tickIdxLower);
      ctx.entities.defer(Tick, position.tickIdxUpper);
      ctx.entities.defer(Pool, position.poolId);
    }

    
    await ctx.entities.load(Tick);
    await ctx.entities.load(Pool);
  }

  return positionIds;
}

function processItems(
  blocks: BlockData[]
) {
  let poolTicks: { blockNumber: number, tick: number }[] = [];

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
      
      if (log.topics[0] == poolAbi.events.Swap.topic) {
        const event = poolAbi.events.Swap.decode(evmLog);
        poolTicks.push({ blockNumber: block.header.height, tick: event.tick });
      }
    }
  }
  return poolTicks;
}

function snapshotId(positionId: string, block: number) {
  return `${positionId}#${block}`;
}

function createPositionFeeSnapshot(feeSnapshotId: string, position: Position, blockHeader: BlockHeader): PositionFeeSnapshot {
  const positionFeeSnapshot = new PositionFeeSnapshot({ id: feeSnapshotId });

  positionFeeSnapshot.owner = position.owner;
  positionFeeSnapshot.poolId = position.poolId;
  positionFeeSnapshot.positionId = position.id;
  positionFeeSnapshot.blockNumber = blockHeader.height;
  positionFeeSnapshot.timestamp = new Date(blockHeader.timestamp);
  positionFeeSnapshot.totalFeeToken0 = 0;
  positionFeeSnapshot.totalFeeToken1 = 0;

  return positionFeeSnapshot;
}

function getFeeGrowthInside(
  tickCurrent: number,
  tickLower: number,
  tickUpper: number,
  feeGrowthGlobalX128: bigint,
  lowerFeeGrowthOutsideX128: bigint,
  upperFeeGrowthOutsideX128: bigint
): bigint {

  let feeGrowthBelow: bigint;
  let feeGrowthAbove: bigint;

  // ----- FEE GROWTH BELOW -----
  if (tickCurrent >= tickLower) {
    // price is above tickLower → outside is BELOW
    feeGrowthBelow = lowerFeeGrowthOutsideX128;
  } else {
    // price is below tickLower → subtract below from global
    feeGrowthBelow = feeGrowthGlobalX128 - lowerFeeGrowthOutsideX128;
  }

  // ----- FEE GROWTH ABOVE -----
  if (tickCurrent < tickUpper) {
    // price is below tickUpper → outside is ABOVE
    feeGrowthAbove = upperFeeGrowthOutsideX128;
  } else {
    // price is above tickUpper → subtract above from global
    feeGrowthAbove = feeGrowthGlobalX128 - upperFeeGrowthOutsideX128;
  }

  // ----- FEE GROWTH INSIDE -----
  const feeGrowthInside =
    feeGrowthGlobalX128 - feeGrowthBelow - feeGrowthAbove;

  return feeGrowthInside;
}