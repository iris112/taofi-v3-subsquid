import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    AddCollateral: event("0xa32435755c235de2976ed44a75a2f85cb01faf0c894f639fe0c32bb9455fea8f", "AddCollateral(address,address,uint256)", {"sender": indexed(p.address), "borrower": indexed(p.address), "collateralAmount": p.uint256}),
    AddInterest: event("0x2b5229f33f1d24d5baab718e1e25d0d86195a9b6d786c2c0868edfb21a460e25", "AddInterest(uint256,uint256,uint256,uint256)", {"interestEarned": p.uint256, "rate": p.uint256, "feesAmount": p.uint256, "feesShare": p.uint256}),
    Approval: event("0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925", "Approval(address,address,uint256)", {"owner": indexed(p.address), "spender": indexed(p.address), "value": p.uint256}),
    BorrowAsset: event("0x01348584ec81ac7acd52b7d66d9ade986dd909f3d513881c190fc31c90527efe", "BorrowAsset(address,address,uint256,uint256)", {"_borrower": indexed(p.address), "_receiver": indexed(p.address), "_borrowAmount": p.uint256, "_sharesAdded": p.uint256}),
    ChangeFee: event("0x58a58c712558f3d6e20bed57421eb8f73048d881dea9e5bb80efb37c49680d1c", "ChangeFee(uint32)", {"newFee": p.uint32}),
    Deposit: event("0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7", "Deposit(address,address,uint256,uint256)", {"caller": indexed(p.address), "owner": indexed(p.address), "assets": p.uint256, "shares": p.uint256}),
    Liquidate: event("0x821de4e13fff1938b3806eb2859b6a5d55111f00dcf286f8a793584228ff36f8", "Liquidate(address,uint256,uint256,uint256,uint256,uint256,uint256)", {"_borrower": indexed(p.address), "_collateralForLiquidator": p.uint256, "_sharesToLiquidate": p.uint256, "_amountLiquidatorToRepay": p.uint256, "_feesAmount": p.uint256, "_sharesToAdjust": p.uint256, "_amountToAdjust": p.uint256}),
    OwnershipTransferStarted: event("0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700", "OwnershipTransferStarted(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    PauseInterest: event("0xdea8bb46eee4300a7d2de86939c245f568dc5994576194cbfb69969e010dcb67", "PauseInterest(bool)", {"isPaused": p.bool}),
    PauseLiquidate: event("0x28bc4f9e24da61e7ba3aa697dfaefd0167093d2425c00b6190a7d3152ee6dfaa", "PauseLiquidate(bool)", {"isPaused": p.bool}),
    PauseRepay: event("0x34a71a12fa81891b738d910d4d44ffabeeb12f8bc026844db237ea8bf8ebe8be", "PauseRepay(bool)", {"isPaused": p.bool}),
    PauseWithdraw: event("0xc56dd3e14f5af3a74c61b7cdf855a3d8ab4401c78c0622a4d312de8a8f8736a2", "PauseWithdraw(bool)", {"isPaused": p.bool}),
    RemoveCollateral: event("0xbc290bb45104f73cf92115c9603987c3f8fd30c182a13603d8cffa49b5f59952", "RemoveCollateral(address,uint256,address,address)", {"_sender": indexed(p.address), "_collateralAmount": p.uint256, "_receiver": indexed(p.address), "_borrower": indexed(p.address)}),
    RepayAsset: event("0x9dc1449a0ff0c152e18e8289d865b47acc6e1b76b1ecb239c13d6ee22a9206a7", "RepayAsset(address,address,uint256,uint256)", {"payer": indexed(p.address), "borrower": indexed(p.address), "amountToRepay": p.uint256, "shares": p.uint256}),
    RepayAssetWithCollateral: event("0xe947f0f9b6255bdcf76d13d1257d34fbe380e0d5d4daa75e61c783a41e1607ba", "RepayAssetWithCollateral(address,address,uint256,uint256,uint256)", {"_borrower": indexed(p.address), "_swapperAddress": p.address, "_collateralToSwap": p.uint256, "_amountAssetOut": p.uint256, "_sharesRepaid": p.uint256}),
    RevokeLiquidateAccessControl: event("0x60c2acdf5b421891c8cc7302420292f2680f0e835fc76dd15f35a7bb0dd5cbc8", "RevokeLiquidateAccessControl()", {}),
    RevokeMaxLTVSetter: event("0x0af6d9d6ea0e3f0cdb71562ce1fce30aa597445ea04f5b25a939cfe0a252171c", "RevokeMaxLTVSetter()", {}),
    RevokeRepayAccessControl: event("0x269ac55859865c2ff127a862e95c81ce7e3b9b13582036d3df419df5c07ec8b4", "RevokeRepayAccessControl()", {}),
    RevokeWithdrawAccessControl: event("0xb949af551d0c88280e648f9205b986bb5f1d899c425498238655ee37617c0c39", "RevokeWithdrawAccessControl()", {}),
    SetBorrowLimit: event("0xbf1ce7fb3a8e648b70ea830f99b52f7ea31554186d29763280751f42e77f6386", "SetBorrowLimit(uint256)", {"limit": p.uint256}),
    SetCircuitBreaker: event("0x4cb8c9e37efb94c6cdbd2a80fe36cee1957b5584d1a1986fa2bae115180af59a", "SetCircuitBreaker(address,address)", {"oldCircuitBreaker": p.address, "newCircuitBreaker": p.address}),
    SetDepositLimit: event("0x854df3eb95564502c8bc871ebdd15310ee26270f955f6c6bd8cea68e75045bc0", "SetDepositLimit(uint256)", {"limit": p.uint256}),
    SetGauge: event("0x17228b08e4c958112a0827a6d8dc8475dba58dd068a3d400800a606794db02a6", "SetGauge(address)", {"_gauge": indexed(p.address)}),
    SetLiquidationFees: event("0xc9aa62b60be8f25ac9f285edbb80bde64199b3c53e1da1027058551d32695fca", "SetLiquidationFees(uint256,uint256,uint256,uint256,uint256,uint256)", {"oldCleanLiquidationFee": p.uint256, "oldDirtyLiquidationFee": p.uint256, "oldProtocolLiquidationFee": p.uint256, "newCleanLiquidationFee": p.uint256, "newDirtyLiquidationFee": p.uint256, "newProtocolLiquidationFee": p.uint256}),
    SetMaxLTV: event("0xe796e9ae748449310fcd1cc6718aab236c9b8d2e0e04dacb232ba564d5b338cc", "SetMaxLTV(uint256,uint256)", {"oldMaxLTV": p.uint256, "newMaxLTV": p.uint256}),
    SetOracleInfo: event("0x78ba1c32ac8ea4b3d51133dd0b6f5d8f98e23797aade6afc381ea317d5d4f28b", "SetOracleInfo(address,uint32,address,uint32)", {"oldOracle": p.address, "oldMaxOracleDeviation": p.uint32, "newOracle": p.address, "newMaxOracleDeviation": p.uint32}),
    SetRateContract: event("0xaeae842c8b3cd009fbb602e1ed072dc1aec69750e431ceae97f7543b466cd04c", "SetRateContract(address,address)", {"oldRateContract": p.address, "newRateContract": p.address}),
    SetSwapper: event("0xea1eefb4fd58778d7b274fe54045a9feeec8f2847899c2e71126d3a74d486da5", "SetSwapper(address,bool)", {"swapper": p.address, "approval": p.bool}),
    SetWhitelistedDelegators: event("0x00e87392aa4ff46a408dc81eaa7d09885b4ec4e0c3c6fbc3e7310b53f5581763", "SetWhitelistedDelegators(address,bool)", {"_delegator": indexed(p.address), "_enabled": p.bool}),
    TimelockTransferStarted: event("0x162998b90abc2507f3953aa797827b03a14c42dbd9a35f09feaf02e0d592773a", "TimelockTransferStarted(address,address)", {"previousTimelock": indexed(p.address), "newTimelock": indexed(p.address)}),
    TimelockTransferred: event("0x31b6c5a04b069b6ec1b3cef44c4e7c1eadd721349cda9823d0b1877b3551cdc6", "TimelockTransferred(address,address)", {"previousTimelock": indexed(p.address), "newTimelock": indexed(p.address)}),
    Transfer: event("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef", "Transfer(address,address,uint256)", {"from": indexed(p.address), "to": indexed(p.address), "value": p.uint256}),
    UpdateExchangeRate: event("0xc1f41e029acf5127d111625602160c4cee3e1a4d38e691e50544d1f7c68b77be", "UpdateExchangeRate(uint256,uint256)", {"lowExchangeRate": p.uint256, "highExchangeRate": p.uint256}),
    UpdateRate: event("0xc63977c8e2362a31182dc8e89a52252f9836922738e0abcfc0de6924972eafe5", "UpdateRate(uint256,uint256,uint256,uint256)", {"oldRatePerSec": p.uint256, "oldFullUtilizationRate": p.uint256, "newRatePerSec": p.uint256, "newFullUtilizationRate": p.uint256}),
    UserBorrowAllowanceDelegated: event("0x399f462d2df28f9d69d52cdcfd7e6ef0598b231d0b9baa75ae424e43195ffe81", "UserBorrowAllowanceDelegated(address,address,uint256)", {"_fromUser": indexed(p.address), "_toUser": indexed(p.address), "_amount": p.uint256}),
    WarnOracleData: event("0xfc131c36b7e444dacda44901fd43641dcdcfdc43fe9e2601b3c1dd87061db9e5", "WarnOracleData(address)", {"oracle": p.address}),
    Withdraw: event("0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db", "Withdraw(address,address,address,uint256,uint256)", {"caller": indexed(p.address), "receiver": indexed(p.address), "owner": indexed(p.address), "assets": p.uint256, "shares": p.uint256}),
    WithdrawFees: event("0xaf48306b6b4f0ba30d00f05b21559d8d29934142980a553d8a014780c6c7e452", "WithdrawFees(uint128,address,uint256,uint256)", {"shares": p.uint128, "recipient": p.address, "amountToTransfer": p.uint256, "collateralAmount": p.uint256}),
}

export const functions = {
    DEPLOYER_ADDRESS: viewFun("0xd2a156e0", "DEPLOYER_ADDRESS()", {}, p.address),
    acceptOwnership: fun("0x79ba5097", "acceptOwnership()", {}, ),
    acceptTransferTimelock: fun("0xf6ccaad4", "acceptTransferTimelock()", {}, ),
    addCollateral: fun("0xcadac479", "addCollateral(uint256,address)", {"_collateralAmount": p.uint256, "_borrower": p.address}, ),
    addInterest: fun("0x1c6c9597", "addInterest(bool)", {"_returnAccounting": p.bool}, {"_interestEarned": p.uint256, "_feesAmount": p.uint256, "_feesShare": p.uint256, "_currentRateInfo": p.struct({"lastBlock": p.uint32, "feeToProtocolRate": p.uint32, "lastTimestamp": p.uint64, "ratePerSec": p.uint64, "fullUtilizationRate": p.uint64}), "_totalAsset": p.struct({"amount": p.uint128, "shares": p.uint128}), "_totalBorrow": p.struct({"amount": p.uint128, "shares": p.uint128})}),
    allowance: viewFun("0xdd62ed3e", "allowance(address,address)", {"owner": p.address, "spender": p.address}, p.uint256),
    approve: fun("0x095ea7b3", "approve(address,uint256)", {"spender": p.address, "amount": p.uint256}, p.bool),
    approveBorrowDelegation: fun("0xf54fd600", "approveBorrowDelegation(address,uint256)", {"_delegatee": p.address, "_amount": p.uint256}, ),
    asset: viewFun("0x38d52e0f", "asset()", {}, p.address),
    balanceOf: viewFun("0x70a08231", "balanceOf(address)", {"account": p.address}, p.uint256),
    borrowAsset: fun("0xe5f13b16", "borrowAsset(uint256,uint256,address)", {"_borrowAmount": p.uint256, "_collateralAmount": p.uint256, "_receiver": p.address}, p.uint256),
    borrowAssetOnBehalfOf: fun("0x27c151dc", "borrowAssetOnBehalfOf(uint256,address)", {"_borrowAmount": p.uint256, "_onBehalfOf": p.address}, p.uint256),
    borrowLimit: viewFun("0xe551d11d", "borrowLimit()", {}, p.uint256),
    changeFee: fun("0x8142dd53", "changeFee(uint32)", {"_newFee": p.uint32}, ),
    circuitBreakerAddress: viewFun("0x49292427", "circuitBreakerAddress()", {}, p.address),
    cleanLiquidationFee: viewFun("0x11a2e4bc", "cleanLiquidationFee()", {}, p.uint256),
    collateralContract: viewFun("0xc6e1c7c9", "collateralContract()", {}, p.address),
    convertToAssets: viewFun("0x07a2d13a", "convertToAssets(uint256)", {"_shares": p.uint256}, p.uint256),
    convertToShares: viewFun("0xc6e6f592", "convertToShares(uint256)", {"_assets": p.uint256}, p.uint256),
    currentRateInfo: viewFun("0x95d14ca8", "currentRateInfo()", {}, {"lastBlock": p.uint32, "feeToProtocolRate": p.uint32, "lastTimestamp": p.uint64, "ratePerSec": p.uint64, "fullUtilizationRate": p.uint64}),
    decimals: viewFun("0x313ce567", "decimals()", {}, p.uint8),
    decreaseAllowance: fun("0xa457c2d7", "decreaseAllowance(address,uint256)", {"spender": p.address, "subtractedValue": p.uint256}, p.bool),
    deposit: fun("0x6e553f65", "deposit(uint256,address)", {"_amount": p.uint256, "_receiver": p.address}, p.uint256),
    depositLimit: viewFun("0xecf70858", "depositLimit()", {}, p.uint256),
    dirtyLiquidationFee: viewFun("0x4732428c", "dirtyLiquidationFee()", {}, p.uint256),
    exchangeRateInfo: viewFun("0xfbbbf94c", "exchangeRateInfo()", {}, {"oracle": p.address, "maxOracleDeviation": p.uint32, "lastTimestamp": p.uint184, "lowExchangeRate": p.uint256, "highExchangeRate": p.uint256}),
    gauge: viewFun("0xa6f19c84", "gauge()", {}, p.address),
    getConstants: viewFun("0x9a295e73", "getConstants()", {}, {"_LTV_PRECISION": p.uint256, "_LIQ_PRECISION": p.uint256, "_UTIL_PREC": p.uint256, "_FEE_PRECISION": p.uint256, "_EXCHANGE_PRECISION": p.uint256, "_DEVIATION_PRECISION": p.uint256, "_RATE_PRECISION": p.uint256, "_MAX_PROTOCOL_FEE": p.uint256}),
    getPairAccounting: viewFun("0xcdd72d52", "getPairAccounting()", {}, {"_totalAssetAmount": p.uint128, "_totalAssetShares": p.uint128, "_totalBorrowAmount": p.uint128, "_totalBorrowShares": p.uint128, "_totalCollateral": p.uint256}),
    getUserSnapshot: viewFun("0xb68d0a09", "getUserSnapshot(address)", {"_address": p.address}, {"_userAssetShares": p.uint256, "_userBorrowShares": p.uint256, "_userCollateralBalance": p.uint256}),
    increaseAllowance: fun("0x39509351", "increaseAllowance(address,uint256)", {"spender": p.address, "addedValue": p.uint256}, p.bool),
    isInterestPaused: viewFun("0xf211c390", "isInterestPaused()", {}, p.bool),
    isLiquidateAccessControlRevoked: viewFun("0x34680fe5", "isLiquidateAccessControlRevoked()", {}, p.bool),
    isLiquidatePaused: viewFun("0xc58e4df6", "isLiquidatePaused()", {}, p.bool),
    isMaxLTVSetterRevoked: viewFun("0xb7db54f5", "isMaxLTVSetterRevoked()", {}, p.bool),
    isRepayAccessControlRevoked: viewFun("0x0c70661d", "isRepayAccessControlRevoked()", {}, p.bool),
    isRepayPaused: viewFun("0x115a334c", "isRepayPaused()", {}, p.bool),
    isWithdrawAccessControlRevoked: viewFun("0xbbb09624", "isWithdrawAccessControlRevoked()", {}, p.bool),
    isWithdrawPaused: viewFun("0x67800b5f", "isWithdrawPaused()", {}, p.bool),
    liquidate: fun("0x721b0a47", "liquidate(uint128,uint256,address)", {"_sharesToLiquidate": p.uint128, "_deadline": p.uint256, "_borrower": p.address}, p.uint256),
    maxDeposit: viewFun("0x402d267d", "maxDeposit(address)", {"_receiver": p.address}, p.uint256),
    maxLTV: viewFun("0xf384bd05", "maxLTV()", {}, p.uint256),
    maxMint: viewFun("0xc63d75b6", "maxMint(address)", {"_receiver": p.address}, p.uint256),
    maxRedeem: viewFun("0xd905777e", "maxRedeem(address)", {"_owner": p.address}, p.uint256),
    maxWithdraw: viewFun("0xce96cb77", "maxWithdraw(address)", {"_owner": p.address}, p.uint256),
    mint: fun("0x94bf804d", "mint(uint256,address)", {"_shares": p.uint256, "_receiver": p.address}, p.uint256),
    name: viewFun("0x06fdde03", "name()", {}, p.string),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    pause: fun("0x8456cb59", "pause()", {}, ),
    pauseBorrow: fun("0xe8596f72", "pauseBorrow()", {}, ),
    pauseDeposit: fun("0x69026e88", "pauseDeposit()", {}, ),
    pauseInterest: fun("0x858f1e68", "pauseInterest(bool)", {"_isPaused": p.bool}, ),
    pauseLiquidate: fun("0x4c18a4fb", "pauseLiquidate(bool)", {"_isPaused": p.bool}, ),
    pauseRepay: fun("0x4b4b418e", "pauseRepay(bool)", {"_isPaused": p.bool}, ),
    pauseWithdraw: fun("0xebd462cb", "pauseWithdraw(bool)", {"_isPaused": p.bool}, ),
    pendingOwner: viewFun("0xe30c3978", "pendingOwner()", {}, p.address),
    pendingTimelockAddress: viewFun("0x090f3f50", "pendingTimelockAddress()", {}, p.address),
    previewAddInterest: viewFun("0xcacf3b58", "previewAddInterest()", {}, {"_interestEarned": p.uint256, "_feesAmount": p.uint256, "_feesShare": p.uint256, "_newCurrentRateInfo": p.struct({"lastBlock": p.uint32, "feeToProtocolRate": p.uint32, "lastTimestamp": p.uint64, "ratePerSec": p.uint64, "fullUtilizationRate": p.uint64}), "_totalAsset": p.struct({"amount": p.uint128, "shares": p.uint128}), "_totalBorrow": p.struct({"amount": p.uint128, "shares": p.uint128})}),
    previewDeposit: viewFun("0xef8b30f7", "previewDeposit(uint256)", {"_assets": p.uint256}, p.uint256),
    previewMint: viewFun("0xb3d7f6b9", "previewMint(uint256)", {"_shares": p.uint256}, p.uint256),
    previewRedeem: viewFun("0x4cdad506", "previewRedeem(uint256)", {"_shares": p.uint256}, p.uint256),
    previewWithdraw: viewFun("0x0a28a477", "previewWithdraw(uint256)", {"_amount": p.uint256}, p.uint256),
    pricePerShare: viewFun("0x99530b06", "pricePerShare()", {}, p.uint256),
    protocolLiquidationFee: viewFun("0xeafecffa", "protocolLiquidationFee()", {}, p.uint256),
    rateContract: viewFun("0xeee24219", "rateContract()", {}, p.address),
    redeem: fun("0xba087652", "redeem(uint256,address,address)", {"_shares": p.uint256, "_receiver": p.address, "_owner": p.address}, p.uint256),
    removeCollateral: fun("0xd41ddc96", "removeCollateral(uint256,address)", {"_collateralAmount": p.uint256, "_receiver": p.address}, ),
    removeCollateralFrom: fun("0x59508a10", "removeCollateralFrom(uint256,address,address)", {"_collateralAmount": p.uint256, "_receiver": p.address, "_borrower": p.address}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    renounceTimelock: fun("0x4f8b4ae7", "renounceTimelock()", {}, ),
    repayAsset: fun("0x3d417d2d", "repayAsset(uint256,address)", {"_shares": p.uint256, "_borrower": p.address}, p.uint256),
    repayAssetWithCollateral: fun("0xca2298fe", "repayAssetWithCollateral(address,uint256,uint256,address[])", {"_swapperAddress": p.address, "_collateralToSwap": p.uint256, "_amountAssetOutMin": p.uint256, "_path": p.array(p.address)}, p.uint256),
    revokeLiquidateAccessControl: fun("0x7ecefa6e", "revokeLiquidateAccessControl()", {}, ),
    revokeMaxLTVSetter: fun("0x39030864", "revokeMaxLTVSetter()", {}, ),
    revokeRepayAccessControl: fun("0x4c417995", "revokeRepayAccessControl()", {}, ),
    revokeWithdrawAccessControl: fun("0x0475260e", "revokeWithdrawAccessControl()", {}, ),
    setBorrowLimit: fun("0xe7a33174", "setBorrowLimit(uint256)", {"_limit": p.uint256}, ),
    setCircuitBreaker: fun("0x82beee89", "setCircuitBreaker(address)", {"_newCircuitBreaker": p.address}, ),
    setDepositLimit: fun("0xbdc8144b", "setDepositLimit(uint256)", {"_limit": p.uint256}, ),
    setGauge: fun("0x55a68ed3", "setGauge(address)", {"_gauge": p.address}, ),
    setLiquidationFees: fun("0x1bc23cf9", "setLiquidationFees(uint256,uint256,uint256)", {"_newCleanLiquidationFee": p.uint256, "_newDirtyLiquidationFee": p.uint256, "_newProtocolLiquidationFee": p.uint256}, ),
    setMaxLTV: fun("0x08a0c375", "setMaxLTV(uint256)", {"_newMaxLTV": p.uint256}, ),
    setOracle: fun("0x8f791f8b", "setOracle(address,uint32)", {"_newOracle": p.address, "_newMaxOracleDeviation": p.uint32}, ),
    setRateContract: fun("0x6b96668f", "setRateContract(address)", {"_newRateContract": p.address}, ),
    setSwapper: fun("0x3f2617cb", "setSwapper(address,bool)", {"_swapper": p.address, "_approval": p.bool}, ),
    setWhitelistedDelegators: fun("0xe86242a8", "setWhitelistedDelegators(address,bool)", {"_delegator": p.address, "_enabled": p.bool}, ),
    swappers: viewFun("0x8cad7fbe", "swappers(address)", {"_0": p.address}, p.bool),
    symbol: viewFun("0x95d89b41", "symbol()", {}, p.string),
    timelockAddress: viewFun("0x4bc66f32", "timelockAddress()", {}, p.address),
    toAssetAmount: viewFun("0x7d37bdd7", "toAssetAmount(uint256,bool,bool)", {"_shares": p.uint256, "_roundUp": p.bool, "_previewInterest": p.bool}, p.uint256),
    toAssetShares: viewFun("0x1c2591d3", "toAssetShares(uint256,bool,bool)", {"_amount": p.uint256, "_roundUp": p.bool, "_previewInterest": p.bool}, p.uint256),
    toBorrowAmount: viewFun("0x7ec4b571", "toBorrowAmount(uint256,bool,bool)", {"_shares": p.uint256, "_roundUp": p.bool, "_previewInterest": p.bool}, p.uint256),
    toBorrowShares: viewFun("0x93f46f64", "toBorrowShares(uint256,bool,bool)", {"_amount": p.uint256, "_roundUp": p.bool, "_previewInterest": p.bool}, p.uint256),
    totalAsset: viewFun("0xf9557ccb", "totalAsset()", {}, {"amount": p.uint128, "shares": p.uint128}),
    totalAssets: viewFun("0x01e1d114", "totalAssets()", {}, p.uint256),
    totalBorrow: viewFun("0x8285ef40", "totalBorrow()", {}, {"amount": p.uint128, "shares": p.uint128}),
    totalCollateral: viewFun("0x4ac8eb5f", "totalCollateral()", {}, p.uint256),
    totalSupply: viewFun("0x18160ddd", "totalSupply()", {}, p.uint256),
    transfer: fun("0xa9059cbb", "transfer(address,uint256)", {"to": p.address, "amount": p.uint256}, p.bool),
    transferFrom: fun("0x23b872dd", "transferFrom(address,address,uint256)", {"from": p.address, "to": p.address, "amount": p.uint256}, p.bool),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    transferTimelock: fun("0x45014095", "transferTimelock(address)", {"_newTimelock": p.address}, ),
    unpause: fun("0x3f4ba83a", "unpause()", {}, ),
    updateExchangeRate: fun("0x02ce728f", "updateExchangeRate()", {}, {"_isBorrowAllowed": p.bool, "_lowExchangeRate": p.uint256, "_highExchangeRate": p.uint256}),
    userBorrowAllowances: viewFun("0x3e9139be", "userBorrowAllowances(address,address)", {"_0": p.address, "_1": p.address}, p.uint256),
    userBorrowShares: viewFun("0x4fd422df", "userBorrowShares(address)", {"_0": p.address}, p.uint256),
    userCollateralBalance: viewFun("0xb5af3062", "userCollateralBalance(address)", {"_0": p.address}, p.uint256),
    version: viewFun("0x54fd4d50", "version()", {}, {"_major": p.uint256, "_minor": p.uint256, "_patch": p.uint256}),
    whitelistedDelegators: viewFun("0x4cefcccb", "whitelistedDelegators(address)", {"_0": p.address}, p.bool),
    withdraw: fun("0xb460af94", "withdraw(uint256,address,address)", {"_amount": p.uint256, "_receiver": p.address, "_owner": p.address}, p.uint256),
    withdrawFees: fun("0xdaf33f2a", "withdrawFees(uint128,address)", {"_shares": p.uint128, "_recipient": p.address}, p.uint256),
}

export class Contract extends ContractBase {

    DEPLOYER_ADDRESS() {
        return this.eth_call(functions.DEPLOYER_ADDRESS, {})
    }

    allowance(owner: AllowanceParams["owner"], spender: AllowanceParams["spender"]) {
        return this.eth_call(functions.allowance, {owner, spender})
    }

    asset() {
        return this.eth_call(functions.asset, {})
    }

    balanceOf(account: BalanceOfParams["account"]) {
        return this.eth_call(functions.balanceOf, {account})
    }

    borrowLimit() {
        return this.eth_call(functions.borrowLimit, {})
    }

    circuitBreakerAddress() {
        return this.eth_call(functions.circuitBreakerAddress, {})
    }

    cleanLiquidationFee() {
        return this.eth_call(functions.cleanLiquidationFee, {})
    }

    collateralContract() {
        return this.eth_call(functions.collateralContract, {})
    }

    convertToAssets(_shares: ConvertToAssetsParams["_shares"]) {
        return this.eth_call(functions.convertToAssets, {_shares})
    }

    convertToShares(_assets: ConvertToSharesParams["_assets"]) {
        return this.eth_call(functions.convertToShares, {_assets})
    }

    currentRateInfo() {
        return this.eth_call(functions.currentRateInfo, {})
    }

    decimals() {
        return this.eth_call(functions.decimals, {})
    }

    depositLimit() {
        return this.eth_call(functions.depositLimit, {})
    }

    dirtyLiquidationFee() {
        return this.eth_call(functions.dirtyLiquidationFee, {})
    }

    exchangeRateInfo() {
        return this.eth_call(functions.exchangeRateInfo, {})
    }

    gauge() {
        return this.eth_call(functions.gauge, {})
    }

    getConstants() {
        return this.eth_call(functions.getConstants, {})
    }

    getPairAccounting() {
        return this.eth_call(functions.getPairAccounting, {})
    }

    getUserSnapshot(_address: GetUserSnapshotParams["_address"]) {
        return this.eth_call(functions.getUserSnapshot, {_address})
    }

    isInterestPaused() {
        return this.eth_call(functions.isInterestPaused, {})
    }

    isLiquidateAccessControlRevoked() {
        return this.eth_call(functions.isLiquidateAccessControlRevoked, {})
    }

    isLiquidatePaused() {
        return this.eth_call(functions.isLiquidatePaused, {})
    }

    isMaxLTVSetterRevoked() {
        return this.eth_call(functions.isMaxLTVSetterRevoked, {})
    }

    isRepayAccessControlRevoked() {
        return this.eth_call(functions.isRepayAccessControlRevoked, {})
    }

    isRepayPaused() {
        return this.eth_call(functions.isRepayPaused, {})
    }

    isWithdrawAccessControlRevoked() {
        return this.eth_call(functions.isWithdrawAccessControlRevoked, {})
    }

    isWithdrawPaused() {
        return this.eth_call(functions.isWithdrawPaused, {})
    }

    maxDeposit(_receiver: MaxDepositParams["_receiver"]) {
        return this.eth_call(functions.maxDeposit, {_receiver})
    }

    maxLTV() {
        return this.eth_call(functions.maxLTV, {})
    }

    maxMint(_receiver: MaxMintParams["_receiver"]) {
        return this.eth_call(functions.maxMint, {_receiver})
    }

    maxRedeem(_owner: MaxRedeemParams["_owner"]) {
        return this.eth_call(functions.maxRedeem, {_owner})
    }

    maxWithdraw(_owner: MaxWithdrawParams["_owner"]) {
        return this.eth_call(functions.maxWithdraw, {_owner})
    }

    name() {
        return this.eth_call(functions.name, {})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    pendingOwner() {
        return this.eth_call(functions.pendingOwner, {})
    }

    pendingTimelockAddress() {
        return this.eth_call(functions.pendingTimelockAddress, {})
    }

    previewAddInterest() {
        return this.eth_call(functions.previewAddInterest, {})
    }

    previewDeposit(_assets: PreviewDepositParams["_assets"]) {
        return this.eth_call(functions.previewDeposit, {_assets})
    }

    previewMint(_shares: PreviewMintParams["_shares"]) {
        return this.eth_call(functions.previewMint, {_shares})
    }

    previewRedeem(_shares: PreviewRedeemParams["_shares"]) {
        return this.eth_call(functions.previewRedeem, {_shares})
    }

    previewWithdraw(_amount: PreviewWithdrawParams["_amount"]) {
        return this.eth_call(functions.previewWithdraw, {_amount})
    }

    pricePerShare() {
        return this.eth_call(functions.pricePerShare, {})
    }

    protocolLiquidationFee() {
        return this.eth_call(functions.protocolLiquidationFee, {})
    }

    rateContract() {
        return this.eth_call(functions.rateContract, {})
    }

    swappers(_0: SwappersParams["_0"]) {
        return this.eth_call(functions.swappers, {_0})
    }

    symbol() {
        return this.eth_call(functions.symbol, {})
    }

    timelockAddress() {
        return this.eth_call(functions.timelockAddress, {})
    }

    toAssetAmount(_shares: ToAssetAmountParams["_shares"], _roundUp: ToAssetAmountParams["_roundUp"], _previewInterest: ToAssetAmountParams["_previewInterest"]) {
        return this.eth_call(functions.toAssetAmount, {_shares, _roundUp, _previewInterest})
    }

    toAssetShares(_amount: ToAssetSharesParams["_amount"], _roundUp: ToAssetSharesParams["_roundUp"], _previewInterest: ToAssetSharesParams["_previewInterest"]) {
        return this.eth_call(functions.toAssetShares, {_amount, _roundUp, _previewInterest})
    }

    toBorrowAmount(_shares: ToBorrowAmountParams["_shares"], _roundUp: ToBorrowAmountParams["_roundUp"], _previewInterest: ToBorrowAmountParams["_previewInterest"]) {
        return this.eth_call(functions.toBorrowAmount, {_shares, _roundUp, _previewInterest})
    }

    toBorrowShares(_amount: ToBorrowSharesParams["_amount"], _roundUp: ToBorrowSharesParams["_roundUp"], _previewInterest: ToBorrowSharesParams["_previewInterest"]) {
        return this.eth_call(functions.toBorrowShares, {_amount, _roundUp, _previewInterest})
    }

    totalAsset() {
        return this.eth_call(functions.totalAsset, {})
    }

    totalAssets() {
        return this.eth_call(functions.totalAssets, {})
    }

    totalBorrow() {
        return this.eth_call(functions.totalBorrow, {})
    }

    totalCollateral() {
        return this.eth_call(functions.totalCollateral, {})
    }

    totalSupply() {
        return this.eth_call(functions.totalSupply, {})
    }

    userBorrowAllowances(_0: UserBorrowAllowancesParams["_0"], _1: UserBorrowAllowancesParams["_1"]) {
        return this.eth_call(functions.userBorrowAllowances, {_0, _1})
    }

    userBorrowShares(_0: UserBorrowSharesParams["_0"]) {
        return this.eth_call(functions.userBorrowShares, {_0})
    }

    userCollateralBalance(_0: UserCollateralBalanceParams["_0"]) {
        return this.eth_call(functions.userCollateralBalance, {_0})
    }

    version() {
        return this.eth_call(functions.version, {})
    }

    whitelistedDelegators(_0: WhitelistedDelegatorsParams["_0"]) {
        return this.eth_call(functions.whitelistedDelegators, {_0})
    }
}

/// Event types
export type AddCollateralEventArgs = EParams<typeof events.AddCollateral>
export type AddInterestEventArgs = EParams<typeof events.AddInterest>
export type ApprovalEventArgs = EParams<typeof events.Approval>
export type BorrowAssetEventArgs = EParams<typeof events.BorrowAsset>
export type ChangeFeeEventArgs = EParams<typeof events.ChangeFee>
export type DepositEventArgs = EParams<typeof events.Deposit>
export type LiquidateEventArgs = EParams<typeof events.Liquidate>
export type OwnershipTransferStartedEventArgs = EParams<typeof events.OwnershipTransferStarted>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PauseInterestEventArgs = EParams<typeof events.PauseInterest>
export type PauseLiquidateEventArgs = EParams<typeof events.PauseLiquidate>
export type PauseRepayEventArgs = EParams<typeof events.PauseRepay>
export type PauseWithdrawEventArgs = EParams<typeof events.PauseWithdraw>
export type RemoveCollateralEventArgs = EParams<typeof events.RemoveCollateral>
export type RepayAssetEventArgs = EParams<typeof events.RepayAsset>
export type RepayAssetWithCollateralEventArgs = EParams<typeof events.RepayAssetWithCollateral>
export type RevokeLiquidateAccessControlEventArgs = EParams<typeof events.RevokeLiquidateAccessControl>
export type RevokeMaxLTVSetterEventArgs = EParams<typeof events.RevokeMaxLTVSetter>
export type RevokeRepayAccessControlEventArgs = EParams<typeof events.RevokeRepayAccessControl>
export type RevokeWithdrawAccessControlEventArgs = EParams<typeof events.RevokeWithdrawAccessControl>
export type SetBorrowLimitEventArgs = EParams<typeof events.SetBorrowLimit>
export type SetCircuitBreakerEventArgs = EParams<typeof events.SetCircuitBreaker>
export type SetDepositLimitEventArgs = EParams<typeof events.SetDepositLimit>
export type SetGaugeEventArgs = EParams<typeof events.SetGauge>
export type SetLiquidationFeesEventArgs = EParams<typeof events.SetLiquidationFees>
export type SetMaxLTVEventArgs = EParams<typeof events.SetMaxLTV>
export type SetOracleInfoEventArgs = EParams<typeof events.SetOracleInfo>
export type SetRateContractEventArgs = EParams<typeof events.SetRateContract>
export type SetSwapperEventArgs = EParams<typeof events.SetSwapper>
export type SetWhitelistedDelegatorsEventArgs = EParams<typeof events.SetWhitelistedDelegators>
export type TimelockTransferStartedEventArgs = EParams<typeof events.TimelockTransferStarted>
export type TimelockTransferredEventArgs = EParams<typeof events.TimelockTransferred>
export type TransferEventArgs = EParams<typeof events.Transfer>
export type UpdateExchangeRateEventArgs = EParams<typeof events.UpdateExchangeRate>
export type UpdateRateEventArgs = EParams<typeof events.UpdateRate>
export type UserBorrowAllowanceDelegatedEventArgs = EParams<typeof events.UserBorrowAllowanceDelegated>
export type WarnOracleDataEventArgs = EParams<typeof events.WarnOracleData>
export type WithdrawEventArgs = EParams<typeof events.Withdraw>
export type WithdrawFeesEventArgs = EParams<typeof events.WithdrawFees>

/// Function types
export type DEPLOYER_ADDRESSParams = FunctionArguments<typeof functions.DEPLOYER_ADDRESS>
export type DEPLOYER_ADDRESSReturn = FunctionReturn<typeof functions.DEPLOYER_ADDRESS>

export type AcceptOwnershipParams = FunctionArguments<typeof functions.acceptOwnership>
export type AcceptOwnershipReturn = FunctionReturn<typeof functions.acceptOwnership>

export type AcceptTransferTimelockParams = FunctionArguments<typeof functions.acceptTransferTimelock>
export type AcceptTransferTimelockReturn = FunctionReturn<typeof functions.acceptTransferTimelock>

export type AddCollateralParams = FunctionArguments<typeof functions.addCollateral>
export type AddCollateralReturn = FunctionReturn<typeof functions.addCollateral>

export type AddInterestParams = FunctionArguments<typeof functions.addInterest>
export type AddInterestReturn = FunctionReturn<typeof functions.addInterest>

export type AllowanceParams = FunctionArguments<typeof functions.allowance>
export type AllowanceReturn = FunctionReturn<typeof functions.allowance>

export type ApproveParams = FunctionArguments<typeof functions.approve>
export type ApproveReturn = FunctionReturn<typeof functions.approve>

export type ApproveBorrowDelegationParams = FunctionArguments<typeof functions.approveBorrowDelegation>
export type ApproveBorrowDelegationReturn = FunctionReturn<typeof functions.approveBorrowDelegation>

export type AssetParams = FunctionArguments<typeof functions.asset>
export type AssetReturn = FunctionReturn<typeof functions.asset>

export type BalanceOfParams = FunctionArguments<typeof functions.balanceOf>
export type BalanceOfReturn = FunctionReturn<typeof functions.balanceOf>

export type BorrowAssetParams = FunctionArguments<typeof functions.borrowAsset>
export type BorrowAssetReturn = FunctionReturn<typeof functions.borrowAsset>

export type BorrowAssetOnBehalfOfParams = FunctionArguments<typeof functions.borrowAssetOnBehalfOf>
export type BorrowAssetOnBehalfOfReturn = FunctionReturn<typeof functions.borrowAssetOnBehalfOf>

export type BorrowLimitParams = FunctionArguments<typeof functions.borrowLimit>
export type BorrowLimitReturn = FunctionReturn<typeof functions.borrowLimit>

export type ChangeFeeParams = FunctionArguments<typeof functions.changeFee>
export type ChangeFeeReturn = FunctionReturn<typeof functions.changeFee>

export type CircuitBreakerAddressParams = FunctionArguments<typeof functions.circuitBreakerAddress>
export type CircuitBreakerAddressReturn = FunctionReturn<typeof functions.circuitBreakerAddress>

export type CleanLiquidationFeeParams = FunctionArguments<typeof functions.cleanLiquidationFee>
export type CleanLiquidationFeeReturn = FunctionReturn<typeof functions.cleanLiquidationFee>

export type CollateralContractParams = FunctionArguments<typeof functions.collateralContract>
export type CollateralContractReturn = FunctionReturn<typeof functions.collateralContract>

export type ConvertToAssetsParams = FunctionArguments<typeof functions.convertToAssets>
export type ConvertToAssetsReturn = FunctionReturn<typeof functions.convertToAssets>

export type ConvertToSharesParams = FunctionArguments<typeof functions.convertToShares>
export type ConvertToSharesReturn = FunctionReturn<typeof functions.convertToShares>

export type CurrentRateInfoParams = FunctionArguments<typeof functions.currentRateInfo>
export type CurrentRateInfoReturn = FunctionReturn<typeof functions.currentRateInfo>

export type DecimalsParams = FunctionArguments<typeof functions.decimals>
export type DecimalsReturn = FunctionReturn<typeof functions.decimals>

export type DecreaseAllowanceParams = FunctionArguments<typeof functions.decreaseAllowance>
export type DecreaseAllowanceReturn = FunctionReturn<typeof functions.decreaseAllowance>

export type DepositParams = FunctionArguments<typeof functions.deposit>
export type DepositReturn = FunctionReturn<typeof functions.deposit>

export type DepositLimitParams = FunctionArguments<typeof functions.depositLimit>
export type DepositLimitReturn = FunctionReturn<typeof functions.depositLimit>

export type DirtyLiquidationFeeParams = FunctionArguments<typeof functions.dirtyLiquidationFee>
export type DirtyLiquidationFeeReturn = FunctionReturn<typeof functions.dirtyLiquidationFee>

export type ExchangeRateInfoParams = FunctionArguments<typeof functions.exchangeRateInfo>
export type ExchangeRateInfoReturn = FunctionReturn<typeof functions.exchangeRateInfo>

export type GaugeParams = FunctionArguments<typeof functions.gauge>
export type GaugeReturn = FunctionReturn<typeof functions.gauge>

export type GetConstantsParams = FunctionArguments<typeof functions.getConstants>
export type GetConstantsReturn = FunctionReturn<typeof functions.getConstants>

export type GetPairAccountingParams = FunctionArguments<typeof functions.getPairAccounting>
export type GetPairAccountingReturn = FunctionReturn<typeof functions.getPairAccounting>

export type GetUserSnapshotParams = FunctionArguments<typeof functions.getUserSnapshot>
export type GetUserSnapshotReturn = FunctionReturn<typeof functions.getUserSnapshot>

export type IncreaseAllowanceParams = FunctionArguments<typeof functions.increaseAllowance>
export type IncreaseAllowanceReturn = FunctionReturn<typeof functions.increaseAllowance>

export type IsInterestPausedParams = FunctionArguments<typeof functions.isInterestPaused>
export type IsInterestPausedReturn = FunctionReturn<typeof functions.isInterestPaused>

export type IsLiquidateAccessControlRevokedParams = FunctionArguments<typeof functions.isLiquidateAccessControlRevoked>
export type IsLiquidateAccessControlRevokedReturn = FunctionReturn<typeof functions.isLiquidateAccessControlRevoked>

export type IsLiquidatePausedParams = FunctionArguments<typeof functions.isLiquidatePaused>
export type IsLiquidatePausedReturn = FunctionReturn<typeof functions.isLiquidatePaused>

export type IsMaxLTVSetterRevokedParams = FunctionArguments<typeof functions.isMaxLTVSetterRevoked>
export type IsMaxLTVSetterRevokedReturn = FunctionReturn<typeof functions.isMaxLTVSetterRevoked>

export type IsRepayAccessControlRevokedParams = FunctionArguments<typeof functions.isRepayAccessControlRevoked>
export type IsRepayAccessControlRevokedReturn = FunctionReturn<typeof functions.isRepayAccessControlRevoked>

export type IsRepayPausedParams = FunctionArguments<typeof functions.isRepayPaused>
export type IsRepayPausedReturn = FunctionReturn<typeof functions.isRepayPaused>

export type IsWithdrawAccessControlRevokedParams = FunctionArguments<typeof functions.isWithdrawAccessControlRevoked>
export type IsWithdrawAccessControlRevokedReturn = FunctionReturn<typeof functions.isWithdrawAccessControlRevoked>

export type IsWithdrawPausedParams = FunctionArguments<typeof functions.isWithdrawPaused>
export type IsWithdrawPausedReturn = FunctionReturn<typeof functions.isWithdrawPaused>

export type LiquidateParams = FunctionArguments<typeof functions.liquidate>
export type LiquidateReturn = FunctionReturn<typeof functions.liquidate>

export type MaxDepositParams = FunctionArguments<typeof functions.maxDeposit>
export type MaxDepositReturn = FunctionReturn<typeof functions.maxDeposit>

export type MaxLTVParams = FunctionArguments<typeof functions.maxLTV>
export type MaxLTVReturn = FunctionReturn<typeof functions.maxLTV>

export type MaxMintParams = FunctionArguments<typeof functions.maxMint>
export type MaxMintReturn = FunctionReturn<typeof functions.maxMint>

export type MaxRedeemParams = FunctionArguments<typeof functions.maxRedeem>
export type MaxRedeemReturn = FunctionReturn<typeof functions.maxRedeem>

export type MaxWithdrawParams = FunctionArguments<typeof functions.maxWithdraw>
export type MaxWithdrawReturn = FunctionReturn<typeof functions.maxWithdraw>

export type MintParams = FunctionArguments<typeof functions.mint>
export type MintReturn = FunctionReturn<typeof functions.mint>

export type NameParams = FunctionArguments<typeof functions.name>
export type NameReturn = FunctionReturn<typeof functions.name>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PauseParams = FunctionArguments<typeof functions.pause>
export type PauseReturn = FunctionReturn<typeof functions.pause>

export type PauseBorrowParams = FunctionArguments<typeof functions.pauseBorrow>
export type PauseBorrowReturn = FunctionReturn<typeof functions.pauseBorrow>

export type PauseDepositParams = FunctionArguments<typeof functions.pauseDeposit>
export type PauseDepositReturn = FunctionReturn<typeof functions.pauseDeposit>

export type PauseInterestParams = FunctionArguments<typeof functions.pauseInterest>
export type PauseInterestReturn = FunctionReturn<typeof functions.pauseInterest>

export type PauseLiquidateParams = FunctionArguments<typeof functions.pauseLiquidate>
export type PauseLiquidateReturn = FunctionReturn<typeof functions.pauseLiquidate>

export type PauseRepayParams = FunctionArguments<typeof functions.pauseRepay>
export type PauseRepayReturn = FunctionReturn<typeof functions.pauseRepay>

export type PauseWithdrawParams = FunctionArguments<typeof functions.pauseWithdraw>
export type PauseWithdrawReturn = FunctionReturn<typeof functions.pauseWithdraw>

export type PendingOwnerParams = FunctionArguments<typeof functions.pendingOwner>
export type PendingOwnerReturn = FunctionReturn<typeof functions.pendingOwner>

export type PendingTimelockAddressParams = FunctionArguments<typeof functions.pendingTimelockAddress>
export type PendingTimelockAddressReturn = FunctionReturn<typeof functions.pendingTimelockAddress>

export type PreviewAddInterestParams = FunctionArguments<typeof functions.previewAddInterest>
export type PreviewAddInterestReturn = FunctionReturn<typeof functions.previewAddInterest>

export type PreviewDepositParams = FunctionArguments<typeof functions.previewDeposit>
export type PreviewDepositReturn = FunctionReturn<typeof functions.previewDeposit>

export type PreviewMintParams = FunctionArguments<typeof functions.previewMint>
export type PreviewMintReturn = FunctionReturn<typeof functions.previewMint>

export type PreviewRedeemParams = FunctionArguments<typeof functions.previewRedeem>
export type PreviewRedeemReturn = FunctionReturn<typeof functions.previewRedeem>

export type PreviewWithdrawParams = FunctionArguments<typeof functions.previewWithdraw>
export type PreviewWithdrawReturn = FunctionReturn<typeof functions.previewWithdraw>

export type PricePerShareParams = FunctionArguments<typeof functions.pricePerShare>
export type PricePerShareReturn = FunctionReturn<typeof functions.pricePerShare>

export type ProtocolLiquidationFeeParams = FunctionArguments<typeof functions.protocolLiquidationFee>
export type ProtocolLiquidationFeeReturn = FunctionReturn<typeof functions.protocolLiquidationFee>

export type RateContractParams = FunctionArguments<typeof functions.rateContract>
export type RateContractReturn = FunctionReturn<typeof functions.rateContract>

export type RedeemParams = FunctionArguments<typeof functions.redeem>
export type RedeemReturn = FunctionReturn<typeof functions.redeem>

export type RemoveCollateralParams = FunctionArguments<typeof functions.removeCollateral>
export type RemoveCollateralReturn = FunctionReturn<typeof functions.removeCollateral>

export type RemoveCollateralFromParams = FunctionArguments<typeof functions.removeCollateralFrom>
export type RemoveCollateralFromReturn = FunctionReturn<typeof functions.removeCollateralFrom>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type RenounceTimelockParams = FunctionArguments<typeof functions.renounceTimelock>
export type RenounceTimelockReturn = FunctionReturn<typeof functions.renounceTimelock>

export type RepayAssetParams = FunctionArguments<typeof functions.repayAsset>
export type RepayAssetReturn = FunctionReturn<typeof functions.repayAsset>

export type RepayAssetWithCollateralParams = FunctionArguments<typeof functions.repayAssetWithCollateral>
export type RepayAssetWithCollateralReturn = FunctionReturn<typeof functions.repayAssetWithCollateral>

export type RevokeLiquidateAccessControlParams = FunctionArguments<typeof functions.revokeLiquidateAccessControl>
export type RevokeLiquidateAccessControlReturn = FunctionReturn<typeof functions.revokeLiquidateAccessControl>

export type RevokeMaxLTVSetterParams = FunctionArguments<typeof functions.revokeMaxLTVSetter>
export type RevokeMaxLTVSetterReturn = FunctionReturn<typeof functions.revokeMaxLTVSetter>

export type RevokeRepayAccessControlParams = FunctionArguments<typeof functions.revokeRepayAccessControl>
export type RevokeRepayAccessControlReturn = FunctionReturn<typeof functions.revokeRepayAccessControl>

export type RevokeWithdrawAccessControlParams = FunctionArguments<typeof functions.revokeWithdrawAccessControl>
export type RevokeWithdrawAccessControlReturn = FunctionReturn<typeof functions.revokeWithdrawAccessControl>

export type SetBorrowLimitParams = FunctionArguments<typeof functions.setBorrowLimit>
export type SetBorrowLimitReturn = FunctionReturn<typeof functions.setBorrowLimit>

export type SetCircuitBreakerParams = FunctionArguments<typeof functions.setCircuitBreaker>
export type SetCircuitBreakerReturn = FunctionReturn<typeof functions.setCircuitBreaker>

export type SetDepositLimitParams = FunctionArguments<typeof functions.setDepositLimit>
export type SetDepositLimitReturn = FunctionReturn<typeof functions.setDepositLimit>

export type SetGaugeParams = FunctionArguments<typeof functions.setGauge>
export type SetGaugeReturn = FunctionReturn<typeof functions.setGauge>

export type SetLiquidationFeesParams = FunctionArguments<typeof functions.setLiquidationFees>
export type SetLiquidationFeesReturn = FunctionReturn<typeof functions.setLiquidationFees>

export type SetMaxLTVParams = FunctionArguments<typeof functions.setMaxLTV>
export type SetMaxLTVReturn = FunctionReturn<typeof functions.setMaxLTV>

export type SetOracleParams = FunctionArguments<typeof functions.setOracle>
export type SetOracleReturn = FunctionReturn<typeof functions.setOracle>

export type SetRateContractParams = FunctionArguments<typeof functions.setRateContract>
export type SetRateContractReturn = FunctionReturn<typeof functions.setRateContract>

export type SetSwapperParams = FunctionArguments<typeof functions.setSwapper>
export type SetSwapperReturn = FunctionReturn<typeof functions.setSwapper>

export type SetWhitelistedDelegatorsParams = FunctionArguments<typeof functions.setWhitelistedDelegators>
export type SetWhitelistedDelegatorsReturn = FunctionReturn<typeof functions.setWhitelistedDelegators>

export type SwappersParams = FunctionArguments<typeof functions.swappers>
export type SwappersReturn = FunctionReturn<typeof functions.swappers>

export type SymbolParams = FunctionArguments<typeof functions.symbol>
export type SymbolReturn = FunctionReturn<typeof functions.symbol>

export type TimelockAddressParams = FunctionArguments<typeof functions.timelockAddress>
export type TimelockAddressReturn = FunctionReturn<typeof functions.timelockAddress>

export type ToAssetAmountParams = FunctionArguments<typeof functions.toAssetAmount>
export type ToAssetAmountReturn = FunctionReturn<typeof functions.toAssetAmount>

export type ToAssetSharesParams = FunctionArguments<typeof functions.toAssetShares>
export type ToAssetSharesReturn = FunctionReturn<typeof functions.toAssetShares>

export type ToBorrowAmountParams = FunctionArguments<typeof functions.toBorrowAmount>
export type ToBorrowAmountReturn = FunctionReturn<typeof functions.toBorrowAmount>

export type ToBorrowSharesParams = FunctionArguments<typeof functions.toBorrowShares>
export type ToBorrowSharesReturn = FunctionReturn<typeof functions.toBorrowShares>

export type TotalAssetParams = FunctionArguments<typeof functions.totalAsset>
export type TotalAssetReturn = FunctionReturn<typeof functions.totalAsset>

export type TotalAssetsParams = FunctionArguments<typeof functions.totalAssets>
export type TotalAssetsReturn = FunctionReturn<typeof functions.totalAssets>

export type TotalBorrowParams = FunctionArguments<typeof functions.totalBorrow>
export type TotalBorrowReturn = FunctionReturn<typeof functions.totalBorrow>

export type TotalCollateralParams = FunctionArguments<typeof functions.totalCollateral>
export type TotalCollateralReturn = FunctionReturn<typeof functions.totalCollateral>

export type TotalSupplyParams = FunctionArguments<typeof functions.totalSupply>
export type TotalSupplyReturn = FunctionReturn<typeof functions.totalSupply>

export type TransferParams = FunctionArguments<typeof functions.transfer>
export type TransferReturn = FunctionReturn<typeof functions.transfer>

export type TransferFromParams = FunctionArguments<typeof functions.transferFrom>
export type TransferFromReturn = FunctionReturn<typeof functions.transferFrom>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type TransferTimelockParams = FunctionArguments<typeof functions.transferTimelock>
export type TransferTimelockReturn = FunctionReturn<typeof functions.transferTimelock>

export type UnpauseParams = FunctionArguments<typeof functions.unpause>
export type UnpauseReturn = FunctionReturn<typeof functions.unpause>

export type UpdateExchangeRateParams = FunctionArguments<typeof functions.updateExchangeRate>
export type UpdateExchangeRateReturn = FunctionReturn<typeof functions.updateExchangeRate>

export type UserBorrowAllowancesParams = FunctionArguments<typeof functions.userBorrowAllowances>
export type UserBorrowAllowancesReturn = FunctionReturn<typeof functions.userBorrowAllowances>

export type UserBorrowSharesParams = FunctionArguments<typeof functions.userBorrowShares>
export type UserBorrowSharesReturn = FunctionReturn<typeof functions.userBorrowShares>

export type UserCollateralBalanceParams = FunctionArguments<typeof functions.userCollateralBalance>
export type UserCollateralBalanceReturn = FunctionReturn<typeof functions.userCollateralBalance>

export type VersionParams = FunctionArguments<typeof functions.version>
export type VersionReturn = FunctionReturn<typeof functions.version>

export type WhitelistedDelegatorsParams = FunctionArguments<typeof functions.whitelistedDelegators>
export type WhitelistedDelegatorsReturn = FunctionReturn<typeof functions.whitelistedDelegators>

export type WithdrawParams = FunctionArguments<typeof functions.withdraw>
export type WithdrawReturn = FunctionReturn<typeof functions.withdraw>

export type WithdrawFeesParams = FunctionArguments<typeof functions.withdrawFees>
export type WithdrawFeesReturn = FunctionReturn<typeof functions.withdrawFees>

