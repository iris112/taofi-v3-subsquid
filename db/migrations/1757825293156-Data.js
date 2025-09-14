module.exports = class Data1757825293156 {
    name = 'Data1757825293156'

    async up(db) {
        await db.query(`CREATE TABLE "decrease_liquidity" ("id" character varying NOT NULL, "transaction_id" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL, "token_id" text NOT NULL, "position_id" character varying NOT NULL, "liquidity" numeric NOT NULL, "amount0" numeric NOT NULL, "amount1" numeric NOT NULL, "amount_usd" numeric, "log_index" integer, CONSTRAINT "PK_3e6f5ff9c60cd556faa95ba262a" PRIMARY KEY ("id"))`)
        await db.query(`CREATE INDEX "IDX_3af507a4af77cb90a45ddb8be4" ON "decrease_liquidity" ("transaction_id") `)
        await db.query(`CREATE INDEX "IDX_0b0be373db494dc3c2378ab4c2" ON "decrease_liquidity" ("position_id") `)
        await db.query(`ALTER TABLE "decrease_liquidity" ADD CONSTRAINT "FK_3af507a4af77cb90a45ddb8be46" FOREIGN KEY ("transaction_id") REFERENCES "tx"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
        await db.query(`ALTER TABLE "decrease_liquidity" ADD CONSTRAINT "FK_0b0be373db494dc3c2378ab4c23" FOREIGN KEY ("position_id") REFERENCES "position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`)
    }

    async down(db) {
        await db.query(`DROP TABLE "decrease_liquidity"`)
        await db.query(`DROP INDEX "public"."IDX_3af507a4af77cb90a45ddb8be4"`)
        await db.query(`DROP INDEX "public"."IDX_0b0be373db494dc3c2378ab4c2"`)
        await db.query(`ALTER TABLE "decrease_liquidity" DROP CONSTRAINT "FK_3af507a4af77cb90a45ddb8be46"`)
        await db.query(`ALTER TABLE "decrease_liquidity" DROP CONSTRAINT "FK_0b0be373db494dc3c2378ab4c23"`)
    }
}
