const { SlashCommandBuilder } = require('discord.js');


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
        .setName('destravar')
        .setDescription('Destranca o canal de voz atual, permitindo que as pessoas voltem a entrar.'),

    async execute(interaction) {
        const hasStaffRole = STAFF_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasStaffRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas membros da equipe podem destravar calls.', ephemeral: true });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Você precisa estar conectado a um canal de voz para poder destrancá-lo.', ephemeral: true });
        }

        try {
            await interaction.deferReply();
            
            
            await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                Connect: null
            });

            await interaction.editReply({ content: `🔓 A call **${voiceChannel.name}** foi destrancada com sucesso!` });
        } catch (error) {
            console.error('[Comando Destravar]', error);
            await interaction.editReply({ content: 'Houve um erro ao tentar destravar a call. Verifique se eu tenho permissão de Administrador/Gerenciar Canais.' });
        }
    },

    async executeMessage(message, args) {
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem destravar calls.');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Você precisa estar conectado a um canal de voz para poder destrancá-lo.');
        }

        try {
            await voiceChannel.permissionOverwrites.edit(message.guild.id, {
                Connect: null
            });

            await message.reply(`🔓 A call **${voiceChannel.name}** foi destrancada com sucesso!`);
        } catch (error) {
            console.error('[Comando Destravar]', error);
            await message.reply('Houve um erro ao tentar destravar a call. Verifique se eu tenho permissão de Administrador/Gerenciar Canais.');
        }
    }
};
