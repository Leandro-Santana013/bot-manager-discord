const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Desbane um usuário do servidor usando o ID.')
        .addStringOption(option => 
            option.setName('usuario_id')
                .setDescription('O ID da conta do usuário a ser desbanido')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), 

    async execute(interaction) {
        
        if (interaction.member.roles.cache.has('1528884101212541150') && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Membros com o cargo Castle Guardian não têm permissão para desbanir.', ephemeral: true });
        }

        
        const STAFF_ROLES = [
            '1528880766979936399', 
            '1496150278108479629', 
            '1528910395656507392', 
            '1528884120439095537'
        ];
        const hasStaffRole = STAFF_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));
        
        if (!hasStaffRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas membros da equipe podem desbanir.', ephemeral: true });
        }

        
        await interaction.deferReply();

        const userId = interaction.options.getString('usuario_id');

        try {
            
            await interaction.guild.members.unban(userId);
            
            await interaction.editReply({ content: `O usuário com o ID **${userId}** foi desbanido com sucesso e já pode voltar ao servidor!` });
        } catch (error) {
            console.error('[Comando Unban]', error);
            await interaction.editReply({ 
                content: `Não foi possível desbanir o ID **${userId}**. \nVerifique se o ID está correto, se o usuário realmente está banido e se o bot tem permissão de Administrador/Banir.`
            });
        }
    },

    async executeMessage(message, args) {
        
        if (message.member.roles.cache.has('1528884101212541150') && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Membros com o cargo Castle Guardian não têm permissão para desbanir.');
        }

        
        const STAFF_ROLES = [
            '1528880766979936399', 
            '1496150278108479629', 
            '1528910395656507392', 
            '1528884120439095537'
        ];
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem desbanir.');
        }

        const userId = args[0];
        if (!userId) {
            return message.reply('Por favor, informe o ID do usuário que deseja desbanir. (Exemplo: `biz!unban 123456789123456789`)');
        }

        try {
            await message.guild.members.unban(userId);
            
            await message.reply(`O usuário com o ID **${userId}** foi desbanido com sucesso e já pode voltar ao servidor!`);
        } catch (error) {
            console.error('[Comando Unban]', error);
            await message.reply(`Não foi possível desbanir o ID **${userId}**. \nVerifique se o ID está correto, se o usuário realmente está banido e se o bot tem permissão de Administrador/Banir.`);
        }
    }
};
