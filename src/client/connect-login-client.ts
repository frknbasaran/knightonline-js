import { KOClientFactory, IKOClientSocket } from '../core/client'
import { short, string, byte_string, Queue } from '../core/utils/unit'
import { PasswordHash } from '../core/utils/password_hash'
import { AuthenticationCode } from '../login_server/endpoints/LOGIN_REQ'

export async function ConnectLoginClient(ip: string, port: number, user: string, password: string) {
  let connection: IKOClientSocket;
  let data: Queue;

  try {
    connection = await KOClientFactory({ ip, port, name: 'login-test' });
    
    data = await connection.sendAndWait([0xF3, ...string(user), ...string(PasswordHash(password))], 0xF3);
    data.skip(2);

    let resultCode = data.byte();
    let premiumHours = data.short();
    let sessionCode = data.string();

    if (resultCode == AuthenticationCode.NOT_FOUND) throw new Error('Account does not exist');
    if (resultCode == AuthenticationCode.INVALID) throw new Error('Invalid credentials');
    if (resultCode == AuthenticationCode.BANNED) throw new Error('Account banned');
    if (resultCode == AuthenticationCode.IN_GAME) throw new Error('Account already in game');
    if (resultCode == AuthenticationCode.OTP) throw new Error('OTP login is required');
    if (resultCode == AuthenticationCode.OTP_BAN) throw new Error('OTP is locked for login.');
    if (resultCode != AuthenticationCode.SUCCESS) throw new Error('Unknown errror ocurred');

    /** TODO: ENCRYPTION */

    data = await connection.sendAndWait([0xF6], 0xF6);

    let newsHeader = data.string();
    let newsData = data.string();

    data = await connection.sendAndWait([0xF5, 1, 0], 0xF5);
    data.skip(2); // dummy 1, 0 

    let serverCount = data.byte();
    let servers = [];

    for (let i = 0; i < serverCount; i++) {
      servers.push({
        ip: data.string(),
        lanip: data.string(),
        name: data.string(),
        onlineCount: data.short(),
        serverId: data.short(),
        groupId: data.short(),
        userPremiumLimit: data.short(),
        userFreeLimit: data.short(),
        unkwn: data.byte(),
        karusKing: data.string(),
        karusNotice: data.string(),
        elmoradKing: data.string(),
        elmoradNotice: data.string()
      });
    }

    return {
      servers,
      news: {
        header: newsHeader,
        message: newsData
      },
      premiumHours,
      sessionCode,
    }
  } finally {
    if (connection) {
      connection.terminate();
    }
  }
}