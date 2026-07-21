const { SlashCommandBuilder } = require('discord.js');
const TicketDatabase = require('../modules/tickets/TicketDatabase.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Mostra o ranking de quem atendeu mais tickets.'),
                
    async execute(interaction) {
        
        // ==============================================================
// 🔴 ALTERE AQUI: IDs dos cargos da Equipe/Staff (Admin/Mods)
// ==============================================================
const STAFF_ROLES = [
            '1528880766979936399', 
            '1496150278108479629', 
            '1528910395656507392', 
            '1528884120439095537'
        ];
        const hasStaffRole = STAFF_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));
        
        if (!hasStaffRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas membros da equipe podem ver o ranking de tickets.', ephemeral: true });
        }

        const topUsers = TicketDatabase.getTopTickets(10);
        
        if (topUsers.length === 0) {
            return interaction.reply({ content: 'Nenhum ticket foi computado ainda.', ephemeral: true });
        }
        
        let leaderboard = '🎫 **Ranking de Atendimento de Tickets** 🎫\n\n';
        
        for (let i = 0; i < topUsers.length; i++) {
            const userRow = topUsers[i];
            const quantidade = userRow.quantidade;
            const userTag = `<@${userRow.id_usuario}>`;
            
            let medal = '🏅';
            if (i === 0) medal = '🥇';
            if (i === 1) medal = '🥈';
            if (i === 2) medal = '🥉';
            
            leaderboard += `${medal} **#${i + 1}** ${userTag} - **${quantidade} tickets**\n`;
        }
        
        await interaction.reply({ content: leaderboard, ephemeral: true });
    },

    async executeMessage(message, args) {
        
        // ==============================================================
// 🔴 ALTERE AQUI: IDs dos cargos da Equipe/Staff (Admin/Mods)
// ==============================================================
const STAFF_ROLES = [
            '1528880766979936399', 
            '1496150278108479629', 
            '1528910395656507392', 
            '1528884120439095537'
        ];
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem ver o ranking de tickets.');
        }

        const topUsers = TicketDatabase.getTopTickets(10);
        
        if (topUsers.length === 0) {
            return message.reply('Nenhum ticket foi computado ainda.');
        }
        
        let leaderboard = '🎫 **Ranking de Atendimento de Tickets** 🎫\n\n';
        
        for (let i = 0; i < topUsers.length; i++) {
            const userRow = topUsers[i];
            const quantidade = userRow.quantidade;
            const userTag = `<@${userRow.id_usuario}>`;
            
            let medal = '🏅';
            if (i === 0) medal = '🥇';
            if (i === 1) medal = '🥈';
            if (i === 2) medal = '🥉';
            
            leaderboard += `${medal} **#${i + 1}** ${userTag} - **${quantidade} tickets**\n`;
        }
        
        
        if (message.deletable) {
            message.delete().catch(() => {});
        }

        const replyMsg = await message.channel.send({ content: leaderboard });

        
        setTimeout(async () => {
            try {
                await replyMsg.delete();
            } catch (e) {
                console.error('[Comando Rank Tickets] Não foi possível deletar a mensagem de prefixo:', e.message);
            }
        }, 20000);
    }
};
