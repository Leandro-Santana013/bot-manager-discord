const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


const STAFF_ROLES = [
    '1528880766979936399', 
    '1496150278108479629', 
    '1528910395656507392', 
    '1528884120439095537'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('desrestringir')
        .setDescription('Remove o castigo (Timeout) de um membro, permitindo-o falar e mandar mensagens novamente.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que vai ser liberado do castigo')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        
        const hasStaffRole = STAFF_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasStaffRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas membros da equipe podem remover castigos.', ephemeral: true });
        }

        await interaction.deferReply();

        const targetUser = interaction.options.getUser('usuario');

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            
            
            if (member.permissions.has('Administrator') || member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.editReply({ content: `❌ Eu não posso gerenciar o usuário **${targetUser.tag}**.` });
            }

            
            if (!member.isCommunicationDisabled()) {
                return interaction.editReply({ content: `⚠️ O membro **${targetUser.tag}** já está livre. Ele não possui um castigo ativo.` });
            }
            
            
            await member.timeout(null, 'Remoção antecipada do castigo.');

            await interaction.editReply({ content: `🕊️ O membro **${targetUser.tag}** foi desrestringido e já pode falar novamente!` });
        } catch (error) {
            console.error('[Comando Desrestringir]', error);
            await interaction.editReply({ content: 'Houve um erro ao tentar liberar o membro. Verifique se eu tenho a permissão de "Moderar Membros".' });
        }
    },

    async executeMessage(message, args) {
        
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem remover castigos.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Por favor, mencione quem você deseja liberar. (Ex: `biz!desrestringir @membro`)');
        }

        try {
            const member = await message.guild.members.fetch(targetUser.id);
            
            if (member.permissions.has('Administrator') || member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                return message.reply(`❌ Eu não posso gerenciar o usuário **${targetUser.tag}**.`);
            }

            if (!member.isCommunicationDisabled()) {
                return message.reply(`⚠️ O membro **${targetUser.tag}** já está livre. Ele não possui um castigo ativo.`);
            }

            await member.timeout(null, 'Remoção antecipada do castigo.');

            await message.reply(`🕊️ O membro **${targetUser.tag}** foi desrestringido e já pode falar novamente!`);
        } catch (error) {
            console.error('[Comando Desrestringir]', error);
            await message.reply('Houve um erro ao tentar liberar o membro. Verifique se eu tenho a permissão de "Moderar Membros".');
        }
    }
};
