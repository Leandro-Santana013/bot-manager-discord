const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');
const fs = require('fs');

class CanvasRenderer {
    
    static msToTime(duration) {
        if (duration === 0) return '0h 0m 0s';
        const seconds = Math.floor((duration / 1000) % 60);
        const minutes = Math.floor((duration / (1000 * 60)) % 60);
        const hours = Math.floor((duration / (1000 * 60 * 60)));
        return `${hours}h ${minutes}m ${seconds}s`;
    }

        static async generateProfileCard(targetUser, stats) {
        const canvasWidth = 900;
        const canvasHeight = 650;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        
        const bgPath = path.join(__dirname, '..', '..', 'assets', 'background.jpg');
        
        if (!fs.existsSync(bgPath)) {
            throw new Error('A imagem de fundo (assets/background.jpg) não foi encontrada!');
        }
        const background = await loadImage(bgPath);

        
        const bgScale = Math.max(canvasWidth / background.width, canvasHeight / background.height);
        const bgW = background.width * bgScale;
        const bgH = background.height * bgScale;
        
        ctx.filter = 'blur(15px) brightness(0.6)';
        ctx.drawImage(background, (canvasWidth - bgW) / 2, (canvasHeight - bgH) / 2, bgW, bgH);
        ctx.filter = 'none';

        
        const cardWidth = 700;
        const cardHeight = 500;
        const cardX = (canvasWidth - cardWidth) / 2;
        const cardY = (canvasHeight - cardHeight) / 2;
        const cornerRadius = 25;

        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;

        
        ctx.fillStyle = '#111214';
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
        ctx.fill();
        
        ctx.shadowColor = 'transparent'; 

        
        const bannerHeight = 160;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardWidth, bannerHeight, [cornerRadius, cornerRadius, 0, 0]);
        ctx.clip();
        
        const bannerScale = Math.max(cardWidth / background.width, bannerHeight / background.height);
        const bannerW = background.width * bannerScale;
        const bannerH = background.height * bannerScale;
        ctx.drawImage(background, cardX, cardY - (bannerH - bannerHeight)/2, bannerW, bannerH);
        ctx.restore();

        
        const avatarUrl = targetUser.displayAvatarURL({ extension: 'png', size: 256 });
        const avatar = await loadImage(avatarUrl);
        
        const avatarSize = 140;
        const avatarX = cardX + 40;
        const avatarY = cardY + bannerHeight - (avatarSize / 2) - 10; 

        
        ctx.fillStyle = '#111214';
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, (avatarSize / 2) + 8, 0, Math.PI * 2, true);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(targetUser.username, cardX + 45, avatarY + avatarSize + 50);
        
        
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Rank #${stats.rank}`, cardX + cardWidth - 45, avatarY + avatarSize + 45);

        
        ctx.beginPath();
        ctx.moveTo(cardX + 40, avatarY + avatarSize + 80);
        ctx.lineTo(cardX + cardWidth - 40, avatarY + avatarSize + 80);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#2b2d31';
        ctx.stroke();

        
        const statsYStart = avatarY + avatarSize + 120;
        const boxWidth = (cardWidth - 100) / 3; 
        
        function drawStatBox(x, y, label, value) {
            ctx.fillStyle = '#2b2d31'; 
            ctx.beginPath();
            ctx.roundRect(x, y, boxWidth, 100, 12);
            ctx.fill();
            
            ctx.fillStyle = '#b5bac1';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label.toUpperCase(), x + boxWidth / 2, y + 35);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px sans-serif';
            ctx.fillText(value, x + boxWidth / 2, y + 75);
        }

        drawStatBox(cardX + 40, statsYStart, 'Total em Call', this.msToTime(stats.totalMs));
        drawStatBox(cardX + 50 + boxWidth, statsYStart, 'Esta Semana', this.msToTime(stats.thisWeekMs));
        drawStatBox(cardX + 60 + (boxWidth * 2), statsYStart, 'Semana Passada', this.msToTime(stats.lastWeekMs));

        return new AttachmentBuilder(await canvas.encode('png'), { name: 'perfil-tempo.png' });
    }
}

module.exports = CanvasRenderer;
