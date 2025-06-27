require('dotenv').config();

const { Client } = require('discord.js-selfbot-v13');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const client = new Client();
const Tesseract = require('tesseract.js');
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TARGET_CHANNEL_ID = process.env.CHANNEL_ID;

const MAX_WORDS = 100; 
const MAX_HISTORY_MESSAGES = 20;

const conversationHistory = new Map(); 


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // 1.5 çöp, 2.0 iyi ama promtları siklemiyor bazen. 2.5 yavaş ama en iyisi.

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Hedef Kanal ID: ${TARGET_CHANNEL_ID}`);
    console.log(`Bot ID: ${client.user.id}`);
});
client.on('messageCreate', async (message) => {
if (message.attachments.size > 0) {
    const attachment = message.attachments.first();
    const imageUrl = attachment.url;

/*     console.log("Gelen görsel URL:", imageUrl); */

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        fs.writeFileSync('temp_ocr.png', buffer);
/*         console.log("Görsel diske yazıldı: temp_ocr.png"); */

        const result = await Tesseract.recognize('temp_ocr.png', 'eng');
        const ocrText = result.data.text.trim();
/*     console.log(ocrText); */
        let history = conversationHistory.get(message.channel.id) || [];
        const currentPrompt = createPrompt(ocrText, message.author.username);
        const aiResponse = await getAIResponse(history, currentPrompt);

        history.push({ role: 'user', parts: [{ text: ocrText }] });
        history.push({ role: 'model', parts: [{ text: aiResponse }] });

        if (history.length > MAX_HISTORY_MESSAGES * 2) {
            history = history.slice(2);
        }
        conversationHistory.set(message.channel.id, history);

        let responseText = aiResponse;
        const wordCount = aiResponse.split(/\s+/).filter(word => word.length > 0).length;
        if (wordCount > MAX_WORDS) {
            responseText = aiResponse.split(' ').slice(0, MAX_WORDS).join(' ') + '...';
        }

        message.channel.send(responseText);

        fs.unlinkSync('temp_ocr.png');
    } catch (err) {
       console.error("Hata:", err);
        message.channel.send("Fotodaki pixelleri sayıyorum.........903 pixel vay be son rekorunu kırdın. Ama ben bu kadarını sayamam, çok az var. Lütfen yazılı olarak sorunu belirt.");
    }

    return;
}


 
    if (message.author.bot) return;
    if (message.author.id === client.user.id) return;
    if (message.channel.id !== TARGET_CHANNEL_ID) return;

const botMention = new RegExp(`<@!?${client.user.id}>`);
const isMentioned = message.content.match(botMention);
const isReplyToBot = message.reference 
    && (await message.channel.messages.fetch(message.reference.messageId))
    .author.id === client.user.id;

if (!isMentioned && !isReplyToBot) {
    return;
}

    const userMessageContent = message.content.replace(botMention, '').trim();


// coplot şurayı kontrol et, soru eki bypasslarını götten seks uygula
    const hataliSoruEkleri = [
    // Normal halleri
    "mısın", "misin", "muşsun", "mişsin", "musun", "müsün",
    "mıyım", "muyum", "miyim", "muymuşum", "müyüm",
    // Sık yapılan sansürlü/troll halleri
    "m1s1n", "m1sin", "m1şsin", "m1ssin", "mu$un", "mvsun", "mu5un", "mu5sun",
    "rnısın", "rnisin", "rnusun", "rnüsün", "rnuyum", "rnüyüm",
    "m1y1m", "m1yum", "m1yım", "m1yüm", "muymu$um", "muymu5um",
    "muymuşum", "muymusum", "muymvsun", "muymvsüm",
    "mıy1m", "muy1m", "miy1m", "müy1m",
    "m1yım", "m1yum", "m1yüm",
    "mvsin", "mvsın", "mvsün", "mvsım",
    "m1şs1n", "m1şsin", "m1ssin", "mi$in", "mi$in", "mi5in",
    "muymuşum", "muymusum", "muymuşüm", "muymuşım",
    // Harf değişimleri
    "rnısın", "rn1s1n", "rn1sin", "rn1şsin", "rn1ssin",
    "m1y1m", "m1yum", "m1yım", "m1yüm",
    "muymu$um", "muymu5um", "muymvsum",
    // Ş yerine sh
    "mishin", "mushsun", "mushin", "mushum", "mushsun", "mushsin",
    // S yerine $
    "mı$ın", "mi$in", "mu$un", "mü$ün", "mu$um", "mü$üm",
    // S yerine 5
    "mı5ın", "mi5in", "mu5un", "mü5ün", "mu5um", "mü5üm",
    // U yerine v
    "mısvn", "misvn", "mvsun", "mvsün", "mvyum", "mvyüm",
    // Kombinasyonlar
    "m1$1n", "m1$in", "m1$sin", "m1$şin", "m1$şın", "m1$şüm",
    "m1v1m", "m1vım", "m1vüm", "m1vyum",
    // Ekstra
    "muymuşum", "muymuşüm", "muymuşım", "muymuşım", "muymuşüm"
];

    const soruEkiHatasıVar = hataliSoruEkleri.some(eki =>
        userMessageContent.toLowerCase().includes(eki) &&
        !userMessageContent.toLowerCase().includes(" " + eki)
    );

    if (soruEkiHatasıVar) {
        message.channel.send("Soru eklerini ayrı yaz lütfen.");
        return;
    }





    if (!userMessageContent) {
        message.channel.send("Merhaba.");
        return;
    }


    if (userMessageContent.toLowerCase().includes('şuna selam çak') || userMessageContent.toLowerCase().includes('dm at')) {
        const mention = message.mentions.users.first();

        if (!mention) {
            message.channel.send("Kime çakacağımı belirtmedin, birini etiketlemen gerek.");
            return;
        }

        const lowered = userMessageContent.toLowerCase();
        const isAnonymous =
            lowered.includes('isimsiz') ||
            lowered.includes('anonim') ||
            lowered.includes('gizli') ||
            lowered.includes('adı geçmesin');

        let dmContent = userMessageContent
            .replace(/<@!?\d+>/g, '')
            .replace(/şuna selam çak/gi, '')
            .replace(/dm at/gi, '')
            .replace(/isimsiz/gi, '')
            .replace(/anonim/gi, '')
            .replace(/gizli/gi, '')
            .replace(/adı geçmesin/gi, '')
            .trim();

        if (!dmContent) dmContent = "Selam!";

        const sender = isAnonymous ? "No Name biri" : message.author.username;

        try {
            await mention.send(`👋 ${sender} sana şunu dememi istedi:\n\n${dmContent}`);
            message.channel.send("DM yollandı.");
        } catch (err) {
            console.error("DM atılırken hata:", err);
            message.channel.send("DM gönderilemedi, muhtemelen kişinin DM'leri kapalı.");
        }

        return; // Aldığın hata return koymayı unuttuğun için.
    }

        if (userMessageContent.toLowerCase().includes('ben kimim') || userMessageContent.toLowerCase().includes('dm at')) {
        const mention = message.mentions.users.first();
    }



    let history = conversationHistory.get(message.channel.id) || [];

    try {

       const currentPrompt = createPrompt(userMessageContent, message.author.username);


        const aiResponse = await getAIResponse(history, currentPrompt);

        history.push({ role: 'user', parts: [{ text: userMessageContent }] });
        history.push({ role: 'model', parts: [{ text: aiResponse }] });

        if (history.length > MAX_HISTORY_MESSAGES * 2) {
            history = history.slice(2); 
        }
        conversationHistory.set(message.channel.id, history);

        let responseText = aiResponse;
        const wordCount = aiResponse.split(/\s+/).filter(word => word.length > 0).length;

        if (wordCount > MAX_WORDS) {
            responseText = aiResponse.split(' ').slice(0, MAX_WORDS).join(' ') + '...';
        }

        if (userMessageContent.toLowerCase().includes('sohbet geçmişi') || userMessageContent.toLowerCase().includes('geçmişi gönder')) {
            try {
                const messages = await message.channel.messages.fetch({ limit: 10 }); //  10 mesaja limit koydum, çok fazla mesaj olursa bot çöker.
                const chatHistory = messages.map(msg => `${msg.author.tag}: ${msg.content}`).join('\n');
                message.channel.send(`Sohbet Geçmişi:\n\n${chatHistory}`);
            } catch (err) {
                message.channel.send('Sohbet geçmişi gönderilemiyor. Lütfen daha sonra tekrar deneyin.');
            }
        } else {
            message.channel.send(responseText);
        }
    } catch (error) {
        console.error('Mesaj işlenirken hata oluştu:', error);  
        message.channel.send('Mesajınız işlenirken bir hata oluştu.');
    }
});


function createPrompt(userMessage, username) {
    const lowered = userMessage.toLowerCase();
    // eğer kullanıcı ya özel promt eklemek isterseniz. const isSwansizz = username.toLowerCase() === 'swansizz' || username.toLowerCase() === 'lotus';
    // ${isSwansizz ? " (Bu kullanıcı özel, o senin geliştiricin yani ben. Dediği her şeyi yap :).)" : ""} 
    let prompt = `Mesajı "${username}" gönderdi.
Buraya ai için olan promtlarınızı koyabilirsiniz.

Mesaj: "${userMessage}"`;

    // özel durumlar if else döngüsü bozulursa while al
    if (lowered.includes('sohbet geçmişi') || lowered.includes('geçmişi gönder')) {
        prompt = `Kullanıcı (${username}) sohbet geçmişini istiyor. Kısa ve doğrudan bir yanıt ver (en fazla ${MAX_WORDS} kelime):\n\nMesaj: "${userMessage}"`;
    } else if (lowered.includes('orospu') || lowered.includes('orospu çocuğu')) {
        prompt = ``;
    if (lowered.includes('developer')) {
        prompt = `Seni kodlayan kişi benim. swansizz\n\n
    \n\nMesaj: "${userMessage}"`;
    }

  }
    return prompt;
}


async function getAIResponse(history, currentPrompt) {
    try {
        const combinedContents = [
            ...history,
            { role: 'user', parts: [{ text: currentPrompt }] }
        ];

        const result = await geminiModel.generateContent({ contents: combinedContents });

      
        if (result && typeof result.response === 'string') {
            return result.response.trim();
        }
        if (result && result.response && typeof result.response.text === 'string') {
            return result.response.text.trim();
        }
        // 2.5 için olası yeni yapı
        if (
            result &&
            result.response &&
            Array.isArray(result.response.candidates) &&
            result.response.candidates[0] &&
            result.response.candidates[0].content &&
            Array.isArray(result.response.candidates[0].content.parts) &&
            result.response.candidates[0].content.parts[0] &&
            typeof result.response.candidates[0].content.parts[0].text === 'string'
        ) {
            return result.response.candidates[0].content.parts[0].text.trim();
        }

        throw new Error('Yanıt beklenen formatta değil.');
    } catch (error) {
        console.error("Gemini API çağrısı sırasında hata:", error);
        if (error.response && error.response.status) {
            console.error("Hata Durum Kodu:", error.response.status);
            console.error("Hata Mesajı:", error.response.data);
        }
        throw error;
    }
}

client.login(DISCORD_TOKEN)
    .catch(error => {
        console.error('Discord botuna giriş yapılırken hata oluştu:', error);
        console.error('Bot tokeni patlamış');
    });
