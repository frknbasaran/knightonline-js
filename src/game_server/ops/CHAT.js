const unit = require('../../core/utils/unit');
const crypt = require('../../core/utils/crypt');
const config = require('config');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let message = body.string();

  if (type == MESSAGE_TYPES.GENERAL) {
    if (message.length > 128) {
      message = message.substring(0, 128)
    }

    socket.shared.region.regionSend(socket, [
      opcode,
      type,
      socket.user.nation,
      ...unit.short(socket.session & 0xFFFF),
      ...unit.byte_string(socket.character.name),
      ...unit.string(message, 'ascii')
    ]);
  }
}

const MESSAGE_TYPES = {
  GENERAL: 1
}