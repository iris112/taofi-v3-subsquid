import {
  BlockHeader,
} from "../utils/interfaces/interfaces";

import { Multicall } from "../abi/multicall";
import { Position, Tick, Pool, PositionFeeSnapshot } from "../model";
import {
  ADDRESS_ZERO,

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

    const poolTick = poolTicks.filter((pt) => pt.blockNumber <= block.header.height).slice(-1)[0]?.tick || 0;

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
      positionFeeSnapshot.totalFeeToken0 = Number(token0Fee) + position.collectedFeesToken0;
      positionFeeSnapshot.totalFeeToken1 = Number(token1Fee) + position.collectedFeesToken1;
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
  feeGrowthOutsideLowerX128: bigint,
  feeGrowthOutsideUpperX128: bigint
): bigint {
  let feeGrowthInside: bigint;

  if (tickCurrent < tickLower) {
    // current tick below range
    feeGrowthInside = feeGrowthOutsideLowerX128 - feeGrowthOutsideUpperX128;
  } else if (tickCurrent >= tickUpper) {
    // current tick above range
    feeGrowthInside = feeGrowthOutsideUpperX128 - feeGrowthOutsideLowerX128;
  } else {
    // current tick inside range
    feeGrowthInside = feeGrowthGlobalX128 - feeGrowthOutsideLowerX128 - feeGrowthOutsideUpperX128;
  }

  return feeGrowthInside;
}