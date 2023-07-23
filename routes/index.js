import { Router } from "express";
import ProductRouter from "./api/Products-router.js";
import CartsRouter from "./api/Cart-router.js";

const router = Router()

// rutas de productos
router.use("/products", ProductRouter)

// rutas del carrito
router.use("/carts", CartsRouter)




export default  router;