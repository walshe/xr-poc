

Bare bones crude frontend and backend POC (Ethereum for now):

    - Authentication with MagicLink (workflow is goofy for now until Google/other social login added on top)
    - By default uses Magic Custodial wallet
    - Allows external wallet to be connected with Web3Modal
    - Uses Moralis API's to fetch top NFT collections
    - Uses Moralis API's to get baklance and list any NFTs in the wallet 
    - Allows user to sign a simple message with the current wallet (whether it custodial or external)


    - backend (run this first)
        - uses Node v18.17.0
        - run `npm install`
        - run `node index.js` (backend starts at http://localhost:3001)
         

    - frontend
        - uses Node v18.17.0
        - run `npm install`
        - run `npm start` (front end will start at http://localhost:3000)
