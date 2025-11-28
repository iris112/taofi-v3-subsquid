import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, ManyToOne as ManyToOne_, Index as Index_, BigIntColumn as BigIntColumn_, FloatColumn as FloatColumn_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"
import {Pool} from "./pool.model"
import {Token} from "./token.model"
import {Tick} from "./tick.model"
import {PositionFeeSnapshot} from "./positionFeeSnapshot.model"

@Entity_()
export class Position {
    constructor(props?: Partial<Position>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    owner!: string

    @StringColumn_({nullable: false})
    poolId!: string

    @Index_()
    @ManyToOne_(() => Pool, {nullable: true})
    pool!: Pool

    @StringColumn_({nullable: false})
    token0Id!: string

    @Index_()
    @ManyToOne_(() => Token, {nullable: true})
    token0!: Token

    @StringColumn_({nullable: false})
    token1Id!: string

    @Index_()
    @ManyToOne_(() => Token, {nullable: true})
    token1!: Token

    @Index_()
    @ManyToOne_(() => Tick, {nullable: true})
    tickLower!: Tick

    @BigIntColumn_({nullable: false})
    tickIdxLower!: bigint

    @Index_()
    @ManyToOne_(() => Tick, {nullable: true})
    tickUpper!: Tick

    @BigIntColumn_({nullable: false})
    tickIdxUpper!: bigint

    @BigIntColumn_({nullable: false})
    liquidity!: bigint

    @FloatColumn_({nullable: false})
    depositedToken0!: number

    @FloatColumn_({nullable: false})
    depositedToken1!: number

    @FloatColumn_({nullable: false})
    withdrawnToken0!: number

    @FloatColumn_({nullable: false})
    withdrawnToken1!: number

    @FloatColumn_({nullable: false})
    collectedFeesToken0!: number

    @FloatColumn_({nullable: false})
    collectedFeesToken1!: number

    @BigIntColumn_({nullable: false})
    feeGrowthInside0LastX128!: bigint

    @BigIntColumn_({nullable: false})
    feeGrowthInside1LastX128!: bigint

    @IntColumn_({nullable: false})
    lastUpdateBlockNumber!: number

    @DateTimeColumn_({nullable: false})
    lastUpdateTimestamp!: Date

    @DateTimeColumn_({nullable: false})
    createdAtTimestamp!: Date

    @IntColumn_({nullable: false})
    createdAtBlockNumber!: number

    @StringColumn_({nullable: true})
    lastPositionFeeSnapshotId!: string | undefined | null

    @Index_()
    @ManyToOne_(() => PositionFeeSnapshot, {nullable: true})
    lastPositionFeeSnapshot!: PositionFeeSnapshot | undefined | null
}
