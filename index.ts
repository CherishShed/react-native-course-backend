import { app } from "./setup";

function main() {
    app.listen(8080, err => {
        if (err) {
            console.error("Failed to start the server:", err);
            return;
        }
        console.log(
            `Bmz core is now running at http://${app.server?.hostname}:${app.server?.port}/api/swagger`
        );
    });
}

main(); //NOTE: i'm static-pilled
