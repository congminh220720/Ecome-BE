'use strict'

const port = process.env.DEV_APP_PORT || 3055

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Ecome API Documentation',
        version: '1.0.0',
        description: 'API Information',
        contact: {
          name: 'Developer',
        },
      },
      servers: [
        {
          url: `http://localhost:${port}`,
          description: "Local server"
        }
      ]
    },
    apis: ['./src/routers/**/*.js'], // Path to the API docs
};

console.log(`${swaggerOptions.swaggerDefinition.servers[0].url}/api-docs`)


module.exports = swaggerOptions

