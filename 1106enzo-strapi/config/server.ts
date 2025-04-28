export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
  middleware: {
    settings: {
      body: {
        sizeLimit: 10 * 1024 * 1024,
      },
    },
  },
});
