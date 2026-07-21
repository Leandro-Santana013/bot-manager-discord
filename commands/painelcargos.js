const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('painel_cargos')
        .setDescription('Envia o painel de gerenciamento de cargos (Apenas Staff).'),

    async execute(interaction) {
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
            return interaction.reply({ content: '❌ Apenas membros da equipe podem usar o painel de cargos.', ephemeral: true });
        }
        const embed = new EmbedBuilder()
            .setTitle('Gerenciamento de Cargos 🛡️')
            .setDescription('Selecione um membro no menu abaixo para gerenciar os cargos dele.\n\n⚠️ **Atenção:** Só adicione cargos autorizados.')
            .setColor('#2F3136');

        const row = new ActionRowBuilder()
            .addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId('menu_selecionar_usuario_cargo')
                    .setPlaceholder('Selecione o membro...')
            );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Painel de gerenciamento de cargos enviado com sucesso!', ephemeral: true });
    },

    async executeMessage(message, args) {
        // ==============================================================
// 🔴 ALTERE AQUI: IDs dos cargos da Equipe/Staff (Admin/Mods)
// ==============================================================
const STAFF_ROLES = [
            '1528880766979936399', 
            '1496150278108479629', 
            '1528910395656507392', 
            '1528884120439095537'
        ];
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem usar o painel de cargos.');
        }

        const embed = new EmbedBuilder()
            .setTitle('Gerenciamento de Cargos 🛡️')
            .setDescription('Selecione um membro no menu abaixo para gerenciar os cargos dele.\n\n⚠️ **Atenção:** Só adicione cargos autorizados.')
            .setColor('#2F3136');

        const row = new ActionRowBuilder()
            .addComponents(
                new UserSelectMenuBuilder()
                    .setCustomId('menu_selecionar_usuario_cargo')
                    .setPlaceholder('Selecione o membro...')
            );

        if (message.deletable) message.delete().catch(()=>{});
        await message.channel.send({ embeds: [embed], components: [row] });
    }
};
