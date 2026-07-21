const cron = require('node-cron');
const { AttachmentBuilder } = require('discord.js');
const DatabaseManager = require('../modules/voice-tracker/DatabaseManager.js');
const TicketDatabase = require('../modules/tickets/TicketDatabase.js');

module.exports = {
    iniciar(client) {
        
        
        cron.schedule('59 23 * * 0', async () => {
            console.log('[Cron] Iniciando o fechamento automático de metas...');
            
            try {
                
                const channelId = TicketDatabase.getConfig('meta_report_channel', null);
                if (!channelId) {
                    console.log('[Cron] Fechamento abortado: Nenhum canal de relatório configurado. Use /config_metas');
                    return;
                }

                const channel = await client.channels.fetch(channelId).catch(() => null);
                if (!channel) {
                    console.log(`[Cron] Erro: Canal de relatório ${channelId} não encontrado no Discord.`);
                    return;
                }

                await channel.send('⏳ Iniciando o fechamento automático das metas semanais...');

                
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

                let textoRelatorio = "=== FECHAMENTO AUTOMÁTICO DE METAS ===\n\n";
                let zerados = 0;
                let rebaixados = 0;
                let mantidos = 0;

                
                const guild = channel.guild;

                for (const stats of relatorio) {
                    try {
                        const member = await guild.members.fetch(stats.id_usuario).catch(() => null);
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
                                textoRelatorio += `[INATIVO ZERADO] ${member.user.tag} estava inativo há ${Math.floor(diffDias)} dias. Perdeu todos os cargos.\n`;
                                zerados++;
                                continue;
                            }
                        }

                        
                        for (const meta of metas) {
                            if (meta.id && member.roles.cache.has(meta.id)) {
                                if (horasNaSemana < meta.horasParaManter) {
                                    await member.roles.remove(meta.id).catch(() => {});
                                    textoRelatorio += `[REBAIXADO] ${member.user.tag} perdeu o cargo ${meta.nome.toUpperCase()} (Fez ${horasNaSemana.toFixed(1)}h / Meta: ${meta.horasParaManter}h).\n`;
                                    rebaixados++;
                                } else {
                                    textoRelatorio += `[MANTEVE] ${member.user.tag} manteve o cargo ${meta.nome.toUpperCase()} (${horasNaSemana.toFixed(1)}h).\n`;
                                    mantidos++;
                                }
                            }
                        }

                        
                        if (horasNaSemana >= 20) {
                            textoRelatorio += `[ELEGÍVEL PARA UP] ${member.user.tag} fez ${horasNaSemana.toFixed(1)}h essa semana e tem mérito para subir!\n`;
                        }

                    } catch (error) {
                        console.error(`[Cron] Erro ao processar usuário ${stats.id_usuario}`, error);
                    }
                }

                textoRelatorio += `\n\n=== RESUMO ===\nInativos Zerados: ${zerados}\nRebaixados: ${rebaixados}\nMantiveram a patente: ${mantidos}\n`;

                const buffer = Buffer.from(textoRelatorio, 'utf-8');
                const attachment = new AttachmentBuilder(buffer, { name: 'fechamento_automatico.txt' });

                await channel.send({ 
                    content: `✅ **Fechamento Automático Concluído!** (Executado no Domingo às 23:59)\nAqui está o relatório da semana:`,
                    files: [attachment] 
                });

            } catch (cronError) {
                console.error('[Cron] Falha no fechamento automático', cronError);
            }
        });
        console.log('[Cron] Fechamento automático de metas agendado para todo Domingo às 23:59.');
    }
};
