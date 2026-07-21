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
        .setName('call')
        .setDescription('Altera o limite de vagas do canal de voz que você está.')
        .addIntegerOption(option => 
            option.setName('limite')
                .setDescription('O número máximo de pessoas (0 para ilimitado)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(99)
        ),

    async execute(interaction) {
        const hasStaffRole = STAFF_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasStaffRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas membros da equipe podem alterar o limite de vagas da call.', ephemeral: true });
        }

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ Você precisa estar conectado a um canal de voz para alterar o limite.', ephemeral: true });
        }

        const limite = interaction.options.getInteger('limite');

        try {
            await interaction.deferReply();
            
            
            await voiceChannel.setUserLimit(limite);

            let msg = limite === 0 
                ? `♾️ O limite de vagas da call **${voiceChannel.name}** foi removido (ilimitado)!`
                : `👥 O limite da call **${voiceChannel.name}** foi alterado para **${limite} pessoas**!`;

            await interaction.editReply({ content: msg });
        } catch (error) {
            console.error('[Comando Call]', error);
            await interaction.editReply({ content: 'Houve um erro ao tentar alterar o limite. Verifique se o bot tem permissão de Gerenciar Canais.' });
        }
    },

    async executeMessage(message, args) {
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem alterar o limite de vagas da call.');
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('❌ Você precisa estar conectado a um canal de voz para alterar o limite.');
        }

        const limiteArg = args[0];
        if (!limiteArg || isNaN(limiteArg)) {
            return message.reply('❌ Você precisa informar o número de vagas! (Exemplo: `biz!call 5` ou `biz!call 0` para ilimitado)');
        }

        let limite = parseInt(limiteArg);
        if (limite < 0 || limite > 99) {
            return message.reply('❌ O limite deve ser um número entre 0 e 99.');
        }

        try {
            await voiceChannel.setUserLimit(limite);

            let msg = limite === 0 
                ? `♾️ O limite de vagas da call **${voiceChannel.name}** foi removido (ilimitado)!`
                : `👥 O limite da call **${voiceChannel.name}** foi alterado para **${limite} pessoas**!`;

            await message.reply(msg);
        } catch (error) {
            console.error('[Comando Call]', error);
            await message.reply('Houve um erro ao tentar alterar o limite. Verifique se o bot tem permissão de Gerenciar Canais.');
        }
    }
};
