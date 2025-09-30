import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class RepayAssetWithCollateral {
    constructor(props?: Partial<RepayAssetWithCollateral>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    borrower!: string

    @StringColumn_({nullable: false})
    swapperAddress!: string

    @BigIntColumn_({nullable: false})
    collateralToSwap!: bigint

    @BigIntColumn_({nullable: false})
    amountAssetOut!: bigint

    @BigIntColumn_({nullable: false})
    sharesRepaid!: bigint

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint
}
