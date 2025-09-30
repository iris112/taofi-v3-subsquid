import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class RepayAsset {
    constructor(props?: Partial<RepayAsset>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    payer!: string

    @StringColumn_({nullable: false})
    borrower!: string

    @BigIntColumn_({nullable: false})
    amountToRepay!: bigint

    @BigIntColumn_({nullable: false})
    shares!: bigint

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint
}
