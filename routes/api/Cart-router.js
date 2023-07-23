import { Router } from "express";
import CartsManager from "../../managers/CartsManager.js";
import ProductManager from "../../managers/ProductManager.js";

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

router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const cid = parseInt(req.params.cid);
    const pid = parseInt(req.params.pid);
    const cantidad = 1; 

    const cart = await cartManager.getById(cid);

    if (!cart) {
      res.status(404).send("No se encuentra un carrito de compras con el identificador proporcionado");
      return;
    }

    const product = await productManager.getById(pid);

    if (!product) {
      res.status(404).send("El producto solicitado no se encuentra");
      return;
    } else if (product.stock === 0) {
      res.status(201).send("No contamos con el stock necesario del producto requerido. Disculpe las molestias");
      return;
    }

    const existe = await cartManager.existInCart(cart, pid);

    if (existe === undefined) {
      // Crear un nuevo producto en el carrito
      const productInCart = await cartManager.createProduct(cart, pid, cantidad);

      res.status(201).send(`El producto con ID ${productInCart.products[0].product} ha sido ingresado correctamente y su cantidad es ${productInCart.products[0].quantity}`);
    } else {
      if (existe.quantity === product.stock) {
        res.status(201).send("No contamos con stock para el producto solicitado, disculpe las molestias");
      } else {
        // Actualizar la cantidad del producto existente en el carrito
        const productInCart = await cartManager.updateProduct(cart, pid);

        res.status(201).send(`El producto con ID ${pid} ha sido actualizado correctamente y su cantidad es ${productInCart}`);
      }
    }
  } catch (e) {
    res.status(500).send({
      message: "Ha ocurrido un error en el servidor",
      exception: e.stack,
    });
  }
});


export default router;
