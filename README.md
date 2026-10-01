# 葡萄牙・西班牙旅遊手冊 2026

Andy 的完整月行程與 Victoria 的葡萄牙＋巴塞隆納行程，提供繁體中文、英文、西班牙文與歐洲葡萄牙文，使用莫蘭迪色系。

- `index.html`：預設開啟 Andy 手冊
- `victoria.html`：Victoria 手冊
- `andy.html`：Andy 手冊
- `data.js`：行程、交通、航班與門票資料
- `app.js`、`style.css`：互動與版面
- `locales.js`、`preferences.js`：四語翻譯、日期與數字格式、語言偏好
- `currency.js`、`rates.js`：台幣／美元／歐元換算與參考匯率備援
- `assets/`：城市照片與授權資訊，部署時需一併上傳

## GitHub Pages

這是純靜態網站，不需安裝套件或建置。將此目錄中的檔案放在儲存庫根目錄，於 **Settings → Pages → Build and deployment** 選擇 **Deploy from a branch**，再選擇 `main` 分支與 `/ (root)`。

發布後，兩份手冊分別位於 `victoria.html` 與 `andy.html`。資源與頁面連結均使用相對路徑，可部署於 GitHub Pages 的專案子路徑。

## 本機預覽

```sh
python3 -m http.server 8000
```

在瀏覽器開啟 `http://localhost:8000/`。

## 資料與隱私

網站包含整理後的旅遊安排、航班資訊與使用者提供的票價，不含訂位代碼、會員號碼、乘客法定姓名、座位、原始機票截圖、票券條碼、原始 Google 文件或雲端硬碟連結。顯示的 Victoria、Andy 為使用者指定的稱呼。

頁面包含 `noindex,nofollow` 提示，但這不是存取控制；GitHub Pages 網頁與公開儲存庫可被他人查看。新增資料時請勿加入敏感票券資訊。

行程中的待確認安排保留原狀；航班、交通與景點時間請於出發前再次確認。

## 圖片來源

頁首圖片使用 Wikimedia Commons 上 Arnaud Gaillard 的 [Sagrada5.jpg](https://commons.wikimedia.org/wiki/File:Sagrada5.jpg)，依 [CC BY-SA 1.0](https://creativecommons.org/licenses/by-sa/1.0/) 授權顯示並裁切。原圖與授權連結也保留於網頁頁尾。

城市照片使用 Wikimedia Commons 縮圖：里斯本由 Bert K.／Bert Kaufmann 拍攝，CC BY 2.0；奎爾公園由 Mstyslav Chernov 拍攝，CC BY-SA 3.0。完整來源見 `assets/CREDITS.txt` 及網頁頁尾。

## 語言與貨幣

頁首可切換四種語言，選擇會保存在瀏覽器；`?lang=zh-TW`、`?lang=en`、`?lang=es`、`?lang=pt` 可指定語言。匯率換算頁支援 TWD、USD、EUR 互換，並標示各匯率日期。

匯率來源為 [Frankfurter](https://frankfurter.dev/) 公開 API，載入換算頁時更新；無法連線時使用已儲存或 2026-10-01 的參考匯率。輸入金額只在瀏覽器計算。
