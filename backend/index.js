const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());


const { Magic } = require('@magic-sdk/admin');

// Initialize Magic with your secret key
const magic = new Magic('sk_live_6ADF3B2FAB1FF4EE');


// Authentication middleware - this verifies the did token ssent in from the frontent to secure any backend business logic related to that user
const authenticateWithMagic = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const didToken = authHeader.split(' ')[1];
        await magic.token.validate(didToken);
        const metadata = await magic.users.getMetadataByToken(didToken)
        //const issuer = magic.token.getIssuer(didToken);
        console.log(`test `, JSON.stringify(metadata))
        req.magicMetadata = metadata;
        //console.log(`User was authorized `, issuer)
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

app.get('/api/some-secure-endpoint', authenticateWithMagic, async (req, res) => {
    // Your secure endpoint logic here
    res.json({
        message: 'This is secure info from the server for this logged in user!!'
    })


});

// Secure endpoint to fetch NFT data
app.get('/api/fetch-nfts', authenticateWithMagic, async (req, res) => {
    const walletAddress = req.magicMetadata.publicAddress; // Assuming the public address is available in user metadata
    const moralisApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjI1ZWNiMWFjLTBhYzUtNGFkOS1hYmQ1LThkNTRhN2MzZTFjZSIsIm9yZ0lkIjoiOTY1OSIsInVzZXJJZCI6Ijk2NCIsInR5cGVJZCI6IjgyYjk5MDc2LTgwNWEtNDI3Yy04NTQ1LWY4NGI3MjM5M2VlZSIsInR5cGUiOiJQUk9KRUNUIiwiaWF0IjoxNzA3ODE4NjA0LCJleHAiOjQ4NjM1Nzg2MDR9._S5tPvGuALAOrV2IpXi2J2laBmHwS8XwDLIaNBjgQIs'
    const moralisApiUrl = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft?chain=eth&format=decimal&media_items=false`;
                           

    console.log(moralisApiUrl)
  
    try {
      const response = await axios.get(moralisApiUrl, {
        headers: {
          accept : 'application/json',  
          'X-API-Key': moralisApiKey,
        },
      });
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching NFT data from Moralis:', error.message);
      res.status(500).json({ message: 'Failed to fetch NFT data', error: error.message });
    }
  });


app.get('/api/crypto', async (req, res) => {
    try {
        // const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
        //   params: {
        //     vs_currency: 'usd',
        //     order: 'market_cap_desc',
        //     per_page: 10,
        //     page: 1,
        //     sparkline: false,
        //   },
        // });
        // res.json(response.data);
        res.json([{ id: 'BTC', name: 'Bitcoin', symbol: 'BTC', current_price: '50000' }])
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

app.listen(port, () => {
    console.log(`Crypto app backend listening at http://localhost:${port}`);
});
