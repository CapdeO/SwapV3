# SwapV3

Esta versión de Swap utiliza una combinación de dos librerías para la interacción con la Blockchain --> WAGMI y Ethers JS

Mi recomendación: utilizar solamente Ethers para implementar en la aplicación de Angular, 
debido a que implementar WAGMI podría significar configuraciones extra.
Las indicaciones de como implementar el proveedor de Ethers se encuentran en hooks/useBlockchain.js

Sobre el swap --> Las funciones más importantes se encuentran en el componente Swap2.jsx, y serían executeSwap() y getSwapRoute()