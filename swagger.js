import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API RH",
      version: "1.0.0",
      description: "Documentation de l'API RH",
    },

    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://back-pixel-perfect.onrender.com'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Serveur production' : 'Serveur local',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [
    './auth/route/*.js',
    './appConfig/route/*.js',
    './surveys/route/*.js',
    './formation/route/*.js',
    './documents/route/*.js',
    './schemas/*.js'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}