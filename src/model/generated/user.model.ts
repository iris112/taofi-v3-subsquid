import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class User {
    constructor(props?: Partial<User>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: false})
    totalDeposits!: bigint

    @BigIntColumn_({nullable: false})
    totalBorrows!: bigint

    @BigIntColumn_({nullable: false})
    totalCollateral!: bigint

    @BigIntColumn_({nullable: false})
    depositCount!: bigint

    @BigIntColumn_({nullable: false})
    withdrawCount!: bigint

    @BigIntColumn_({nullable: false})
    borrowCount!: bigint

    @BigIntColumn_({nullable: false})
    repayCount!: bigint

    @BigIntColumn_({nullable: false})
    collateralCount!: bigint

    @BigIntColumn_({nullable: false})
    lastUpdateBlockNumber!: bigint

    @DateTimeColumn_({nullable: false})
    lastUpdateTimestamp!: Date
}
