const { SlashCommandBuilder, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');
const DatabaseManager = require('../modules/voice-tracker/DatabaseManager.js');
const TicketDatabase = require('../modules/tickets/TicketDatabase.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fechar_metas')
        .setDescription('Verifica quem bateu a meta semanal, rebaixa quem falhou e zera os inativos.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Apenas administradores podem fechar as metas.', ephemeral: true });
        }

        await interaction.reply({ content: '⏳ Processando o fechamento de metas... Isso pode levar alguns segundos.', ephemeral: false });

        const relatorio = DatabaseManager.getAllUsersStats();
        
        
        const metas = [
            { nome: 'god', horasParaManter: 50, id: TicketDatabase.getConfig('meta_role_god', null) },
            { nome: 'ace', horasParaManter: 45, id: TicketDatabase.getConfig('meta_role_ace', null) },
            { nome: 'cry', horasParaManter: 40, id: TicketDatabase.getConfig('meta_role_cry', null) },
            { nome: 'high', horasParaManter: 35, id: TicketDatabase.getConfig('meta_role_high', null) },
            { nome: '1st', horasParaManter: 30, id: TicketDatabase.getConfig('meta_role_1st', null) },
            { nome: '2nd', horasParaManter: 25, id: TicketDatabase.getConfig('meta_role_2nd', null) },
            { nome: 'sub', horasParaManter: 20, id: TicketDatabase.getConfig('meta_role_sub', null) },
            { nome: 'base', horasParaManter: 15, id: TicketDatabase.getConfig('meta_role_base', null) }
        ];

        
        const allMetaRoleIds = metas.map(m => m.id).filter(id => id !== null);

        let textoRelatorio = "=== RELATÓRIO DE FECHAMENTO DE METAS ===\n\n";
        let zerados = 0;
        let rebaixados = 0;
        let mantidos = 0;

        for (const stats of relatorio) {
            try {
                const member = await interaction.guild.members.fetch(stats.id_usuario).catch(() => null);
                if (!member) continue; 

                const horasNaSemana = stats.thisWeekMs / (1000 * 60 * 60);

                
                if (stats.ultima_sessao) {
                    const dataUltimaSessao = new Date(stats.ultima_sessao + 'Z'); 
                    const agora = new Date();
                    const diffDias = (agora - dataUltimaSessao) / (1000 * 60 * 60 * 24);

                    if (diffDias >= 14) {
                        
                        DatabaseManager.resetUserTotalTime(stats.id_usuario);
                        
                        
                        for (const roleId of allMetaRoleIds) {
                            if (member.roles.cache.has(roleId)) {
                                await member.roles.remove(roleId).catch(() => {});
                            }
                        }
                        textoRelatorio += `[INATIVO ZERADO] ${member.user.tag} estava inativo há ${Math.floor(diffDias)} dias. Perdeu todos os cargos e tempo total foi a 0.\n`;
                        zerados++;
                        continue; 
                    }
                }

                
                let perdeuCargo = false;
                for (const meta of metas) {
                    if (meta.id && member.roles.cache.has(meta.id)) {
                        
                        if (horasNaSemana < meta.horasParaManter) {
                            await member.roles.remove(meta.id).catch(() => {});
                            textoRelatorio += `[REBAIXADO] ${member.user.tag} perdeu o cargo ${meta.nome.toUpperCase()} (Fez ${horasNaSemana.toFixed(1)}h / Precisava de ${meta.horasParaManter}h).\n`;
                            perdeuCargo = true;
                            rebaixados++;
                        } else {
                            textoRelatorio += `[MANTEVE] ${member.user.tag} manteve o cargo ${meta.nome.toUpperCase()} com sucesso (${horasNaSemana.toFixed(1)}h).\n`;
                            mantidos++;
                        }
                    }
                }

                
                
                if (horasNaSemana >= 20) {
                    textoRelatorio += `[ELEGÍVEL PARA UP] ${member.user.tag} fez impressionantes ${horasNaSemana.toFixed(1)}h essa semana e tem MÉRITO para subir!\n`;
                }

            } catch (error) {
                console.error(`Erro ao processar usuário ${stats.id_usuario}`, error);
            }
        }

        textoRelatorio += `\n\n=== RESUMO ===\nInativos Zerados: ${zerados}\nRebaixados: ${rebaixados}\nMantiveram a patente: ${mantidos}\n`;

        
        const buffer = Buffer.from(textoRelatorio, 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: 'relatorio_metas.txt' });

        await interaction.editReply({ 
            content: `✅ **Fechamento concluído!** Baixe o relatório em texto abaixo para ver o que aconteceu detalhadamente com cada membro (quem foi zerado por inatividade e quem perdeu cargo por não bater as horas).`,
            files: [attachment] 
        });
    },

    async executeMessage(message, args) {
        return message.reply('Por favor, use o comando `/fechar_metas` para rodar o fechamento e baixar o relatório.');
    }
};
