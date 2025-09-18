require("dotenv").config();

const port = process.env.PM2_PORT;

module.exports = {
      apps: [
        {
          name: "taraje",
          script: "npx",
          args: `serve dist/ --single -p ${port}`, 
          env: {
            NODE_ENV: "production",
          },
        },
      ],
    };