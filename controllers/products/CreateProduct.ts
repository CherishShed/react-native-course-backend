import { t } from "elysia";
import { createBaseElysia } from "../../base";
import { validateSession } from "../../utils/validateUser";
import db from "../../lib/db";

export const createProduct = createBaseElysia()
    .post(
        "/",
        async context => {
            const { set, body } = context;
            const loggedInUser = await validateSession(context.jwt, context);
            if (!loggedInUser) {
                set.status = 401;
                return { user: null, message: "User not Authorized" };
            }
            console.log(loggedInUser);
            const { category, description, images, price, thumbnail, name } = body;
            const categories = [
                "Electronics",
                "Fashion",
                "Fitness",
                "HomeKitchen",
                "Books",
                "ToysGames",
                "BeautyPersonalCare",
                "SportsOutdoors",
                "Automotive",
                "ToolsHomeImprovement",
            ];
            if (!category || !description || !images || !price || !thumbnail || !name) {
                set.status = 409;
                return { user: null, message: "Some Fields are missing" };
            }

            if (!categories.includes(category)) {
                set.status = 409;
                return { user: null, message: "Invalid Category Choice" };
            }
            try {
                const newProduct = await db.product.create({
                    data: {
                        category,
                        description,
                        images,
                        name,
                        price,
                        thumbnail,
                        owner: loggedInUser,
                    },
                });
                if (!newProduct) {
                    set.status = 500;
                    return { product: null, message: "Failed to create product" };
                }
                set.status = 201;
                return { product: newProduct, message: "Product created" };
            } catch (error) {
                console.log(error);
                set.status = 500;
                return { product: null, message: "An error occured" };
            }
        },
        {
            body: t.Object({
                price: t.Integer(),
                name: t.String(),

                images: t.Array(
                    t.String({
                        default: [
                            "https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=800",
                            "https://images.pexels.com/photos/373465/pexels-photo-373465.jpeg?auto=compress&cs=tinysrgb&w=800",
                            "https://images.pexels.com/photos/46274/pexels-photo-46274.jpeg?auto=compress&cs=tinysrgb&w=800",
                        ],
                    })
                ),
                thumbnail: t.String(),
                description: t.String(),
                category: t.Union([
                    t.Literal("Electronics"),
                    t.Literal("Fashion"),
                    t.Literal("Fitness"),
                    t.Literal("HomeKitchen"),
                    t.Literal("Books"),
                    t.Literal("ToysGames"),
                    t.Literal("BeautyPersonalCare"),
                    t.Literal("SportsOutdoors"),
                    t.Literal("Automotive"),
                    t.Literal("ToolsHomeImprovement"),
                ]),
            }),
            detail: {
                description: "Create a new product",

                responses: {
                    201: {
                        description: "Successful Creation",
                        content: {
                            "application/json": {
                                example: {
                                    data: {
                                        products: {},
                                        message: "Products gotten Successfully",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        }
    )
    .onError(async ({ error, set }) => {
        const errors = JSON.parse(error.message).errors;
        const properties = errors.map((err: any) => (err.path as string).substring(1));
        const badProperties = properties.join(", ");
        // Mapping through errors to extract properties
        set.status = 422;
        return {
            product: null,
            message: `${badProperties} ${properties.lenght > 1 ? "are" : "is"} invalid`,
        };
    });
