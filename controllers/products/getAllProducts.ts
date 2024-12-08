import { t } from "elysia";
import { createBaseElysia } from "../../base";
import db from "../../lib/db";
import { validateSession } from "../../utils/validateUser";

export const getAllProducts = createBaseElysia()
    .onParse(async ({ request, contentType }) => {
        try {
            if (contentType === "application/json") {
                return await request.json();
            }
            if (contentType === "multipart/form-data") {
                return await request.formData();
            }
        } catch (error) {
            return request.text();
        }
    })
    .get(
        "/",
        async context => {
            const {
                set,
                query: { search },
            } = context;
            const loggedInUser = await validateSession(context.jwt, context);
            if (!loggedInUser) {
                set.status = 401;
                return { user: null, message: "User not Authorized" };
            }
            try {
                let products;
                if (search) {
                    products = await db.product.findMany({
                        where: { description: { contains: search } },
                    });
                } else {
                    products = await db.product.findMany();
                }
                set.status = 200;
                return { products, message: "Products gotten Successfully" };
            } catch (error) {
                console.log(error);
                set.status = 500;
                return { products: null, message: "Unable to fetch products", error };
            }
        },
        {
            query: t.Object({ search: t.Optional(t.String()) }),
            detail: {
                description: "Get all products",

                responses: {
                    200: {
                        description: "Successful retrieval",
                        content: {
                            "application/json": {
                                example: {
                                    data: {
                                        products: [],
                                        message: "Products gotten Successfully",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    );
