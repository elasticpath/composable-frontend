const RemoveV2Server = (_props) => {
  return {
    Server: {
      leave(server) {
        server.url = stripV2(server.url)
      },
    },
  }
}

function stripV2(url) {
  return url.endsWith("/v2") ? url.slice(0, -3) : url
}

module.exports = RemoveV2Server
