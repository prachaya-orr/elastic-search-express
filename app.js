const express = require('express');
const { Client } = require('@elastic/elasticsearch')
const { faker } = require('@faker-js/faker');

const client = new Client({
    node: 'http://localhost:9200'
})
const app = express();
app.use(express.json())

const genres = [
    'Fantasy',
    'Science',
    'Mystery',
    'Historical',
    'Romance',
    'Horror',
    'Biography',
    'Adventure'
]

const getRandomGenre = () => {
    const randomIndex = Math.floor(Math.random() * genres.length)
    return genres[randomIndex]
}

app.get('/init', async (req, res) => {
    try {
        for (let i = 0; i < 10000; i++) {
            let book = {
                title: faker.commerce.productName(),
                author: faker.person.fullName(),
                genre: getRandomGenre()
            }
            console.log(
                'book', book,
            );
            await client.index({
                index: 'books',
                body: book
            })
        }
        res.json({ message: 'Insert Ok' })
    } catch (error) {
        console.log('error', error)
        res.status(400).json({ error: error.message })

    }
})

// search?q=<text search>
app.get('/search', async (req, res) => {
    try {
        const { q } = req.query
        const result = await client.search(
            {
                index: 'books,old_books',
                body: {
                    query: {
                        match: {
                            title: q
                        }
                    }
                }
            }
        )
        res.json({
            result: result.body.hits.hits
        })

    } catch (error) {
        console.error("Elasticsearch error:", error)
        res.status(500).send({ error: "Failed to search." })
    }
})

app.post('/insert', async (req, res) => {
    const bookData = req.body
    const { index } = req.query
    try {
        await client.index({
            index,
            body: bookData
        })
        res.json({ message: 'Insert Ok' })
    } catch (error) {
        console.log('error', error)
        res.status(400).json({ error: error.message })
    }
})

const PORT = 8000
app.listen(PORT, () => {
    console.log(`Express server started on http://localhost:${PORT}`)
})