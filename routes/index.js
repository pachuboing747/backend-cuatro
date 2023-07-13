import { Router } from "express";
import ProductRouter from './api/products-router.js';

const router = Router()

router.use('/products', ProductRouter)


export default  router;