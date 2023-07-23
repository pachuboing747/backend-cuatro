import express from "express"
import routes from './routes/index.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", routes)


const port = 8080;
app.listen(port, () => {
  console.log(`Servidor Express escuchando en http://localhost:${port}`);
});

