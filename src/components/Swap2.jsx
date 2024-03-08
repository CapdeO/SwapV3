import React, { useState, useEffect } from "react";
import { Input, Popover, Radio, Modal, message } from "antd";
import {
    ArrowDownOutlined,
    DownOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import tokenList from "../utils/tokenList.json";
import axios from "axios";
import {
    useAccount,
    useConnect,
    useWriteContract,
    useReadContract,
    useSendTransaction,
    useWaitForTransactionReceipt,
    useSignTypedData
} from "wagmi";
import { ethers, BigNumber, utils } from 'ethers';
import abiSwap from '../utils/abiSwap.json'
import {
    PERMIT2_ADDRESS,
    AllowanceTransfer,
    AllowanceProvider
} from '@uniswap/permit2-sdk'
import { AlphaRouter, SwapType } from '@uniswap/smart-order-router'
import { CurrencyAmount, TradeType, Percent } from '@uniswap/sdk-core'
import erc20Abi from '../utils/ERC20.json'
import { Token } from '@uniswap/sdk-core'
import { injected } from 'wagmi/connectors'
import { useEthersProvider, useEthersSigner } from "../utils/ethers.ts";
import cresioLogo from '../assets/Capa 2.png'
import Alert from './Alert.jsx'

function Swap2() {
    const { address: account, isConnected } = useAccount();
    const ethersProvider = useEthersProvider()
    const signer = useEthersSigner()
    const { connect } = useConnect()
    const { data: hash, error: approveError, writeContract, isPending } = useWriteContract()
    const { isLoading: isLoadingApprove, isSuccess: isSuccessApprove } = useWaitForTransactionReceipt({ hash })
    const [messageApi, contextHolder] = message.useMessage();
    const [slippage, setSlippage] = useState(2.5);
    const [tokenOneAmount, setTokenOneAmount] = useState(null);
    const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
    const [tokenOne, setTokenOne] = useState(tokenList[0]);
    const [tokenTwo, setTokenTwo] = useState(tokenList[2]);
    const [isOpen, setIsOpen] = useState(false);
    const [changeToken, setChangeToken] = useState(1);
    const [prices, setPrices] = useState(null);
    const [priceToken, setPriceToken] = useState(0)
    const [txDetails, setTxDetails] = useState({
        to: null,
        data: null,
        value: null,
    })
    const [error, setError] = useState("")
    const [approvalDone, setApprovalDone] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [alertText, setAlertText] = useState('Alert Text')

    const { data: userBalance } = useReadContract({
        address: tokenOne.address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account]
    })

    function changeAmount(e) {
        setTokenOneAmount(e.target.value);
        if (e.target.value && prices) {
            setTokenTwoAmount((e.target.value * prices.ratio).toFixed(2))
        } else {
            setTokenTwoAmount(null);
        }
    }

    function switchTokens() {
        setPrices(null);
        setTokenOneAmount(null);
        setTokenTwoAmount(null);
        const one = tokenOne;
        const two = tokenTwo;
        setTokenOne(two);
        setTokenTwo(one);
        fetchPrices(two.address, one.address);
    }

    function openModal(asset) {
        setChangeToken(asset);
        setIsOpen(true);
    }

    function modifyToken(i) {
        setPrices(null);
        setTokenOneAmount(null);
        setTokenTwoAmount(null);
        if (changeToken === 1) {
            setTokenOne(tokenList[i]);
            fetchPrices(tokenList[i].address, tokenTwo.address)
        } else {
            setTokenTwo(tokenList[i]);
            fetchPrices(tokenOne.address, tokenList[i].address)
        }
        setIsOpen(false);
    }

    const approvePermitContract = () => {
        writeContract({
            abi: erc20Abi,
            address: tokenOne.address,
            functionName: 'approve',
            args: [
                PERMIT2_ADDRESS,
                tokenOneAmount * 10 ** tokenOne.decimals
            ],
        })
    }

    async function fetchPrices(one, two) {

        const res = await axios.get(`https://beathard-backend.fly.dev/tokenPrice`, {
            params: { addressOne: one, addressTwo: two }
        })

        setPrices(res.data)
    }

    async function putPrice() {
        const res = await axios.get(`https://beathard-backend.fly.dev/tokenPrice`, {
            params: { addressOne: "0xFA3c05C2023918A4324fDE7163591Fe6BEBd1692", addressTwo: "0xFA3c05C2023918A4324fDE7163591Fe6BEBd1692" }
        })
        setPriceToken(parseFloat(res.data.tokenOne).toFixed(4));
    }

    useEffect(() => {

        fetchPrices(tokenList[0].address, tokenList[1].address)

        putPrice()

    }, [])

    const chainId = 137
    const uniswapRouterAddress = '0x643770E279d5D0733F21d6DC03A8efbABf3255B4'

    async function getSwapRoute(
        sourceToken,
        destToken,
        amountInWei,
        permit,
        signature
    ) {
        const inputAmount = CurrencyAmount.fromRawAmount(
            sourceToken,
            amountInWei.toString()
        );

        const router = new AlphaRouter({ chainId, provider: ethersProvider });

        const route = await router.route(
            inputAmount,
            destToken,
            TradeType.EXACT_INPUT,
            {
                recipient: account,
                slippageTolerance: new Percent(5, 1000),

                type: SwapType.UNIVERSAL_ROUTER,
                deadlineOrPreviousBlockhash: Math.floor(Date.now() / 1000 + 1800),

                inputTokenPermit: {
                    ...permit,
                    signature

                }
            }
        );
        console.log(`Quote Exact In: ${amountInWei}  -> ${route.quote.toExact()}`);
        return route;
    }

    async function executeSwap() {

        const A = new Token(
            chainId,
            tokenOne.address,
            tokenOne.decimals,
            tokenOne.ticker,
            tokenOne.name
        );

        const B = new Token(
            chainId,
            tokenTwo.address,
            tokenTwo.decimals,
            tokenTwo.ticker,
            tokenTwo.name
        );

        const sourceToken = A
        const destToken = B

        const amountInWei = ethers.utils.parseUnits(
            tokenOneAmount.toString(),
            sourceToken.decimals
        );

        const expiry = Math.floor(Date.now() / 1000 + 1800);

        const allowanceProvider = new AllowanceProvider(
            ethersProvider,
            PERMIT2_ADDRESS
        );

        const nonce = await allowanceProvider.getNonce(
            sourceToken.address,
            account,
            uniswapRouterAddress
        );
        console.log('nonce value:', nonce);

        const permit = {
            details: {
                token: sourceToken.address,
                amount: amountInWei,
                expiration: expiry,
                nonce
            },
            spender: uniswapRouterAddress,
            sigDeadline: expiry
        };
        const { domain, types, values } = AllowanceTransfer.getPermitData(
            permit,
            PERMIT2_ADDRESS,
            chainId
        );

        const useSigner = await signer

        const signature = await useSigner._signTypedData(domain, types, values);

        const route = await getSwapRoute(
            sourceToken,
            destToken,
            amountInWei,
            permit,
            signature
        );

        const txArguments = {
            data: route.methodParameters.calldata,
            to: uniswapRouterAddress,
            // value: BigNumber.from(route.methodParameters.value),
            from: account,
            gasPrice: route.gasPriceWei,
        };

        const transaction = await useSigner.sendTransaction(txArguments);
        console.log('Swap transaction hash: ', transaction.hash);
    }

    function handleSwap() {

        console.log('User balance: ', userBalance)
        if (userBalance < tokenOneAmount * 10 ** tokenOne.decimals) {
            setAlertText(`Balance insuficiente. Balance actual: ${ parseFloat(ethers.utils.formatUnits(userBalance, tokenOne.decimals)).toFixed(2) }`)
            setApprovalDone(false)
            setAlertOpen(true)
            return
        }

        executeSwap();
    }

    if (isSuccessApprove && !approvalDone) {
        setApprovalDone(true);
    }

    return (
        <>
            {contextHolder}
            <Modal
                open={isOpen}
                footer={null}
                onCancel={() => setIsOpen(false)}
                title="Select a token"
            >
                <div className="modalContent">
                    {tokenList?.map((e, i) => {
                        return (
                            <div
                                className="tokenChoice"
                                key={i}
                                onClick={() => modifyToken(i)}
                            >
                                <img src={e.img} alt={e.ticker} className="tokenLogo" />
                                <div className="tokenChoiceNames">
                                    <div className="tokenName">{e.name}</div>
                                    <div className="tokenTicker">{e.ticker}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>
            <div className="tradeBox">
                <div className="w-full flex items-center justify-between px-1 py-5 mb-5">
                    {/* <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/16639.png" 
                        style={{ display: "inline-block", width: "40px" }} 
                    /> */}
                    <img src={cresioLogo} />
                    <span className="font-bold text-lg">
                        {priceToken + ' $'}
                    </span>

                </div>
                <div>
                    <span className="font-bold">
                        Swap
                    </span>
                </div>
                {/* <div className="tradeBoxHeader border-2">
                    <h5>Balance de XCRE:</h5>

                     <Popover
                        content={settings}
                        title="Settings"
                        trigger="click"
                        placement="bottomRight"
                    >
                        <SettingOutlined className="cog" />
                    </Popover>
                </div> */}
                <div className="inputs flex flex-col items-center">
                    <Input
                        placeholder="0"
                        value={tokenOneAmount}
                        onChange={changeAmount}
                    // disabled={!prices}
                    />
                    <div className="switchButton -my-3 z-10 h-7 w-7" onClick={switchTokens}>
                        <ArrowDownOutlined className="switchArrow" />
                    </div>
                    <Input placeholder="0" value={tokenTwoAmount} disabled={true} />


                    <div className="assetOne" onClick={() => openModal(1)}>
                        <img src={tokenOne.img} alt="assetOneLogo" className="assetLogo" />
                        {tokenOne.ticker}
                        <DownOutlined />
                    </div>
                    <div className="assetTwo" onClick={() => openModal(2)}>
                        <img src={tokenTwo.img} alt="assetOneLogo" className="assetLogo" />
                        {tokenTwo.ticker}
                        <DownOutlined />
                    </div>
                    <center> <p style={{ color: "red" }}>{error}</p></center>
                </div>

                <div className='w-full'>
                    {!isConnected ? (
                        <button className='text-neutral-700 font-bold w-full bg-amber-300 py-4 rounded-xl mt-1 mb-7 text-2xl'
                            onClick={() => connect({ connector: injected() })}>
                            CONNECT
                        </button>
                    ) : (
                        !approvalDone ? (
                            <button className='flex justify-center items-center text-neutral-700 font-bold w-full bg-amber-300 py-4 rounded-xl mt-1 mb-7 text-2xl'
                                onClick={() => approvePermitContract()}
                                disabled={isPending}
                            >
                                {isPending ? <div className="loader" /> : 'Approve'}
                                {isLoadingApprove && <div className="loader" />}
                            </button>
                        ) : (
                            <button className='text-neutral-700 font-bold w-full bg-amber-300 py-4 rounded-xl mt-1 mb-7 text-2xl'
                                onClick={() => handleSwap()}
                            >
                                Swap
                            </button>
                        )
                    )}

                    {/* {isLoadingApprove && (
                        <button className='flex justify-center text-neutral-700 font-bold w-full bg-amber-300 py-4 rounded-xl mt-1 mb-7 text-2xl'>
                            <div className="loader"></div>
                        </button>
                    )} */}

                    {/* {hash && (
                        <div className="text-center rounded-xl p-2 bg-gray-700 my-1">
                            Transaction Hash: {hash}
                        </div>
                    )} */}
                    {/* {isLoadingApprove && (
                        <div className="text-blue-500 text-center rounded-xl p-2 bg-gray-700 my-1">
                            Waiting for confirmation...
                        </div>
                    )} */}


                    {/* {isSuccessApprove && (setApprovalDone(true))} */}


                    {/* {approveError && (
                        <div className="text-red-500 text-center rounded-xl p-2 bg-gray-700 my-1">
                            {error.shortMessage || error.message}
                        </div>
                    )} */}

                    {alertOpen && (
                        <Alert _errorText={alertText} _function={() => setAlertOpen(false)} />
                    )}

                </div>
            </div>
        </>
    );
}

export default Swap2;
