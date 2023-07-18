import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)


class CartsManager {

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

const manager = new CartsManager(path.join(__dirname, "cart.json"));


export default CartsManager