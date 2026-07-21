const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, UserSelectMenuBuilder, RoleSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const TicketManager = require('../modules/tickets/TicketManager.js');
const TicketDatabase = require('../modules/tickets/TicketDatabase.js');


const cooldowns = new Map();

module.exports = {
    async handleInteraction(interaction) {
        
        
        
        
        if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'menu_ajuda') {
                const selectedOption = interaction.values[0];

                let descricao = '';
                let tituloBotao = 'Abrir Ticket';
                let idBotao = '';

                if (selectedOption === 'denuncia') {
                    descricao = TicketDatabase.getConfig('opt_denuncia_reply', '🚨 **Para criar um atendimento de Denúncia, separe:**\n\n1. Provas do ocorrido (prints/vídeos)\n2. Nome e ID do meliante\n3. Descrição do ocorrido\n\n👇 Clique no botão abaixo quando estiver com tudo em mãos.');
                    idBotao = 'abrir_ticket_denuncia';
                } else if (selectedOption === 'duvida') {
                    descricao = TicketDatabase.getConfig('opt_duvida_reply', '❓ **Para tirar uma dúvida com o Suporte:**\n\nPor favor, lembre-se de ler os canais de tutoriais antes de pedir ajuda.\n\n👇 Clique no botão abaixo para chamar a equipe.');
                    idBotao = 'abrir_ticket_duvida';
                } else if (selectedOption === 'parceria') {
                    descricao = TicketDatabase.getConfig('opt_parceria_reply', '🤝 **Atendimento de Parceria:**\n\nTenha em mãos o link do seu projeto e os requisitos mínimos necessários.\n\n👇 Clique abaixo para iniciar o processo.');
                    idBotao = 'abrir_ticket_parceria';
                }

                const embed = new EmbedBuilder()
                    .setDescription(descricao)
                    .setColor('#5865F2');

                const row_button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(idBotao)
                            .setLabel(tituloBotao)
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('📩')
                    );

                await interaction.reply({ embeds: [embed], components: [row_button], ephemeral: true });

                setTimeout(() => {
                    
                    const denunciaLabel = TicketDatabase.getConfig('opt_denuncia_label', 'Quero fazer uma Denúncia');
                    const denunciaDesc = TicketDatabase.getConfig('opt_denuncia_desc', 'Denunciar quebra de regras, spam, ou condutas indevidas.');
                    const denunciaEmoji = TicketDatabase.getConfig('opt_denuncia_emoji', '🚨');

                    const duvidaLabel = TicketDatabase.getConfig('opt_duvida_label', 'Dúvidas Gerais');
                    const duvidaDesc = TicketDatabase.getConfig('opt_duvida_desc', 'Falar com o suporte para dúvidas técnicas.');
                    const duvidaEmoji = TicketDatabase.getConfig('opt_duvida_emoji', '❓');

                    const parceriaLabel = TicketDatabase.getConfig('opt_parceria_label', 'Contato para Parcerias');
                    const parceriaDesc = TicketDatabase.getConfig('opt_parceria_desc', 'Feche parcerias entre servidores e projetos.');
                    const parceriaEmoji = TicketDatabase.getConfig('opt_parceria_emoji', '🤝');

                    const row_reset = new ActionRowBuilder()
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
                    interaction.message.edit({ components: [row_reset] }).catch(()=>{});
                }, 5000);
            }
        }

        
        
        
        if (interaction.isUserSelectMenu()) {
            if (interaction.customId === 'menu_selecionar_usuario_cargo') {
                
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
                    return interaction.reply({ content: '❌ Apenas membros da equipe podem usar este painel.', ephemeral: true });
                }

                const targetUserId = interaction.values[0];

                const row = new ActionRowBuilder()
                    .addComponents(
                        new RoleSelectMenuBuilder()
                            .setCustomId(`menu_selecionar_cargo_${targetUserId}`)
                            .setPlaceholder('Selecione os cargos para adicionar/remover...')
                            .setMinValues(1)
                            .setMaxValues(5)
                    );

                await interaction.reply({ 
                    content: `👤 **Usuário Selecionado:** <@${targetUserId}>\nSelecione no menu abaixo os cargos que deseja aplicar ou remover. O bot fará a troca automaticamente!`,
                    components: [row],
                    ephemeral: true 
                });
            }
        }

        
        
        
        if (interaction.isRoleSelectMenu()) {
            if (interaction.customId.startsWith('menu_selecionar_cargo_')) {
                
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
                    return interaction.reply({ content: '❌ Apenas membros da equipe podem alterar cargos.', ephemeral: true });
                }

                const targetUserId = interaction.customId.split('menu_selecionar_cargo_')[1];
                const selectedRoles = interaction.values; 

                await interaction.deferReply({ ephemeral: true });

                try {
                    const member = await interaction.guild.members.fetch(targetUserId);
                    let added = [];
                    let removed = [];
                    
                    for (const roleId of selectedRoles) {
                        const role = interaction.guild.roles.cache.get(roleId);
                        
                        
                        if (role && role.position >= interaction.guild.members.me.roles.highest.position) {
                            continue; 
                        }

                        if (member.roles.cache.has(roleId)) {
                            await member.roles.remove(roleId);
                            removed.push(`<@&${roleId}>`);
                        } else {
                            await member.roles.add(roleId);
                            added.push(`<@&${roleId}>`);
                        }
                    }

                    let msg = `⚙️ **Alterações no membro ${member.user.tag}:**\n`;
                    if (added.length > 0) msg += `✅ **Adicionados:** ${added.join(', ')}\n`;
                    if (removed.length > 0) msg += `❌ **Removidos:** ${removed.join(', ')}\n`;
                    if (added.length === 0 && removed.length === 0) msg += `Nenhuma alteração permitida foi feita (Cargos muito altos?).`;

                    await interaction.editReply({ content: msg });
                } catch (error) {
                    console.error('[Menu de Cargos]', error);
                    await interaction.editReply({ content: 'Houve um erro ao alterar os cargos. O bot precisa ter permissão de "Gerenciar Cargos" e o cargo dele precisa estar acima dos cargos selecionados.' });
                }
            }
        }

        
        
        
        if (interaction.isButton()) {
            
            
            if (interaction.customId.startsWith('abrir_ticket_')) {
                const tempoCooldown = 3600000;
                if (cooldowns.has(interaction.user.id)) {
                    const expiracao = cooldowns.get(interaction.user.id) + tempoCooldown;
                    if (Date.now() < expiracao) {
                        const tempoRestante = Math.ceil((expiracao - Date.now()) / 60000);
                        return interaction.reply({ content: `⏳ Você está em cooldown! Aguarde **${tempoRestante} minutos** para abrir outro ticket.`, ephemeral: true });
                    }
                }
                await interaction.deferUpdate();  
                const tipoTicket = interaction.customId.split('abrir_ticket_')[1].toUpperCase();
                await interaction.editReply({ content: '⏳ Criando sua sala, aguarde...', embeds: [], components: [] });
                await TicketManager.createTicket(interaction, tipoTicket);
                cooldowns.set(interaction.user.id, Date.now());
            }

            
            if (interaction.customId === 'fechar_ticket') {
                await TicketManager.closeTicket(interaction);
            }
            if (interaction.customId === 'assumir_ticket') {
                await TicketManager.claimTicket(interaction);
            }

            
            if (interaction.customId.startsWith('config_')) {
                let modal;
                if (interaction.customId === 'config_main') {
                    modal = new ModalBuilder().setCustomId('modal_config_main').setTitle('Configurar Painel');
                    modal.addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('panel_title').setLabel('Título do Painel').setStyle(TextInputStyle.Short).setValue(TicketDatabase.getConfig('panel_title', 'Central de Ajuda')).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('panel_desc').setLabel('Descrição do Painel').setStyle(TextInputStyle.Paragraph).setValue(TicketDatabase.getConfig('panel_description', 'Nessa seção, você pode tirar suas dúvidas...')).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('panel_img').setLabel('Link da Imagem (Opcional)').setStyle(TextInputStyle.Short).setValue(TicketDatabase.getConfig('panel_image', '')).setRequired(false))
                    );
                } else {
                    let optType = interaction.customId.split('_')[1]; 
                    modal = new ModalBuilder().setCustomId(`modal_config_${optType}`).setTitle(`Configurar ${optType}`);
                    
                    const defLabel = TicketDatabase.getConfig(`opt_${optType}_label`, optType === 'denuncia' ? 'Quero fazer uma Denúncia' : optType === 'duvida' ? 'Dúvidas Gerais' : 'Contato para Parcerias');
                    const defDesc = TicketDatabase.getConfig(`opt_${optType}_desc`, 'Descrição curta no menu');
                    const defEmoji = TicketDatabase.getConfig(`opt_${optType}_emoji`, optType === 'denuncia' ? '🚨' : optType === 'duvida' ? '❓' : '🤝');
                    const defReply = TicketDatabase.getConfig(`opt_${optType}_reply`, 'Texto que aparece quando o usuário clica');

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('opt_label').setLabel('Nome no Menu').setStyle(TextInputStyle.Short).setValue(defLabel).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('opt_desc').setLabel('Descrição no Menu').setStyle(TextInputStyle.Short).setValue(defDesc).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('opt_emoji').setLabel('Emoji').setStyle(TextInputStyle.Short).setValue(defEmoji).setRequired(true)),
                        new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('opt_reply').setLabel('Mensagem gerada ao clicar').setStyle(TextInputStyle.Paragraph).setValue(defReply).setRequired(true))
                    );
                }
                await interaction.showModal(modal);
            }
        }

        
        
        
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'modal_config_main') {
                TicketDatabase.setConfig('panel_title', interaction.fields.getTextInputValue('panel_title'));
                TicketDatabase.setConfig('panel_description', interaction.fields.getTextInputValue('panel_desc'));
                TicketDatabase.setConfig('panel_image', interaction.fields.getTextInputValue('panel_img'));
                await interaction.reply({ content: '✅ Textos principais atualizados com sucesso! (Use /painel_suporte para ver as mudanças)', ephemeral: true });
            } else if (interaction.customId.startsWith('modal_config_')) {
                const optType = interaction.customId.split('modal_config_')[1];
                TicketDatabase.setConfig(`opt_${optType}_label`, interaction.fields.getTextInputValue('opt_label'));
                TicketDatabase.setConfig(`opt_${optType}_desc`, interaction.fields.getTextInputValue('opt_desc'));
                TicketDatabase.setConfig(`opt_${optType}_emoji`, interaction.fields.getTextInputValue('opt_emoji'));
                TicketDatabase.setConfig(`opt_${optType}_reply`, interaction.fields.getTextInputValue('opt_reply'));
                await interaction.reply({ content: `✅ Opção de ${optType} atualizada com sucesso! (Use /painel_suporte para ver as mudanças)`, ephemeral: true });
            }
        }
    }
};
