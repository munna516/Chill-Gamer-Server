require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hqlh5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // Database
    const reviewCollection = client.db("Chill-Gamers-DB").collection("Reviews");
    const watchlistCollection = client
      .db("Chill-Gamers-DB")
      .collection("Watchlist");
    const playlistCollection = client
      .db("Chill-Gamers-DB")
      .collection("Playlist");
    const newsCollection = client
      .db("Chill-Gamers-DB")
      .collection("Latest-News");

    // User Review
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.findOne(query);
      res.send(result);
    });

    app.get("/highestRatedGames", async (req, res) => {
      const topReviews = await reviewCollection
        .find()
        .sort({ rating: -1 })
        .limit(6)
        .toArray();
      res.send(topReviews);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.put("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedReview = req.body;
      const review = {
        $set: {
          name: updatedReview.name,
          email: updatedReview.email,
          gameName: updatedReview.gameName,
          publishingYear: updatedReview.publishingYear,
          rating: updatedReview.rating,
          genre: updatedReview.genre,
          photo: updatedReview.photo,
          description: updatedReview.description,
        },
      };
      const result = await reviewCollection.updateOne(filter, review, options);
      res.send(result);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });

    // User Watch List
    app.get("/myWatchlist", async (req, res) => {
      const result = await watchlistCollection.find().toArray();
      res.send(result);
    });
    app.post("/myWatchlist", async (req, res) => {
      const watchlist = req.body;
      const result = await watchlistCollection.insertOne(watchlist);
      res.send(result);
    });

    // Add to Playlist
    app.post("/add-to-playlist", async (req, res) => {
      const playlist = req.body;
      const query = { email: playlist.email, gameId: playlist.gameId };
      const isFind = await playlistCollection.findOne(query);
      if (isFind) {
        return res.send(isFind);
      }
      const result = await playlistCollection.insertOne(playlist);
      res.send(result);
    });
    // Play station games
    app.get("/play-station-games", async (req, res) => {
      const games = await reviewCollection.find().limit(7).toArray();
      res.send(games);
    });
    // Get News
    app.get("/news", async (req, res) => {
      const result = await newsCollection.find().toArray();
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Chill Gamer is running on Server");
});

app.listen(port, () => {
  console.log(`Coffee house is running on port ${port}`);
});
