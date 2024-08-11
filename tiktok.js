const { Function } = require('../lib/');
const axios = require('axios');
const fs = require('fs');
const { getVideoMeta } = require('tiktok-scraper');

Function({
    pattern: 'tiktok ?(.*)',
    fromMe: false, // Set to true if you want only admins to use this command
    desc: 'Download TikTok videos',
    type: 'download'
}, async (message, match) => {
    const link = match.trim();
    if (!link) {
        return await message.send('Please provide a TikTok video link.');
    }

    try {
        // Fetch video metadata
        const videoMeta = await getVideoMeta(link, { noWaterMark: true });
        const videoUrl = videoMeta.collector[0].videoUrl;
        const videoBuffer = (await axios.get(videoUrl, { responseType: 'arraybuffer' })).data;

        // Save the video to a file
        const fileName = `/tmp/${videoMeta.collector[0].id}.mp4`;
        fs.writeFileSync(fileName, videoBuffer);

        // Send the video to the chat
        await message.send(
            {
                video: { url: fileName },
                caption: `Downloaded from TikTok: ${link}`
            },
            { quoted: message.data }
        );

        // Clean up by deleting the video file
        fs.unlinkSync(fileName);

    } catch (error) {
        await message.send(`Failed to download TikTok video: ${error.message}`);
    }
});
