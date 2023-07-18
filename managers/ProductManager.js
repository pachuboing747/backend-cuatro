import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)


class ProductManager {

  constructor(filename) {
    this.filename = filename;
    this.filePath = path.join(__dirname, "../data", this.filename)
  }

  async addProduct(prod) {
    const products = await fs.readFile(this.filePath, "utf8");
    let items = JSON.parse(products);

    if (!Array.isArray(items)) {
      items = [];
    }

    const newItemId = items.length > 0 ? items[items.length - 1].id + 1 : 1;

    const isDuplicate = items.some((item) => item.id === newItemId);
    if (isDuplicate) {
      throw new Error("El producto ya existe.");
    }

    items.push({
      ...prod,
      id: newItemId,
    });

    await fs.writeFile(this.filePath, JSON.stringify(items, null, 2));
  }

  async getProducts() {
    const products = await fs.readFile(this.filePath, "utf8");
    let items = JSON.parse(products);

    if (!Array.isArray(items)) {
      items = [];
    }

    return items;
  }

  async getProductById(id) {
    const products = await fs.readFile(this.filePath, "utf8");
    let items = JSON.parse(products);

    if (!Array.isArray(items)) {
      items = [];
    }

    const product = items.find((p) => p.id === parseInt(id));
    if (!product) {
      throw new Error("Producto no encontrado.");
    }

    return product;
  }

  async updateProduct(id, updatedFields) {
    const products = await fs.readFile(this.filePath, "utf8");
    let items = JSON.parse(products);
  
    if (!Array.isArray(items)) {
      items = [];
    }
  
    const index = items.findIndex((p) => p.id === id);
  
    if (index !== -1) {
      items[index] = {
        ...items[index],
        ...updatedFields
      };
  
      await fs.writeFile(this.filePath, JSON.stringify(items, null, 2));
      return true;
    }
  
    return false;
  }
  

  async deleteProduct(id) {
    const products = await fs.readFile(this.filePath, "utf8");
    let items = JSON.parse(products);

    if (!Array.isArray(items)) {
      items = [];
    }

    const index = items.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new Error("Producto no encontrado.");
    }

    const updatedItems = items.filter((p) => p.id !== id);

    await fs.writeFile(this.filePath, JSON.stringify(updatedItems, null, 2));
  }
}

const manager = new ProductManager(path.join(__dirname, "productos.json"));


async function test() {
  try {
    await manager.addProduct({
      title: "Nike Zoom Mercurial Superfly 9 Academy MG",
      description: "Cuenta con una unidad Zoom Air y con una NikeSkin flexible en la parte superior para brindar un toque excepcional, de modo que puedas dominar en los últimos y más importantes minutos de un partido.",
      price: 49900,
      thumbnail: "https://nikearprod.vtexassets.com/arquivos/ids/452821/DJ5625_001_A_PREM.jpg?v=638149287879500000",
      code: "GW1022",
      stock: 15,
    });

    const products = await manager.getProducts();
    console.log(products);

    const updated = await manager.updateProduct(1, {
      title: "Nuevo nombre",
      price: 29900,
    });

    if (updated) {
      console.log("Producto actualizado exitosamente.");
    } else {
      console.log("Producto no encontrado.");
    }

    const product = await manager.getProductById(1);
    console.log(product);

    await manager.deleteProduct(5);
    console.log("Producto eliminado exitosamente");
  } catch (error) {
    console.error(error.message);
  }
}
// test()
export default ProductManager