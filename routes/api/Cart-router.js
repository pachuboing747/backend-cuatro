import { Router } from "express";
import CartsManager from "../../managers/CartsManager.js";
import ProductManager from "../../managers/ProductManager.js";
import fs from "fs/promises";

const cartManager = new CartsManager("cart.json");
const productManager = new ProductManager("productos.json");
const router = Router();

router.get("/:cid", async (req, res) => {
  const id = parseInt(req.params.cid); // Parseamos a entero
  const cart = await cartManager.getById(id);

  if (!cart) {
    res.status(404).send("No se encuentra un carrito de compras con el identificador proporcionado");
    return;
  } else if (cart.products.length === 0) {
    res.status(201).send("Este carrito no contiene productos seleccionados");
  } else {
    res.status(201).send(cart.products);
  }
});

router.get("/", async (req, res) => {
  const carts = await cartManager.getAll();
  res.send(carts);
});

router.post("/", async (req, res) => {
  const { body } = req;
  const cart = await cartManager.create(body);
  res.status(201).send(cart);
});

router.post('/:cid/product/:pid', async (req, res) => {
  const cid = req.params.cid;
  const pid = req.params.pid;

  try {
    let data = await fs.readFile('./data/cart.json', 'utf-8');
    let cartList = JSON.parse(data);

    const cartIndex = cartList.findIndex((item) => item.cid === cid);

    if (cartIndex !== -1) {
      const cart = cartList[cartIndex];
      const existingProductIndex = cart.products.findIndex((item) => item.product === pid);

      if (existingProductIndex !== -1) {
        // If the product already exists in the cart, increase its quantity
        cart.products[existingProductIndex].quantity++;
      } else {
        // If the product doesn't exist, add it to the cart
        const newProductId = cart.products.length + 1;
        const newProduct = { id: newProductId, product: pid, quantity: 1 };
        cart.products.push(newProduct);
      }
    } else {
      // If the cart doesn't exist, create a new cart and add the product to it
      const newProduct = { id: 1, product: pid, quantity: 1 };
      const newCart = { cid, products: [newProduct] };
      cartList.push(newCart);
    }

    data = JSON.stringify(cartList, null, 2);
    await fs.writeFile('./data/cart.json', data, 'utf-8');

    res.json(cartList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agregar el producto al carrito' });
  }
});




export default router;
