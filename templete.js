//* Multer
// import multer, { FileFilterCallback } from "multer";

// const fileStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(__dirname, '../public/images'));
//     },
//     filename: (req, file, cb) => {
//         cb(null, new Date().toISOString() + "-" + file.originalname);
//     },
// });

// const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
//     if (
//         file.mimetype === "image/png" ||
//         file.mimetype === "image/jpg" ||
//         file.mimetype === "image/jpeg"
//     ) {
//         cb(null, true);
//     } else {
//         cb(null, false);
//     }
// };

// app.use(
//     multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
// );


//* GraphQL

// import { graphqlHTTP } from "express-graphql";
// import graphqlSchema from "./graphql/schema";
// import graphqlResolver from "./graphql/resolvers";

// app.use(
//     "/graphql",
//     graphqlHTTP({
//         schema: graphqlSchema,
//         rootValue: graphqlResolver,
//         graphiql: true,
//         customFormatErrorFn(err) {
//             if (!err.originalError) {
//                 return err;
//             }
//             console.log(err);
//             const data = err.originalError.data;
//             const message = err.message || "An error occurred.";
//             const code = err.originalError.code || 500;
//             return { message: message, status: code, data: data };
//         }
//     })
// );


//* CORS

// app.use((req: Request, res: Response, next: NextFunction) => {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//     );
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     // if (req.method === "OPTIONS") {
//     //     return res.sendStatus(200);
//     // }
//     next();
// });