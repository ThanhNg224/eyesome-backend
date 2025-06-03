const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// VNPAY Sandbox credentials
const vnp_TmnCode = "9FFLZAIW";
const vnp_HashSecret = "4ADBTJJV2PGICW2B8TSOHIUA4YP92GC7";
const vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = "https://google.com"; 

app.post("/api/create-vnpay-url", (req, res) => {
  const { amount } = req.body;

  const date = new Date();
  const createDate = `${date.getFullYear()}${("0" + (date.getMonth() + 1)).slice(-2)}${("0" + date.getDate()).slice(-2)}${("0" + date.getHours()).slice(-2)}${("0" + date.getMinutes()).slice(-2)}${("0" + date.getSeconds()).slice(-2)}`;
  const ipAddr = "127.0.0.1";
  const orderId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  // 🧾 Create payment parameters
  const inputData = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: "Thanh toan Eyesome",
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate
  };

  // ✅ Sort keys alphabetically and append to URLSearchParams
  const params = new URLSearchParams();
  Object.entries(inputData)
    .sort(([k1], [k2]) => k1.localeCompare(k2))
    .forEach(([key, value]) => {
      if (!value || value === "" || value === undefined || value === null) return;
      params.append(key, value.toString());
    });

  // 🔐 Generate signature (do NOT encode)
  const signData = params.toString();
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // ➕ Add signature to params
  params.append("vnp_SecureHash", signed);

  // 🔗 Return final payment URL
  const paymentUrl = `${vnp_Url}?${params.toString()}`;

  console.log("🔐 Signature String:", signData);
  console.log("🔑 Signature Generated:", signed);
  console.log("🔗 Final Payment URL:", paymentUrl);

  res.json({ paymentUrl });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ VNPAY backend running on port ${PORT}`);
});
