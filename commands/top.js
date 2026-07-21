const { SlashCommandBuilder } = require('discord.js');
const VoiceTracker = require('../modules/voice-tracker/VoiceTracker.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('Mostra o top 10 usuários com mais tempo em canais de voz.'),

    async execute(interaction) {
        const topUsers = VoiceTracker.getLiveRanking(10);

        if (topUsers.length === 0) {
            return interaction.reply({ content: 'Nenhum tempo registrado ainda.', ephemeral: true });
        }

        let leaderboard = '🏆 **Ranking de Tempo em Call** 🏆\n\n';

        for (let i = 0; i < topUsers.length; i++) {
            const userRow = topUsers[i];
            const totalMs = userRow.tempo_total;

            const hours = Math.floor((totalMs / (1000 * 60 * 60)));
            const minutes = Math.floor((totalMs / (1000 * 60)) % 60);

            
            const userTag = `<@${userRow.id_usuario}>`;

            let timeString = '';
            if (hours > 0) timeString += `${hours}h `;
            timeString += `${minutes}m`;

            let medal = '🏅';
            if (i === 0) medal = '🥇';
            if (i === 1) medal = '🥈';
            if (i === 2) medal = '🥉';

            leaderboard += `${medal} **#${i + 1}** ${userTag} - ${timeString}\n`;
        }

        await interaction.reply({ content: leaderboard, ephemeral: true });
    },

    async executeMessage(message, args) {
        const topUsers = VoiceTracker.getLiveRanking(10);

        if (topUsers.length === 0) {
            return message.reply('Nenhum tempo registrado ainda.');
        }

        let leaderboard = '🏆 **Ranking de Tempo em Call** 🏆\n\n';

        for (let i = 0; i < topUsers.length; i++) {
            const userRow = topUsers[i];
            const totalMs = userRow.tempo_total;

            const hours = Math.floor((totalMs / (1000 * 60 * 60)));
            const minutes = Math.floor((totalMs / (1000 * 60)) % 60);

            const userTag = `<@${userRow.id_usuario}>`;

            let timeString = '';
            if (hours > 0) timeString += `${hours}h `;
            timeString += `${minutes}m`;

            let medal = '🏅';
            if (i === 0) medal = '🥇';
            if (i === 1) medal = '🥈';
            if (i === 2) medal = '🥉';

            leaderboard += `${medal} **#${i + 1}** ${userTag} - ${timeString}\n`;
        }

        // Apaga a chamada do comando
        if (message.deletable) {
            message.delete().catch(() => { });
        }

        const replyMsg = await message.channel.send({ content: leaderboard });

        // Exclui a mensagem de ranking depois de 20 segundos
        setTimeout(async () => {
            try {
                await replyMsg.delete();
            } catch (e) {
                console.error('[Comando Ranking] Não foi possível deletar a mensagem de prefixo:', e.message);
            }
        }, 20000);
    }
};
