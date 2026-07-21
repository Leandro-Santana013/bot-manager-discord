const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');
const TicketDatabase = require('../modules/tickets/TicketDatabase.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel_suporte')
        .setDescription('Envia o painel de suporte interativo neste canal (Apenas Administração).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        
        const titulo = TicketDatabase.getConfig('panel_title', 'Central de Ajuda');
        const desc = TicketDatabase.getConfig('panel_description', 'Nessa seção, você pode tirar suas dúvidas ou entrar em contato com a nossa equipe de Suporte.\n\nPara evitar problemas, leia as opções com atenção e selecione o motivo do seu contato no menu abaixo.');
        const img = TicketDatabase.getConfig('panel_image', '');

        const embed = new EmbedBuilder()
            .setTitle(titulo)
            .setDescription(desc)
            .setColor('#5865F2');

        if (img && img.startsWith('http')) {
            embed.setImage(img);
        }

        
        const denunciaLabel = TicketDatabase.getConfig('opt_denuncia_label', 'Quero fazer uma Denúncia');
        const denunciaDesc = TicketDatabase.getConfig('opt_denuncia_desc', 'Denunciar quebra de regras, spam, ou condutas indevidas.');
        const denunciaEmoji = TicketDatabase.getConfig('opt_denuncia_emoji', '🚨');

        const duvidaLabel = TicketDatabase.getConfig('opt_duvida_label', 'Dúvidas Gerais');
        const duvidaDesc = TicketDatabase.getConfig('opt_duvida_desc', 'Falar com o suporte para dúvidas técnicas.');
        const duvidaEmoji = TicketDatabase.getConfig('opt_duvida_emoji', '❓');

        const parceriaLabel = TicketDatabase.getConfig('opt_parceria_label', 'Contato para Parcerias');
        const parceriaDesc = TicketDatabase.getConfig('opt_parceria_desc', 'Feche parcerias entre servidores e projetos.');
        const parceriaEmoji = TicketDatabase.getConfig('opt_parceria_emoji', '🤝');

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_ajuda')
                    .setPlaceholder('Selecione uma opção...')
                    .addOptions([
                        { label: denunciaLabel, description: denunciaDesc, value: 'denuncia', emoji: denunciaEmoji },
                        { label: duvidaLabel, description: duvidaDesc, value: 'duvida', emoji: duvidaEmoji },
                        { label: parceriaLabel, description: parceriaDesc, value: 'parceria', emoji: parceriaEmoji },
                    ]),
            );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Painel de tickets enviado com sucesso neste canal!', ephemeral: true });
    },

    async executeMessage(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('Apenas administradores podem usar isso.');
        }

        const titulo = TicketDatabase.getConfig('panel_title', 'Central de Ajuda');
        const desc = TicketDatabase.getConfig('panel_description', 'Nessa seção, você pode tirar suas dúvidas ou entrar em contato com a nossa equipe de Suporte.\n\nPara evitar problemas, leia as opções com atenção e selecione o motivo do seu contato no menu abaixo.');
        const img = TicketDatabase.getConfig('panel_image', '');

        const embed = new EmbedBuilder()
            .setTitle(titulo)
            .setDescription(desc)
            .setColor('#5865F2');

        if (img && img.startsWith('http')) {
            embed.setImage(img);
        }

        const denunciaLabel = TicketDatabase.getConfig('opt_denuncia_label', 'Quero fazer uma Denúncia');
        const denunciaDesc = TicketDatabase.getConfig('opt_denuncia_desc', 'Denunciar quebra de regras, spam, ou condutas indevidas.');
        const denunciaEmoji = TicketDatabase.getConfig('opt_denuncia_emoji', '🚨');

        const duvidaLabel = TicketDatabase.getConfig('opt_duvida_label', 'Dúvidas Gerais');
        const duvidaDesc = TicketDatabase.getConfig('opt_duvida_desc', 'Falar com o suporte para dúvidas técnicas.');
        const duvidaEmoji = TicketDatabase.getConfig('opt_duvida_emoji', '❓');

        const parceriaLabel = TicketDatabase.getConfig('opt_parceria_label', 'Contato para Parcerias');
        const parceriaDesc = TicketDatabase.getConfig('opt_parceria_desc', 'Feche parcerias entre servidores e projetos.');
        const parceriaEmoji = TicketDatabase.getConfig('opt_parceria_emoji', '🤝');

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_ajuda')
                    .setPlaceholder('Selecione uma opção...')
                    .addOptions([
                        { label: denunciaLabel, description: denunciaDesc, value: 'denuncia', emoji: denunciaEmoji },
                        { label: duvidaLabel, description: duvidaDesc, value: 'duvida', emoji: duvidaEmoji },
                        { label: parceriaLabel, description: parceriaDesc, value: 'parceria', emoji: parceriaEmoji },
                    ]),
            );

        if (message.deletable) message.delete().catch(()=>{});
        await message.channel.send({ embeds: [embed], components: [row] });
    }
};
