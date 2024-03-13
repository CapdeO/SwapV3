import { BrowserProvider, JsonRpcProvider, Contract, ethers } from 'ethers'
import { useState } from 'react'

const FACTORY_CONTRACT = process.env.REACT_APP_FACTORY_CONTRACT_ADDRESS
const USDT_CONTRACT = process.env.REACT_APP_MUMBAI_USDT_ADDRESS

const erc20Abi = {} // Abi de contrato ERC20 para acceder a sus funciones

const UNIVERSAL_ROUTER = '0x643770E279d5D0733F21d6DC03A8efbABf3255B4'
export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

const useBlockchain = () => {

    // La address del user conectado
    // En react utilizamos useState para manejar el estado
    const [address, setAddress] = useState('')

    // funcion para obtener un proveedor a traves de un RPC privado
    const getNodeProvider = () => {
        return new JsonRpcProvider(import.meta.env.REACT_APP_MUMBAI_NODE)
    }

    // Crea instancia de contrato para hacer llamados
    // Para crear instancia de contrato necesitamos:
    // Direccion del contrato
    // ABI del contrato
    // proveedor
    const getContractInstance = (_address) => {
        const provider = getProvider()
        return new Contract(_address, erc20Abi, provider)
    }

    // Con ethers, debemos agregar la red manualmente con todos sus parametros
    const addPolygonNetwork = async (provider) => {
        try {
            console.log({
                chainId: import.meta.env.VITE_CHAIN_ID,
                chainName: import.meta.env.VITE_NETWORK_NAME,
                rpcUrls: [import.meta.env.VITE_NETWORK_URL],
                blockExplorerUrls: [import.meta.env.VITE_BLOCK_EXPLORER_URL],
                nativeCurrency: {
                    name: import.meta.env.VITE_CURRENCY_NAME,
                    symbol: import.meta.env.VITE_CURRENCY_SYMBOL,
                    decimals: parseInt(import.meta.env.VITE_CURRENCY_DECIMALS),
                },
            })
            await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: import.meta.env.VITE_CHAIN_ID,
                        chainName: import.meta.env.VITE_NETWORK_NAME,
                        rpcUrls: [import.meta.env.VITE_NETWORK_URL],
                        blockExplorerUrls: [import.meta.env.VITE_BLOCK_EXPLORER_URL],
                        nativeCurrency: {
                            name: import.meta.env.VITE_CURRENCY_NAME,
                            symbol: import.meta.env.VITE_CURRENCY_SYMBOL,
                            decimals: parseInt(import.meta.env.VITE_CURRENCY_DECIMALS),
                        },
                    },
                ],
            })
        } catch (err) {
            console.log(err)
        }
    }

    // Forma de obtener el proveedor publico
    const getProvider = () => {
        let provider
        if (window.ethereum == null) {
            console.warn('MetaMask not installed; using read-only defaults')
            provider = ethers.getDefaultProvider()
        } else {
            provider = new BrowserProvider(window.ethereum)
        }

        return provider
    }

    const connectWallet = async () => {
        const provider = getProvider()
        const signer = await provider.getSigner()
        setAddress(signer.address)

        await addPolygonNetwork(window.ethereum)
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: import.meta.env.CHAIN_ID }],
        })
    }

    // Es una forma de asegurarse que el proveedor este conectado a la red 
    // de Polygon
    const checkChainId = async () => {
        let network = getProvider().getNetwork()
        if ((await network).chainId != 137)
            await connectWallet()
    }

    // -------------------->  Contract functions

    // Lectura de balance de token
    const getBalance = async (_contractAddress) => {
        const signer = await getProvider().getSigner()
        const contract = getContractInstance(_contractAddress)
        var balance = await contract.balanceOf(signer.address)

        return balance
    }

    // Lectura de allowance, en caso de que tenga que aprobar para su uso
    const getAllowance = async (_contractAddress) => {
        const signer = await getProvider().getSigner()
        const contract = getContractInstance(_contractAddress)

        return contract.allowance(signer.address, PERMIT2_ADDRESS)
    }

    // Aprobar el uso de tokens al contrato PERMIT2
    const approbePermit2 = async (_tokenAddress, _amountInWei) => {
        const contract = getContractInstance(_tokenAddress)

        return contract.approve.send(PERMIT2_ADDRESS, _amountInWei)
    }

    return {
        connectWallet,
        getProvider,
        address,
        getBalance,
        getAllowance,
        approbePermit2
    }
}

export default useBlockchain