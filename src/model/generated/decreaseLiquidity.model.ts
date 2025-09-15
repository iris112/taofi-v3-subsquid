import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, ManyToOne as ManyToOne_, Index as Index_, DateTimeColumn as DateTimeColumn_, BigIntColumn as BigIntColumn_, FloatColumn as FloatColumn_, IntColumn as IntColumn_} from "@subsquid/typeorm-store"
import {Tx} from "./tx.model"
import {Position} from "./position.model"

@Entity_()
export class DecreaseLiquidity {
    constructor(props?: Partial<DecreaseLiquidity>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    transactionId!: string

    @Index_()
    @ManyToOne_(() => Tx, {nullable: true})
    transaction!: Tx

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @StringColumn_({nullable: false})
    tokenId!: string

    @StringColumn_({nullable: false})
    positionId!: string

    @Index_()
    @ManyToOne_(() => Position, {nullable: true})
    position!: Position

    @BigIntColumn_({nullable: false})
    liquidity!: bigint

    @FloatColumn_({nullable: false})
    amount0!: number

    @FloatColumn_({nullable: false})
    amount1!: number

    @FloatColumn_({nullable: true})
    amountUSD!: number | undefined | null

    @IntColumn_({nullable: true})
    logIndex!: number | undefined | null
}
