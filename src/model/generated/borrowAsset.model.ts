import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class BorrowAsset {
    constructor(props?: Partial<BorrowAsset>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    borrower!: string

    @StringColumn_({nullable: false})
    receiver!: string

    @BigIntColumn_({nullable: false})
    borrowAmount!: bigint

    @BigIntColumn_({nullable: false})
    sharesAdded!: bigint

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint
}
