const { SlashCommandBuilder } = require('discord.js');


// ==============================================================
// 🔴 ALTERE AQUI: IDs dos cargos da Equipe/Staff (Admin/Mods)
// ==============================================================
const STAFF_ROLES = [
    '1528880766979936399', 
    '1496150278108479629', 
    '1528910395656507392', 
    '1528884120439095537',
    '1496150278104420369',
    '1496150278104420368'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('travar')
        .setDescription('Tranca o canal de voz que você está atualmente para impedir a entrada de novos membros.'),

    async execute(interaction) {
        const hasStaffRole = STAFF_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasStaffRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas membros da equipe podem trancar calls.', ephemeral: true });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Você precisa estar conectado a um canal de voz para poder trancá-lo.', ephemeral: true });
        }

        try {
            await interaction.deferReply();
            
            
            await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                Connect: false
            });

            await interaction.editReply({ content: `🔒 A call **${voiceChannel.name}** foi trancada com sucesso!` });
        } catch (error) {
            console.error('[Comando Travar]', error);
            await interaction.editReply({ content: 'Houve um erro ao tentar trancar a call. Verifique se eu tenho permissão de Administrador/Gerenciar Canais.' });
        }
    },

    async executeMessage(message, args) {
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem trancar calls.');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Você precisa estar conectado a um canal de voz para poder trancá-lo.');
        }

        try {
            await voiceChannel.permissionOverwrites.edit(message.guild.id, {
                Connect: false
            });

            await message.reply(`🔒 A call **${voiceChannel.name}** foi trancada com sucesso!`);
        } catch (error) {
            console.error('[Comando Travar]', error);
            await message.reply('Houve um erro ao tentar trancar a call. Verifique se eu tenho permissão de Administrador/Gerenciar Canais.');
        }
    }
};
