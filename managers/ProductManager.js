import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)


class ProductManager {
  #products = [];

  constructor(filename) {
    this.filename = filename;
    this.filepath = path.join(__dirname, "../data", this.filename);
  }

  #readFile = async () => {
    const data = await fs.readFile(this.filepath, "utf-8");

    if (data == "") {
      this.#products = [
        "El archivo se encuentra vacío, por favor, ingrese un producto",
      ];
    } else {
      this.#products = JSON.parse(data);
    }
  };

  #writeFile = async () => {
    const data = JSON.stringify(this.#products, null, 2);
    await fs.writeFile(this.filepath, data);
  };

  async getAll() {
    await this.#readFile();

    return this.#products;
  }

  async getById(id) {
    await this.#readFile();

    return this.#products.find((p) => p.id == id);
  }

  async create(product) {
    await this.#readFile();

    const id = (this.#products[this.#products.length - 1]?.id || 0) + 1;

    const newProduct = {
      id,
      ...product,
    };

    if (
      this.#products[0] ==
      "El archivo se encuentra vacío, por favor, ingrese un producto"
    ) {
      this.#products.pop();
    }

    this.#products.push(newProduct);

    await this.#writeFile();

    return newProduct;
  }

  async save(id, producto) {
    await this.#readFile();

    const existing = await this.getById(id);

    if (!existing) {
      return;
    }

    const { title, description, stock, price, keywords } = producto;

    existing.title = title;
    existing.description = description;
    existing.stock = stock;
    existing.price = price;
    existing.keywords = keywords;

    await this.#writeFile();
  }

  async delete(id) {
    await this.#readFile();

    this.#products = this.#products.filter((p) => p.id != id);

    await this.#writeFile();
  }
}
export default ProductManager