import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, ManyToOne as ManyToOne_, Index as Index_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, FloatColumn as FloatColumn_} from "@subsquid/typeorm-store"
import {Pool} from "./pool.model"
import {Position} from "./position.model"

@Entity_()
export class PositionFeeSnapshot {
    constructor(props?: Partial<PositionFeeSnapshot>) {
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
    positionId!: string

    @Index_()
    @ManyToOne_(() => Position, {nullable: true})
    position!: Position

    @Index_()
    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @FloatColumn_({nullable: false})
    totalFeeToken0!: number

    @FloatColumn_({nullable: false})
    totalFeeToken1!: number
}
