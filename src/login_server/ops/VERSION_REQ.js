const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, body, serverVersion, opcode }) {
  let clientVersion = body.short();
  socket.debug(`server version: ${serverVersion}, client version: ${clientVersion}`);

  socket.send([
    opcode,
    ...unit.short(serverVersion)
  ]);
}