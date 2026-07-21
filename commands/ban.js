const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bane um usuário do servidor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário a ser banido')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('O motivo do banimento')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers), 

    async execute(interaction) {
        
        const STAFF_ROLES = [
            '1528880766979936399', 
            '1496150278108479629', 
            '1528910395656507392', 
            '1528884120439095537'
        ];
        const hasStaffRole = STAFF_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));
        
        if (!hasStaffRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas membros da equipe podem banir.', ephemeral: true });
        }

        
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            await member.ban({ reason });
            
            await interaction.editReply({ content: `O usuário **${targetUser.tag}** foi banido com sucesso.\n**Motivo:** ${reason}` });
        } catch (error) {
            console.error('[Comando Ban]', error);
            await interaction.editReply({ 
                content: `Não foi possível banir o usuário ${targetUser.tag}. Verifique se eu tenho permissão de banir membros e se o cargo do bot está acima do cargo da pessoa.`
            });
        }
    },

    async executeMessage(message, args) {
        
        const STAFF_ROLES = [
            '1528880766979936399', 
            '1496150278108479629', 
            '1528910395656507392', 
            '1528884120439095537'
        ];
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem banir.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Por favor, mencione o usuário que deseja banir. (Exemplo: `biz!ban @usuario motivo`)');
        }

        const reason = args.slice(1).join(' ') || 'Nenhum motivo fornecido';

        try {
            const member = await message.guild.members.fetch(targetUser.id);
            await member.ban({ reason });
            
            await message.reply(`O usuário **${targetUser.tag}** foi banido com sucesso.\n**Motivo:** ${reason}`);
        } catch (error) {
            console.error('[Comando Ban]', error);
            await message.reply(`Não foi possível banir o usuário ${targetUser.tag}. Verifique se eu tenho permissão de banir membros e se o meu cargo está acima do dele.`);
        }
    }
};
