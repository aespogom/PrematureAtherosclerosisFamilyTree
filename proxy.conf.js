const PROXY_CONFIG = {
  "/api/*": {
    "target": "https://data.castoredc.com",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug",
    "pathRewrite": {"^/api" : ""},
    "onProxyReq": function(pr, req, res){
      pr.removeHeader('Origin')
    }
  }
}
module.exports = PROXY_CONFIG;