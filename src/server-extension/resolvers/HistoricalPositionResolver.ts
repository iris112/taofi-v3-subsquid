import 'reflect-metadata'
import { Arg, Field, ObjectType, Query, Resolver, Int } from 'type-graphql'
import type { EntityManager } from 'typeorm'
import { LessThanOrEqual } from 'typeorm'
import { Position, PositionSnapshot, Pool, Token, Tick } from '../../model'

// Define custom GraphQL ObjectTypes for historical data
@ObjectType()
export class HistoricalToken {
  @Field(() => String, { nullable: false })
  id!: string

  @Field(() => String, { nullable: false })
  symbol!: string

  @Field(() => String, { nullable: false })
  name!: string

  @Field(() => Int, { nullable: false })
  decimals!: number

  @Field(() => String, { nullable: false })
  totalSupply!: string

  @Field(() => Number, { nullable: false })
  volume!: number

  @Field(() => Number, { nullable: false })
  volumeUSD!: number

  @Field(() => Number, { nullable: false })
  totalValueLocked!: number

  @Field(() => Number, { nullable: false })
  totalValueLockedUSD!: number

  @Field(() => Number, { nullable: false })
  derivedETH!: number

  constructor(props: Partial<HistoricalToken>) {
    Object.assign(this, props)
  }
}

@ObjectType()
export class HistoricalPool {
  @Field(() => String, { nullable: false })
  id!: string

  @Field(() => Int, { nullable: false })
  tick!: number

  @Field(() => Number, { nullable: false })
  token0Price!: number

  @Field(() => Number, { nullable: false })
  token1Price!: number

  @Field(() => String, { nullable: false })
  liquidity!: string

  @Field(() => String, { nullable: false })
  sqrtPrice!: string

  @Field(() => Int, { nullable: false })
  feeTier!: number

  constructor(props: Partial<HistoricalPool>) {
    Object.assign(this, props)
  }
}

@ObjectType()
export class HistoricalTick {
  @Field(() => String, { nullable: false })
  id!: string

  @Field(() => String, { nullable: false })
  tickIdx!: string

  @Field(() => Number, { nullable: false })
  price0!: number

  @Field(() => Number, { nullable: false })
  price1!: number

  @Field(() => String, { nullable: false })
  liquidityGross!: string

  @Field(() => String, { nullable: false })
  liquidityNet!: string

  constructor(props: Partial<HistoricalTick>) {
    Object.assign(this, props)
  }
}

@ObjectType()
export class HistoricalPosition {
  @Field(() => String, { nullable: false })
  id!: string

  @Field(() => String, { nullable: false })
  owner!: string

  @Field(() => String, { nullable: false })
  poolId!: string

  @Field(() => HistoricalPool, { nullable: true })
  pool?: HistoricalPool

  @Field(() => String, { nullable: false })
  token0Id!: string

  @Field(() => HistoricalToken, { nullable: true })
  token0?: HistoricalToken

  @Field(() => String, { nullable: false })
  token1Id!: string

  @Field(() => HistoricalToken, { nullable: true })
  token1?: HistoricalToken

  @Field(() => String, { nullable: true })
  tickLowerId?: string

  @Field(() => HistoricalTick, { nullable: true })
  tickLower?: HistoricalTick

  @Field(() => String, { nullable: true })
  tickUpperId?: string

  @Field(() => HistoricalTick, { nullable: true })
  tickUpper?: HistoricalTick

  @Field(() => String, { nullable: false })
  liquidity!: string

  @Field(() => Number, { nullable: false })
  depositedToken0!: number

  @Field(() => Number, { nullable: false })
  depositedToken1!: number

  @Field(() => Number, { nullable: false })
  withdrawnToken0!: number

  @Field(() => Number, { nullable: false })
  withdrawnToken1!: number

  @Field(() => Number, { nullable: false })
  collectedFeesToken0!: number

  @Field(() => Number, { nullable: false })
  collectedFeesToken1!: number

  @Field(() => String, { nullable: false })
  feeGrowthInside0LastX128!: string

  @Field(() => String, { nullable: false })
  feeGrowthInside1LastX128!: string

  @Field(() => Int, { nullable: false })
  lastUpdateBlockNumber!: number

  @Field(() => Date, { nullable: false })
  lastUpdateTimestamp!: Date

  constructor(props: Partial<HistoricalPosition>) {
    Object.assign(this, props)
  }
}

@Resolver()
export class HistoricalPositionResolver {
  constructor(private tx: () => Promise<EntityManager>) {}

  @Query(() => [HistoricalPosition])
  async positionsAtBlock(
    @Arg('blockNumber', () => Int) blockNumber: number,
    @Arg('limit', () => Int, { nullable: true }) limit?: number,
    @Arg('offset', () => Int, { nullable: true }) offset?: number,
    @Arg('orderBy', () => String, { nullable: true }) orderBy?: string
  ): Promise<HistoricalPosition[]> {
    const manager = await this.tx()

    // Get all unique position IDs that existed at or before the target block
    const subQuery = manager
      .createQueryBuilder(PositionSnapshot, 'ps1')
      .select('ps1.position_id', 'position_id')
      .addSelect('MAX(ps1.block_number)', 'max_block_number')
      .where('ps1.block_number <= :blockNumber', { blockNumber })
      .groupBy('ps1.position_id')

    // Get the actual snapshots for those positions at their latest block <= target block
    let query = manager
      .createQueryBuilder(PositionSnapshot, 'ps')
      .leftJoinAndSelect('ps.pool', 'pool')
      .leftJoinAndSelect('ps.position', 'position')
      .leftJoinAndSelect('position.token0', 'token0')
      .leftJoinAndSelect('position.token1', 'token1')
      .leftJoinAndSelect('position.tickLower', 'tickLower')
      .leftJoinAndSelect('position.tickUpper', 'tickUpper')
      .innerJoin(
        `(${subQuery.getQuery()})`,
        'latest',
        'ps.position_id = latest.position_id AND ps.block_number = latest.max_block_number'
      )
      .setParameters(subQuery.getParameters())

    // Apply ordering
    if (orderBy) {
      const [field, direction] = orderBy.split('_')
      query = query.addOrderBy(`ps.${field}`, direction === 'DESC' ? 'DESC' : 'ASC')
    }

    // Apply pagination
    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.offset(offset)
    }

    const snapshots = await query.getMany()

    // Transform PositionSnapshot entities to HistoricalPosition
    return snapshots.map(snapshot => new HistoricalPosition({
      id: snapshot.positionId,
      owner: snapshot.owner,
      poolId: snapshot.poolId,
      pool: snapshot.pool ? new HistoricalPool({
        id: snapshot.pool.id,
        tick: snapshot.pool.tick ?? 0,
        token0Price: snapshot.pool.token0Price,
        token1Price: snapshot.pool.token1Price,
        liquidity: snapshot.pool.liquidity.toString(),
        sqrtPrice: snapshot.pool.sqrtPrice.toString(),
        feeTier: snapshot.pool.feeTier
      }) : undefined,
      token0Id: snapshot.position?.token0Id || '',
      token0: snapshot.position?.token0 ? new HistoricalToken({
        id: snapshot.position.token0.id,
        symbol: snapshot.position.token0.symbol,
        name: snapshot.position.token0.name,
        decimals: snapshot.position.token0.decimals,
        totalSupply: snapshot.position.token0.totalSupply.toString(),
        volume: snapshot.position.token0.volume,
        volumeUSD: snapshot.position.token0.volumeUSD,
        totalValueLocked: snapshot.position.token0.totalValueLocked,
        totalValueLockedUSD: snapshot.position.token0.totalValueLockedUSD,
        derivedETH: snapshot.position.token0.derivedETH
      }) : undefined,
      token1Id: snapshot.position?.token1Id || '',
      token1: snapshot.position?.token1 ? new HistoricalToken({
        id: snapshot.position.token1.id,
        symbol: snapshot.position.token1.symbol,
        name: snapshot.position.token1.name,
        decimals: snapshot.position.token1.decimals,
        totalSupply: snapshot.position.token1.totalSupply.toString(),
        volume: snapshot.position.token1.volume,
        volumeUSD: snapshot.position.token1.volumeUSD,
        totalValueLocked: snapshot.position.token1.totalValueLocked,
        totalValueLockedUSD: snapshot.position.token1.totalValueLockedUSD,
        derivedETH: snapshot.position.token1.derivedETH
      }) : undefined,
      tickLowerId: snapshot.position?.tickLower?.id,
      tickLower: snapshot.position?.tickLower ? new HistoricalTick({
        id: snapshot.position.tickLower.id,
        tickIdx: snapshot.position.tickLower.tickIdx.toString(),
        price0: snapshot.position.tickLower.price0,
        price1: snapshot.position.tickLower.price1,
        liquidityGross: snapshot.position.tickLower.liquidityGross.toString(),
        liquidityNet: snapshot.position.tickLower.liquidityNet.toString()
      }) : undefined,
      tickUpperId: snapshot.position?.tickUpper?.id,
      tickUpper: snapshot.position?.tickUpper ? new HistoricalTick({
        id: snapshot.position.tickUpper.id,
        tickIdx: snapshot.position.tickUpper.tickIdx.toString(),
        price0: snapshot.position.tickUpper.price0,
        price1: snapshot.position.tickUpper.price1,
        liquidityGross: snapshot.position.tickUpper.liquidityGross.toString(),
        liquidityNet: snapshot.position.tickUpper.liquidityNet.toString()
      }) : undefined,
      liquidity: snapshot.liquidity.toString(),
      depositedToken0: snapshot.depositedToken0,
      depositedToken1: snapshot.depositedToken1,
      withdrawnToken0: snapshot.withdrawnToken0,
      withdrawnToken1: snapshot.withdrawnToken1,
      collectedFeesToken0: snapshot.collectedFeesToken0,
      collectedFeesToken1: snapshot.collectedFeesToken1,
      feeGrowthInside0LastX128: snapshot.feeGrowthInside0LastX128.toString(),
      feeGrowthInside1LastX128: snapshot.feeGrowthInside1LastX128.toString(),
      lastUpdateBlockNumber: snapshot.blockNumber,
      lastUpdateTimestamp: snapshot.timestamp
    }))
  }

  @Query(() => HistoricalPosition, { nullable: true })
  async positionAtBlock(
    @Arg('id', () => String) id: string,
    @Arg('blockNumber', () => Int) blockNumber: number
  ): Promise<HistoricalPosition | null> {
    const manager = await this.tx()

    // Find the latest snapshot for this position at or before the target block
    const snapshot = await manager.findOne(PositionSnapshot, {
      where: {
        positionId: id,
        blockNumber: LessThanOrEqual(blockNumber)
      },
      relations: ['pool', 'position', 'position.token0', 'position.token1', 'position.tickLower', 'position.tickUpper'],
      order: {
        blockNumber: 'DESC'
      }
    })

    if (!snapshot || !snapshot.position) {
      return null
    }

    return new HistoricalPosition({
      id: snapshot.positionId,
      owner: snapshot.owner,
      poolId: snapshot.poolId,
      pool: snapshot.pool ? new HistoricalPool({
        id: snapshot.pool.id,
        tick: snapshot.pool.tick ?? 0,
        token0Price: snapshot.pool.token0Price,
        token1Price: snapshot.pool.token1Price,
        liquidity: snapshot.pool.liquidity.toString(),
        sqrtPrice: snapshot.pool.sqrtPrice.toString(),
        feeTier: snapshot.pool.feeTier
      }) : undefined,
      token0Id: snapshot.position.token0Id,
      token0: snapshot.position.token0 ? new HistoricalToken({
        id: snapshot.position.token0.id,
        symbol: snapshot.position.token0.symbol,
        name: snapshot.position.token0.name,
        decimals: snapshot.position.token0.decimals,
        totalSupply: snapshot.position.token0.totalSupply.toString(),
        volume: snapshot.position.token0.volume,
        volumeUSD: snapshot.position.token0.volumeUSD,
        totalValueLocked: snapshot.position.token0.totalValueLocked,
        totalValueLockedUSD: snapshot.position.token0.totalValueLockedUSD,
        derivedETH: snapshot.position.token0.derivedETH
      }) : undefined,
      token1Id: snapshot.position.token1Id,
      token1: snapshot.position.token1 ? new HistoricalToken({
        id: snapshot.position.token1.id,
        symbol: snapshot.position.token1.symbol,
        name: snapshot.position.token1.name,
        decimals: snapshot.position.token1.decimals,
        totalSupply: snapshot.position.token1.totalSupply.toString(),
        volume: snapshot.position.token1.volume,
        volumeUSD: snapshot.position.token1.volumeUSD,
        totalValueLocked: snapshot.position.token1.totalValueLocked,
        totalValueLockedUSD: snapshot.position.token1.totalValueLockedUSD,
        derivedETH: snapshot.position.token1.derivedETH
      }) : undefined,
      tickLowerId: snapshot.position.tickLower?.id,
      tickLower: snapshot.position.tickLower ? new HistoricalTick({
        id: snapshot.position.tickLower.id,
        tickIdx: snapshot.position.tickLower.tickIdx.toString(),
        price0: snapshot.position.tickLower.price0,
        price1: snapshot.position.tickLower.price1,
        liquidityGross: snapshot.position.tickLower.liquidityGross.toString(),
        liquidityNet: snapshot.position.tickLower.liquidityNet.toString()
      }) : undefined,
      tickUpperId: snapshot.position.tickUpper?.id,
      tickUpper: snapshot.position.tickUpper ? new HistoricalTick({
        id: snapshot.position.tickUpper.id,
        tickIdx: snapshot.position.tickUpper.tickIdx.toString(),
        price0: snapshot.position.tickUpper.price0,
        price1: snapshot.position.tickUpper.price1,
        liquidityGross: snapshot.position.tickUpper.liquidityGross.toString(),
        liquidityNet: snapshot.position.tickUpper.liquidityNet.toString()
      }) : undefined,
      liquidity: snapshot.liquidity.toString(),
      depositedToken0: snapshot.depositedToken0,
      depositedToken1: snapshot.depositedToken1,
      withdrawnToken0: snapshot.withdrawnToken0,
      withdrawnToken1: snapshot.withdrawnToken1,
      collectedFeesToken0: snapshot.collectedFeesToken0,
      collectedFeesToken1: snapshot.collectedFeesToken1,
      feeGrowthInside0LastX128: snapshot.feeGrowthInside0LastX128.toString(),
      feeGrowthInside1LastX128: snapshot.feeGrowthInside1LastX128.toString(),
      lastUpdateBlockNumber: snapshot.blockNumber,
      lastUpdateTimestamp: snapshot.timestamp
    })
  }
}