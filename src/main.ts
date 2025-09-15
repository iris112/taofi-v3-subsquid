import { processor } from "./processor";
import { TypeormDatabase } from "@subsquid/typeorm-store";
import { EntityManager } from "./utils/entityManager";
import { processFactory } from "./mappings/factory";
import { processPairs } from "./mappings/core";
import { processPositions } from "./mappings/positionManager";
import {
  Bundle,
  Burn,
  Collect,
  Factory,
  Mint,
  Pool,
  PoolDayData,
  PoolHourData,
  Position,
  PositionSnapshot,
  Swap,
  Tick,
  TickDayData,
  Token,
  TokenDayData,
  TokenHourData,
  Tx,
  UniswapDayData,
} from "./model";

processor.run(new TypeormDatabase(), async (ctx) => {
  const entities = new EntityManager(ctx.store);
  const entitiesCtx = { ...ctx, entities };

  await processFactory(entitiesCtx, ctx.blocks);
  await processPairs(entitiesCtx, ctx.blocks);

  await processPositions(entitiesCtx, ctx.blocks);

  await ctx.store.save(entities.values(Bundle));
  await ctx.store.save(entities.values(Factory));
  await ctx.store.save(entities.values(Token));
  await ctx.store.save(entities.values(Pool));
  await ctx.store.save(entities.values(Tick));
  await ctx.store.insert(entities.values(Tx));
  await ctx.store.insert(entities.values(Mint));
  await ctx.store.insert(entities.values(Burn));
  await ctx.store.insert(entities.values(Swap));
  await ctx.store.insert(entities.values(Collect));
  await ctx.store.save(entities.values(UniswapDayData));
  await ctx.store.save(entities.values(PoolDayData));
  await ctx.store.save(entities.values(PoolHourData)); //
  await ctx.store.save(entities.values(TokenDayData));
  await ctx.store.save(entities.values(TokenHourData));
  await ctx.store.save(entities.values(TickDayData)); //
  await ctx.store.save(entities.values(Position));
  await ctx.store.save(entities.values(PositionSnapshot));
});
