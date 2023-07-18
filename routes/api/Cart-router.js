import { Router } from "express";
import { promises as fs } from "fs";
import CartsManager from "../../managers/CartsManager.js";

const cartManager = new CartsManager("cart.json");
const router = Router();

// /api/carts
router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    let productsToSend = await cartManager.getProducts();

    if (!isNaN(limit) && limit > 0) {
      productsToSend = productsToSend.slice(0, limit);
    }

    res.status(200).json(productsToSend);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos del carrito" });
  }
});

// /api/carts
router.post("/", async (req, res) => {
  try {
    const cartData = await fs.readFile("./data/cart.json", "utf8");
    let cart = JSON.parse(cartData);

    if (!Array.isArray(cart)) {
      cart = [];
    }

    const newItemId = cart.length > 0 ? cart[cart.length - 1].id + 1 : 1;

    const isDuplicate = cart.some((item) => item.id === newItemId);
    if (isDuplicate) {
      throw new Error("El producto ya existe.");
    }

    const productToAdd = {
      id: newItemId,
      title: "Nike Zoom Mercurial Superfly 9 Academy MG",
      description:
        "Cuenta con una unidad Zoom Air y con una NikeSkin flexible en la parte superior para brindar un toque excepcional, de modo que puedas dominar en los últimos y más importantes minutos de un partido.",
      price: 49900,
      thumbnail:
        "https://nikearprod.vtexassets.com/arquivos/ids/452821/DJ5625_001_A_PREM.jpg?v=638149287879500000",
      code: "GW1022",
      stock: 15,
      category: "Zapatillas",
      status: true,
    };

    cart.push(productToAdd);

    await fs.writeFile("./data/cart.json", JSON.stringify(cart, null, 2), "utf8");

    res
      .status(201)
      .json({ message: "Producto agregado al carrito correctamente", product: productToAdd });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito" });
  }
});

// /api/carts/:cid
router.get("/:cid", async (req, res) => {
  try {
    const cartId = parseInt(req.params.cid);

    const cartData = await fs.readFile("./data/cart.json", "utf8");

    const cart = JSON.parse(cartData);

    const targetCart = cart.find((item) => item.id === cartId);

    if (!targetCart) {
      res.status(404).json({ message: "Carrito no encontrado" });
      return;
    }

    res.status(200).json({ cart: targetCart });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos del carrito" });
  }
});

export default router;
