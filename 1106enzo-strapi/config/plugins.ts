export default () => ({
  upload: {
    config: {
      provider: 'local',
      providerOptions: {
        localServer: {
          maxage: 300000
        },
      },
      sizeLimit: 10 * 1024 * 1024, // 10MB in bytes
    },
  },
});
