const axios = require("axios");
const lighthouseConfig = require("../../lighthouse.config");

module.exports = async (publicKey, revokeTo, cid, signedMessage) => {
  try {
    const nodeId = [1, 2, 3, 4, 5];
    const nodeUrl = nodeId.map(
      (elem) => lighthouseConfig.lighthouseBLSNode + "/api/setSharedKey/" + elem
    );

    const _revokeTo = Array.isArray(revokeTo) ? revokeTo : [revokeTo];

    // send encryption key
    const _ = await Promise.all(
      nodeUrl.map((url, index) => {
        return axios.delete(url, {
          data: {
            address: publicKey,
            cid: cid,
            revokeTo: _revokeTo,
          },
          headers: {
            Authorization: "Bearer " + signedMessage,
          },
        });
      })
    );

    return { data: { cid, revokeTo } };
  } catch (error) {
    return null;
  }
};
