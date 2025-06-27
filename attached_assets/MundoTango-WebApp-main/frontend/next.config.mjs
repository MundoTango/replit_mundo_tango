/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // reactStrictMode: false,
  env: {
    BASE_URL: "https://api.mundotango.life/api",
    // BASE_URL: "http://mundotango.trangotechdevs.com:3024/api",
    STATIC_TOKEN: "miyqggucnmhijwlbweoanucplvxmezcq",
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:'AIzaSyD5xpfNeqhLwoR3vBxnmrFsOHecFc70nZg',
    REACT_APP_API_DOMAIN: "https://api.mundotango.life/",
    PUBLIISH_ID_GOOGLE: 'ca-pub-7838078349094645',
    TEST_ADD_SLOT_HORIZANTAl:'9299811495',
    TEST_ADD_SLOT_SQUARE:'8549002459',
  },
};

export default nextConfig;
