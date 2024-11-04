module.exports = {
  pwa: {
    name: 'Apexpad',
    themeColor: '#000000',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    // configure the workbox plugin
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './sw.js',
      swDest: 'service-worker.js',
    },
    manifestOptions: {
      name: 'Apexpad',
      icons: [
        {
          'src': './img/icons/android-chrome-192x192.png',
          'sizes': '192x192',
          'type': 'image/png'
        },
        {
          'src': './img/icons/android-chrome-512x512.png',
          'sizes': '512x512',
          'type': 'image/png'
        }
      ]
    },
  },
}