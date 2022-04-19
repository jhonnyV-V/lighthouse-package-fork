const lighthouse = require("../../Lighthouse");

test("getBalance", async () => {
  const balance = await lighthouse.getBalance(
    "0x487fc2fE07c593EAb555729c3DD6dF85020B5160",
  );

  expect(typeof balance.dataLimit).toBe("number");
  expect(typeof balance.dataUsed).toBe("number");
}, 20000);