const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const TicketDatabase = require('../modules/tickets/TicketDatabase.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config_metas')
        .setDescription('Configura os cargos da tabela de metas semanais (Apenas Admins).')
        .addRoleOption(opt => opt.setName('role_god').setDescription('Cargo para 50h+ (god)').setRequired(false))
        .addRoleOption(opt => opt.setName('role_ace').setDescription('Cargo para 45h+ (ace)').setRequired(false))
        .addRoleOption(opt => opt.setName('role_cry').setDescription('Cargo para 40h+ (cry)').setRequired(false))
        .addRoleOption(opt => opt.setName('role_high').setDescription('Cargo para 35h+ (high)').setRequired(false))
        .addRoleOption(opt => opt.setName('role_1st').setDescription('Cargo para 30h+ (1st)').setRequired(false))
        .addRoleOption(opt => opt.setName('role_2nd').setDescription('Cargo para 25h+ (2nd)').setRequired(false))
        .addRoleOption(opt => opt.setName('role_sub').setDescription('Cargo para 20h+ (sub)').setRequired(false))
        .addRoleOption(opt => opt.setName('role_base').setDescription('Cargo para 15h+ (Demais Cargos)').setRequired(false))
        .addChannelOption(opt => opt.setName('canal_relatorio').setDescription('Canal para receber o relatório automático no Domingo').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ Apenas administradores podem usar isso.', ephemeral: true });
        }

        const roles = ['god', 'ace', 'cry', 'high', '1st', '2nd', 'sub', 'base'];
        let mensagem = '✅ **Cargos de Metas Atualizados:**\n\n';

        for (const r of roles) {
            const roleInput = interaction.options.getRole(`role_${r}`);
            if (roleInput) {
                TicketDatabase.setConfig(`meta_role_${r}`, roleInput.id);
                mensagem += `- **${r.toUpperCase()}:** <@&${roleInput.id}>\n`;
            } else {
                const salvo = TicketDatabase.getConfig(`meta_role_${r}`, null);
                if (salvo) {
                    mensagem += `- **${r.toUpperCase()}:** <@&${salvo}> (Mantido)\n`;
                } else {
                    mensagem += `- **${r.toUpperCase()}:** Não configurado\n`;
                }
            }
        }

        const canalInput = interaction.options.getChannel('canal_relatorio');
        if (canalInput) {
            TicketDatabase.setConfig('meta_report_channel', canalInput.id);
            mensagem += `\n📁 **Canal de Relatórios:** <#${canalInput.id}>\n`;
        } else {
            const salvo = TicketDatabase.getConfig('meta_report_channel', null);
            if (salvo) {
                mensagem += `\n📁 **Canal de Relatórios:** <#${salvo}> (Mantido)\n`;
            } else {
                mensagem += `\n📁 **Canal de Relatórios:** Nenhum configurado (O bot não mandará o fechamento automático!).\n`;
            }
        }

        mensagem += '\n*(Obs: Se você não preencheu algum campo agora, mas já tinha preenchido antes, ele continua salvo!)*';
        await interaction.reply({ content: mensagem, ephemeral: true });
    },

    async executeMessage(message, args) {
        return message.reply('Por favor, use o comando `/config_metas` para facilitar a seleção de cargos usando o menu interativo do Discord!');
    }
};
