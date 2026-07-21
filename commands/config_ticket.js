const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config_ticket')
        .setDescription('Edita os textos e opções do painel de tickets (Apenas Administração).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuração do Painel de Tickets')
            .setDescription('Selecione abaixo qual parte do painel você deseja editar. Uma janela se abrirá para você digitar os novos textos.')
            .setColor('#2b2d31');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('config_main')
                    .setLabel('Editar Textos Principais')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('config_denuncia')
                    .setLabel('Editar Denúncia')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🚨'),
                new ButtonBuilder()
                    .setCustomId('config_duvida')
                    .setLabel('Editar Dúvidas')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❓'),
                new ButtonBuilder()
                    .setCustomId('config_parceria')
                    .setLabel('Editar Parcerias')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🤝')
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },

    
    async executeMessage(message, args) {
        message.reply('Por favor, use o slash command `/config_ticket` para acessar o painel de configurações.');
    }
};
