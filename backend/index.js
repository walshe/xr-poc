const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());


const { Magic } = require('@magic-sdk/admin');

// Initialize Magic with your secret key
const magic = new Magic('sk_live_3A4CC4E6E340E38D');
const moralisApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjYwYmEyZWEwLTc0MWItNGY5MS1iNmFkLTk0NTE5MjQ3OWRjMCIsIm9yZ0lkIjoiOTY1OSIsInVzZXJJZCI6Ijk2NCIsInR5cGUiOiJQUk9KRUNUIiwidHlwZUlkIjoiODJiOTkwNzYtODA1YS00MjdjLTg1NDUtZjg0YjcyMzkzZWVlIiwiaWF0IjoxNzA3OTA5NjMxLCJleHAiOjQ4NjM2Njk2MzF9.n_9c-v7WC3sv_vKhaDL0peEu9hL3FL-p-1GnsH-_ovU';


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
        console.log(`test `, JSON.stringify(metadata))
        req.magicMetadata = metadata;

        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

// Secure endpoint to fetch balance
app.get('/api/fetch-balance', authenticateWithMagic, async (req, res) => {
    const walletAddress = req.magicMetadata.publicAddress; // Assuming the public address is available in user metadata
    const moralisApiUrl = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/balance?chain=eth`;


    console.log(moralisApiUrl)

    try {
        const response = await axios.get(moralisApiUrl, {
            headers: {
                accept: 'application/json',
                'X-API-Key': moralisApiKey,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching balance data from Moralis:', error.message);
        res.status(500).json({ message: 'Failed to fetch NFT data', error: error.message });
    }
});

// Secure endpoint to fetch NFT data
app.get('/api/fetch-nfts', authenticateWithMagic, async (req, res) => {
    const walletAddress = req.magicMetadata.publicAddress; // Assuming the public address is available in user metadata
    const moralisApiUrl = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft?chain=eth&format=decimal&media_items=false`;


    console.log(moralisApiUrl)

    try {
        const response = await axios.get(moralisApiUrl, {
            headers: {
                accept: 'application/json',
                'X-API-Key': moralisApiKey,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching NFT data from Moralis:', error.message);
        res.status(500).json({ message: 'Failed to fetch NFT data', error: error.message });
    }
});


//public
app.get('/api/top-nft-collections', async (req, res) => {
    try {

        const moralisApiUrl = `https://deep-index.moralis.io/api/v2.2/market-data/nfts/top-collections`;

        console.log(moralisApiUrl)

        try {
            const response = await axios.get(moralisApiUrl, {
                headers: {
                    accept: 'application/json',
                    'X-API-Key': moralisApiKey,
                },
            });
            res.json(response.data);
        } catch (error) {
            console.error('Error fetching NFT data from Moralis:', error.message);
            res.status(500).json({ message: 'Failed to fetch NFT data', error: error.message });
        }

    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

app.listen(port, () => {
    console.log(`Crypto app backend listening at http://localhost:${port}`);
});
