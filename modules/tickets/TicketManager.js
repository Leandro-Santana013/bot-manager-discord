const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const TicketDatabase = require('./TicketDatabase.js');

const CATEGORY_ID = '1528913685739733053';
const STAFF_ROLES = [
    '1528880766979936399', 
    '1496150278108479629', 
    '1528910395656507392', 
    '1528884120439095537'
];

class TicketManager {
    async createTicket(interaction, type) {
        const guild = interaction.guild;
        const user = interaction.user;

        
        const permissionOverwrites = [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            {
                id: user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            },
            {
                id: interaction.client.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels],
            }
        ];

        
        for (const roleId of STAFF_ROLES) {
            permissionOverwrites.push({
                id: roleId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            });
        }

        try {
            
            const channel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                parent: CATEGORY_ID,
                permissionOverwrites: permissionOverwrites
            });

            
            const embed = new EmbedBuilder()
                .setTitle(`🎫 Ticket Aberto - ${type}`)
                .setDescription(`Olá <@${user.id}>, sua solicitação de **${type}** foi recebida.\n\nAguarde o atendimento da equipe. Enquanto isso, sinta-se à vontade para enviar mais detalhes, fotos ou prints.`)
                .setColor('#2b2d31');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('assumir_ticket')
                        .setLabel('Assumir Ticket')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🙋‍♂️'),
                    new ButtonBuilder()
                        .setCustomId('fechar_ticket')
                        .setLabel('Fechar Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [row] });

            
            await interaction.editReply({
                content: `✅ Seu ticket foi criado com sucesso! Acesse aqui: <#${channel.id}>`,
                components: [] 
            });

        } catch (error) {
            console.error('[TicketManager]', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao criar o seu ticket.' });
        }
    }

    async claimTicket(interaction) {
        const channel = interaction.channel;
        const staffUser = interaction.user;

        
        await interaction.deferUpdate();

        try {
            
            await channel.setTopic(`ASSUMIDO_POR:${staffUser.id}`);

            
            for (const roleId of STAFF_ROLES) {
                await channel.permissionOverwrites.edit(roleId, { ViewChannel: false });
            }

            
            await channel.permissionOverwrites.edit(staffUser.id, { 
                ViewChannel: true, 
                SendMessages: true, 
                ReadMessageHistory: true 
            });

            
            const oldEmbed = interaction.message.embeds[0];
            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setColor('#FEE75C') 
                .addFields({ name: 'Atendente Atual:', value: `<@${staffUser.id}>`, inline: false });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('fechar_ticket')
                        .setLabel('Fechar Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒')
                );

            await interaction.message.edit({ embeds: [newEmbed], components: [row] });
            await channel.send(`✅ Ticket assumido por <@${staffUser.id}>. Apenas ele e o dono do ticket têm acesso a essa sala agora.`);
            
        } catch (error) {
            console.error('[TicketManager] Erro ao assumir ticket:', error);
            await channel.send('Houve um erro ao tentar alterar as permissões do canal.');
        }
    }

    async closeTicket(interaction) {
        const channel = interaction.channel;
        
        
        let staffId = null;
        if (channel.topic && channel.topic.startsWith('ASSUMIDO_POR:')) {
            staffId = channel.topic.split(':')[1];
            
            
            let ownerId = null;
            try {
                const embedDesc = interaction.message.embeds[0].description;
                const match = embedDesc.match(/<@(\d+)>/);
                if (match) ownerId = match[1];
            } catch (e) {}

            
            if (interaction.user.id !== staffId && interaction.user.id !== ownerId) {
                return interaction.reply({ 
                    content: '❌ Você não pode fechar este ticket! Ele já foi assumido por outro atendente.', 
                    ephemeral: true 
                });
            }
        }
        
        await interaction.reply('Fechando o ticket em 5 segundos...');

        
        if (staffId) {
            try {
                TicketDatabase.addTicket(staffId);
                console.log(`[Ticket] Ponto computado para o staff ${staffId}`);
            } catch (e) {
                console.error('[Ticket] Erro ao salvar ponto no banco:', e);
            }
        }
        
        setTimeout(() => {
            channel.delete().catch(e => console.error('Erro ao deletar ticket:', e));
        }, 5000);
    }
}

module.exports = new TicketManager();
