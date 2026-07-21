const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');


// ==============================================================
// 🔴 ALTERE AQUI: IDs dos cargos da Equipe/Staff (Admin/Mods)
// ==============================================================
const STAFF_ROLES = [
    '1528880766979936399', 
    '1496150278108479629', 
    '1528910395656507392', 
    '1528884120439095537'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restringir')
        .setDescription('Aplica um castigo (Timeout) em um membro, impedindo-o de falar e mandar mensagens.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário que vai para o castigo')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('tempo')
                .setDescription('O tempo do castigo em MINUTOS (ex: 10 para 10 minutos)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320)) 
        .addStringOption(option => 
            option.setName('motivo')
                .setDescription('Motivo do castigo')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        
        const hasStaffRole = STAFF_ROLES.some(roleId => interaction.member.roles.cache.has(roleId));
        if (!hasStaffRole && !interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: '❌ Apenas membros da equipe podem castigar usuários.', ephemeral: true });
        }

        await interaction.deferReply();

        const targetUser = interaction.options.getUser('usuario');
        const tempoMinutos = interaction.options.getInteger('tempo');
        const motivo = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

        try {
            const member = await interaction.guild.members.fetch(targetUser.id);
            
            
            if (member.permissions.has('Administrator') || member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.editReply({ content: `❌ Eu não posso castigar o usuário **${targetUser.tag}**. Ele possui permissões maiores ou iguais às minhas.` });
            }

            
            const durationMs = tempoMinutos * 60 * 1000;
            
            
            await member.timeout(durationMs, motivo);

            await interaction.editReply({ content: `🤐 O membro **${targetUser.tag}** foi restringido (castigado) por **${tempoMinutos} minuto(s)**.\n**Motivo:** ${motivo}` });
        } catch (error) {
            console.error('[Comando Restringir]', error);
            await interaction.editReply({ content: 'Houve um erro ao tentar restringir o membro. Verifique se eu tenho a permissão de "Moderar Membros".' });
        }
    },

    async executeMessage(message, args) {
        
        const hasStaffRole = STAFF_ROLES.some(roleId => message.member.roles.cache.has(roleId));
        if (!hasStaffRole && !message.member.permissions.has('Administrator')) {
            return message.reply('❌ Apenas membros da equipe podem castigar usuários.');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ Por favor, mencione quem você deseja restringir. (Ex: `biz!restringir @membro 10 motivo`)');
        }

        const tempoMinutos = parseInt(args[1]);
        if (!tempoMinutos || isNaN(tempoMinutos) || tempoMinutos < 1) {
            return message.reply('❌ Você precisa informar um tempo válido em minutos! (Ex: `biz!restringir @membro 10 motivo`)');
        }

        const motivo = args.slice(2).join(' ') || 'Nenhum motivo fornecido';

        try {
            const member = await message.guild.members.fetch(targetUser.id);
            
            if (member.permissions.has('Administrator') || member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                return message.reply(`❌ Eu não posso castigar o usuário **${targetUser.tag}**. Ele possui permissões maiores ou iguais às minhas.`);
            }

            const durationMs = tempoMinutos * 60 * 1000;
            await member.timeout(durationMs, motivo);

            await message.reply(`🤐 O membro **${targetUser.tag}** foi restringido (castigado) por **${tempoMinutos} minuto(s)**.\n**Motivo:** ${motivo}`);
        } catch (error) {
            console.error('[Comando Restringir]', error);
            await message.reply('Houve um erro ao tentar restringir o membro. Verifique se eu tenho a permissão de "Moderar Membros".');
        }
    }
};
