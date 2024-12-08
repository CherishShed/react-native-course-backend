import { createBaseElysia } from "../../base";
import { createProduct } from "./CreateProduct";
import { getAllProducts } from "./getAllProducts";

const appSwagger = {
    detail: {
        tags: ["Products"],
    },
};
export const ProductController = createBaseElysia({
    prefix: "/products",
    detail: appSwagger.detail,
})
    .use(getAllProducts)
    .use(createProduct);
