import { Router } from "express";
import ProductManager from "../../managers/ProductManager.js";

const productManager = new ProductManager("productos.json");
const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);
    let productsToSend = await productManager.getProducts();

    if (!isNaN(limit) && limit > 0) {
      productsToSend = productsToSend.slice(0, limit);
    }

    res.status(200).json(productsToSend);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productManager.getProductById(id);

    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = req.body;
    await productManager.addProduct({ 
    title: "Nike Zoom Mercurial Superfly 9 Academy MG",
    description: "Cuenta con una unidad Zoom Air y con una NikeSkin flexible en la parte superior para brindar un toque excepcional, de modo que puedas dominar en los últimos y más importantes minutos de un partido.",
    price: 49900,
    thumbnail: "https://nikearprod.vtexassets.com/arquivos/ids/452821/DJ5625_001_A_PREM.jpg?v=638149287879500000",
    code: "GW1022",
    stock: 15,});

    res.status(201).json({ message: "Producto agregado exitosamente", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto" });
  }
});

router.put("/:id", async (req, res) => {
  try {

    const id = parseInt(req.params.id);
    const updatedFields = req.body;

    const updated = await productManager.updateProduct(id, updatedFields);

    if (updated) {
      res.status(200).json({ message: "Producto actualizado exitosamente" });
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await productManager.deleteProduct(id);

    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
