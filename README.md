# Discord Selfbot Altyapısı

Bu proje, Discord üzerinde çalışmak üzere hazırlanmış, kişisel kullanım amaçlı bir selfbot altyapısıdır. Mesajları yanıtlayabilir, özel mesaj gönderebilir, görselleri analiz edebilir ve komutlara göre özel davranışlar sergileyebilir.

Yukarıdaki "AI tabanlı açıklama(Gpt-Plus modeli)" kısmını bir kenara bırakırsak, bu projedeki temel amacım JavaScript, Node.js, c++ gibi dilleri daha iyi kavramaktı. Aynı zamanda Discord'da selfbot kütüphanelerinin nasıl çalıştığını anlamaya çalıştım.

Projeyi şimdilik sade ve basit şekilde paylaşıyorum. Eğer bir kişi bile ilgi gösterir ya da geliştirme talep ederse, kodu toparlayıp düzgün bir template haline getiririm. Şu an modülleri bile `index.js` içine gömmem açıkçası biraz komik duruyor, farkındayım. 😄

Dalga geçmeden önce kullanıp deneyin. Gerçekten bir şey isteyen olursa, bu projeyi ücretsiz ve istek odaklı olarak geliştirebilirim. Kodun tam versiyonu şu anda private durumda, isteyen olursa paylaşırım.

---

## Gereksinimler

- Node.js v18 veya üzeri

---

## Kurulum

```bash
git clone https://github.com/LadyDarknes/gemini-selfbot-ai.git
cd gemini-selfbot-ai
npm install
```
---

.env Dosyası Örneği
```.env
DISCORD_TOKEN=
GEMINI_API_KEY=
CHANNEL_ID=
```
---

## Çalıştırma
```bash
node index.js
```

